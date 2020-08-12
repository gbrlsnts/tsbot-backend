import * as jimp from 'jimp';
import { Brackets, getConnection } from 'typeorm';
import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IconRepository } from './icon.repository';
import { Icon } from './icon.entity';
import { IconContentRepository } from './icon-content.repository';
import { UploadIconDto } from './dto/upload-icon.dto';
import { Server } from '../servers/server.entity';
import { DbErrorCodes } from '../shared/database/codes';
import { iconAlreadyExists } from '../shared/messages/server.messages';
import { IconContent } from './icon-content.entity';
import { invalidMime, invalidFileImage } from '../shared/messages/icon.messages';

@Injectable()
export class IconsService {
  constructor(
    @InjectRepository(IconRepository)
    private iconRepository: IconRepository,
    @InjectRepository(IconContentRepository)
    private contentRepository: IconContentRepository,
  ) {}

  /**
   * Get all icons of a server
   * @param serverId 
   */
  getAllIconsByServer(serverId: number): Promise<Icon[]> {
    return this.iconRepository.find({
      where: { serverId }
    });
  }

  /**
   * Get an icon by id
   * @param id 
   * @throws NotFoundException
   */
  async getIconById(id: string): Promise<Icon> {
    const icon = await this.iconRepository.findOne({
      where: { id }
    });

    if(!icon) throw new NotFoundException();

    return icon;
  }

  /**
   * Get an icon content by icon id
   * @param id 
   * @throws NotFoundException
   */
  async getIconContentById(id: string): Promise<IconContent> {
    const icon = await this.contentRepository.findOne({
      where: { id },
      relations: ['icon'],
      cache: true,
    });

    if(!icon) throw new NotFoundException();

    return icon;
  }

  /**
   * Upload an icon
   * @param userId user uploading the icon
   * @param serverId server id to link the icon
   * @param dto icon data
   * @throws ConflictException when there's a duplicate tsId in a server
   */
  async uploadIcon(userId: number, serverId: number, dto: UploadIconDto): Promise<Icon> {
    const { tsId, content: encodedContent } = dto;

    const content = Buffer.from(encodedContent, 'base64');
    const mime = await this.getIconMime(content);

    const icon = this.iconRepository.create({
      serverId,
      tsId,
      mime,
      uploadedById: userId,
    });

    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const saved = await this.iconRepository.save(icon, { transaction: false });

      await this.contentRepository.save({
        id: saved.id,
        content,
      }, { transaction: false });

      await queryRunner.commitTransaction();

      return saved;
    } catch(e) {
      await queryRunner.rollbackTransaction();

      if(e.code ==  DbErrorCodes.DuplicateKey)
        throw new ConflictException(iconAlreadyExists);
      
      throw e;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Delete an icon
   * @param userId user id deleting the icon
   * @param id 
   * @throws NotFoundException
   */
  async deleteIcon(userId: number, id: number): Promise<void> {
    const permQb = this.iconRepository
      .createQueryBuilder('i')
      .select('i.id')
      .innerJoin(Server, 's')
      .where('i.id = :id', { id })
      .andWhere(new Brackets(qb => {
        qb.where('s.ownerId = :userId', { userId })
          .orWhere('i.uploadedById = :userId', { userId });
      }));

    const result = await this.iconRepository
      .createQueryBuilder('icon')
      .delete()
      .where(`icon.id IN (${permQb.getQuery()})`)
      .setParameters(permQb.getParameters())
      .execute();

    if(result.affected > 0) throw new NotFoundException();
  }

  /**
   * Gets the icon mime type
   * @param content icon content
   * @throws BadRequestException if is not a valid type (png/jpeg)
   */
  private async getIconMime(content: Buffer): Promise<string> {
    const valid = ['image/png', 'image/jpeg'];
    let mime;

    try {
      const image = await jimp.read(content);
      mime = image.getMIME();
    } catch(e) {
      throw new BadRequestException(invalidFileImage);
    }

    if(!valid.includes(mime))
      throw new BadRequestException(invalidMime(valid));

    return mime;
  }
}