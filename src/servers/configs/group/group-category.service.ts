import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { GroupCategoryRepository } from './group-category.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { GroupCategory } from './group-category.entity';
import { GroupConfig } from './group-config.entity';
import { ServerGroup } from '../../../server-groups/server-group.entity';
import { DbErrorCodes } from '../../../shared/database/codes';
import { categoryAlreadyExists, categoryHasConfigs } from '../../../shared/messages/server.messages';
import { GroupCategoryDto } from './dto/category.dto';

@Injectable()
export class GroupCategoryService {
  constructor(
    @InjectRepository(GroupCategoryRepository)
    private categoryRepository: GroupCategoryRepository
  ) {}

  /**
   * Get all categories by server id
   * @param serverId 
   * @param withGroups if the result should include related groups
   */
  getAllCategoriesByServer(serverId: number, withGroups = false): Promise<GroupCategory[]> {
    const builder = this.categoryRepository
      .createQueryBuilder('c')
      
    if(withGroups) {
      builder
        .leftJoinAndMapMany('c.configs', GroupConfig, 'conf', 'c.id = conf.categoryId')
        .leftJoinAndMapOne('conf.group', ServerGroup, 'g', 'conf.groupId = g.id');
    }

    return builder
      .where('c.serverId = :serverId', { serverId })
      .getMany();
  }

  /**
   * Get a category by id
   * @param id 
   * @throws NotFoundException when the category doesn't exist
   */
  async getCategoryById(id: number): Promise<GroupCategory> {
    const category = await this.categoryRepository.findOne({
      where: { id },
    });

    if(!category) throw new NotFoundException();

    return category;
  }

  /**
   * Get a category by id and server
   * @param id 
   * @param serverId 
   * @throws NotFoundException when the category doesn't exist
   */
  async getCategoryServerById(id: number, serverId: number): Promise<GroupCategory> {
    const category = await this.categoryRepository.findOne({
      where: { id, serverId },
    });

    if(!category) throw new NotFoundException();

    return category;
  }

  /**
   * Create a category
   * @param serverId server to link the category
   * @param dto category data
   * @throws ConflictException if the category name exists in the server
   */
  async createCategory(serverId: number, dto: GroupCategoryDto): Promise<GroupCategory> {
    try {
      const category = this.categoryRepository.create({
        ...dto,
        serverId,
      });

      return await this.categoryRepository.save(category);
    } catch (e) {
      if(e.code == DbErrorCodes.DuplicateKey)
        throw new ConflictException(categoryAlreadyExists);

      throw e;
    }
  }

  /**
   * Update a category
   * @param id 
   * @param dto category data
   * @throws NotFoundException when the category doesn't exist
   * @throws ConflictException if the category name exists in the server
   */
  async updateCategory(id: number, dto: GroupCategoryDto): Promise<GroupCategory> {
    try {
      const category = await this.getCategoryById(id);

      Object.assign(category, dto);

      return await  this.categoryRepository.save(category);
    } catch (e) {
      if(e.code == DbErrorCodes.DuplicateKey)
        throw new ConflictException(categoryAlreadyExists);

      throw e;
    }
  }

  /**
   * Delete a category
   * @param id
   * @throws BadRequestException if there are associated categories
   * @throws NotFoundException when no records were deleted
   */
  async deleteCategory(id: number): Promise<void> {
    const configCount = await this.categoryRepository
      .createQueryBuilder('c')
      .innerJoin(GroupConfig, 'conf', 'c.id = conf.categoryId')
      .where('c.id = :id', { id })
      .getCount();

    if(configCount > 0) throw new BadRequestException(categoryHasConfigs);

    const result = await this.categoryRepository.delete(id);

    if(result.affected === 0) throw new NotFoundException();
  }
}
