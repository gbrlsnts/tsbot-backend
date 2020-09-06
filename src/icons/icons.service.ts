import * as jimp from 'jimp';
import { Brackets, Connection } from 'typeorm';
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IconRepository } from './icon.repository';
import { Icon } from './icon.entity';
import { IconContentRepository } from './icon-content.repository';
import { UploadIconDto } from './dto/upload-icon.dto';
import { Server } from '../servers/server.entity';
import { DbErrorCodes } from '../shared/database/codes';
import { iconAlreadyExists } from '../shared/messages/server.messages';
import { IconContent } from './icon-content.entity';
import {
  invalidMime,
  invalidFileImage,
} from '../shared/messages/icon.messages';
import { TsIconService } from '../teamspeak/icons.service';

@Injectable()
export class IconsService {
  constructor(
    @InjectRepository(IconRepository)
    private iconRepository: IconRepository,
    @InjectRepository(IconContentRepository)
    private contentRepository: IconContentRepository,
    private tsIconService: TsIconService,
    private connection: Connection,
  ) {}

  /**
   * Get all icons of a server
   * @param serverId
   */
  getAllIconsByServer(serverId: number): Promise<Icon[]> {
    return this.iconRepository.find({
      where: { serverId },
    });
  }

  /**
   * Get an icon by id
   * @param id
   * @throws NotFoundException
   */
  async getIconById(id: string): Promise<Icon> {
    const icon = await this.iconRepository.findOne({
      where: { id },
    });

    if (!icon) throw new NotFoundException();

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

    if (!icon) throw new NotFoundException();

    return icon;
  }

  /**
   * Upload an icon
   * @param userId user uploading the icon
   * @param serverId server id to link the icon
   * @param dto icon data
   * @throws ConflictException when there's a duplicate tsId in a server
   */
  async uploadIcon(
    userId: number,
    serverId: number,
    dto: UploadIconDto,
  ): Promise<Icon> {
    const { tsId, content: encodedContent } = dto;

    const content = Buffer.from(encodedContent, 'base64');
    const mime = await this.getIconMime(content);

    const icon = this.iconRepository.create({
      serverId,
      tsId,
      mime,
      uploadedById: userId,
    });

    try {
      let saved: Icon;

      await this.connection.transaction(async manager => {
        saved = await manager.save(icon);

        const iconContent = this.contentRepository.create({
          id: saved.id,
          content,
        });

        await manager.save(iconContent);
      });

      return saved;
    } catch (e) {
      if (e.code == DbErrorCodes.DuplicateKey)
        throw new ConflictException(iconAlreadyExists);

      throw e;
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
      .andWhere(
        new Brackets(qb => {
          qb.where('s.ownerId = :userId', {
            userId,
          }).orWhere('i.uploadedById = :userId', { userId });
        }),
      );

    const result = await this.iconRepository
      .createQueryBuilder('icon')
      .delete()
      .where(`icon.id IN (${permQb.getQuery()})`)
      .setParameters(permQb.getParameters())
      .execute();

    if (result.affected > 0) throw new NotFoundException();
  }

  /**
   * Sync icons from server to database
   * @param serverId server id
   * @param icons icon ids to sync
   */
  async syncServerIcons(serverId: number, icons: number[]): Promise<void> {
    const [dbIcons, tsIcons] = await Promise.all([
      this.getAllIconsByServer(serverId),
      this.tsIconService.getIcons(serverId, icons),
    ]);

    const toInsert = await Promise.all(
      tsIcons
        .filter(tsI => !dbIcons.find(i => i.tsId === tsI.iconId))
        .map(async i => {
          const content = Buffer.from(i.content, 'base64');
          const mime = await this.getIconMime(content);

          return {
            tsId: i.iconId,
            serverId,
            mime,
            data: { content },
          };
        }),
    );

    const toDelete = dbIcons.filter(
      i => !tsIcons.find(tsI => tsI.iconId === i.tsId),
    );

    await this.connection.transaction(async manager => {
      await Promise.all([
        manager.delete(Icon, toDelete),
        manager.insert(Icon, toInsert),
      ]);
    });
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
    } catch (e) {
      throw new BadRequestException(invalidFileImage);
    }

    if (!valid.includes(mime))
      throw new BadRequestException(invalidMime(valid));

    return mime;
  }
}
