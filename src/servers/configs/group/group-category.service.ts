import { SelectQueryBuilder, Connection } from 'typeorm';
import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GroupCategoryRepository } from './group-category.repository';
import { GroupCategory } from './group-category.entity';
import { GroupConfig } from './group-config.entity';
import { ServerGroup } from '../../../server-groups/server-group.entity';
import { DbErrorCodes } from '../../../shared/database/codes';
import {
  categoryAlreadyExists,
  categoryHasConfigs,
  containsInvalidGroups,
} from '../../../shared/messages/server.messages';
import { CreateCategoryDto } from './dto/create-category.dto';
import { GroupConfigRepository } from './group-config.repository';
import { ServerGroupsService } from '../../../server-groups/server-groups.service';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryFindOptionsDto } from './dto/category-find.dto';

@Injectable()
export class GroupCategoryService {
  constructor(
    @InjectRepository(GroupCategoryRepository)
    private categoryRepository: GroupCategoryRepository,
    @InjectRepository(GroupConfigRepository)
    private configRepository: GroupConfigRepository,
    private groupsService: ServerGroupsService,
    private connection: Connection,
  ) {}

  /**
   * Get all categories by server id
   * @param serverId
   * @param withGroups if the result should include related groups
   */
  getAllCategoriesByServer(
    serverId: number,
    withGroups = false,
  ): Promise<GroupCategory[]> {
    return this.getCategorySelectQuery({ serverId }, withGroups).getMany();
  }

  /**
   * Get a category by id
   * @param options find options
   * @param withGroups if groups should be fetched
   * @throws NotFoundException when the category doesn't exist
   */
  async getCategoryById(
    options: CategoryFindOptionsDto,
    withGroups = false,
  ): Promise<GroupCategory> {
    const category = await this.getCategorySelectQuery(
      options,
      withGroups,
    ).getOne();

    if (!category) throw new NotFoundException();

    return category;
  }

  /**
   * Create a category
   * @param serverId server to link the category
   * @param dto category data
   * @throws ConflictException if the category name exists in the server
   */
  async createCategory(
    serverId: number,
    dto: CreateCategoryDto,
  ): Promise<GroupCategory> {
    try {
      const category = this.categoryRepository.create({
        ...dto,
        serverId,
      });

      return await this.categoryRepository.save(category);
    } catch (e) {
      if (e.code == DbErrorCodes.DuplicateKey)
        throw new ConflictException(categoryAlreadyExists);

      throw e;
    }
  }

  /**
   * Update a category
   * @param id
   * @param serverId server id
   * @param dto category data
   * @throws NotFoundException when the category doesn't exist
   * @throws ConflictException if the category name exists in the server
   */
  async updateCategory(
    id: number,
    serverId: number,
    dto: UpdateCategoryDto,
  ): Promise<GroupCategory> {
    const { name } = dto;
    const groups = new Set(dto.groups); // remove dupes

    let category = await this.getCategoryById({ id, serverId });
    const { id: categoryId } = category;

    if (groups && groups.size > 0) {
      const groupsValid = await this.groupsService.checkGroupsByServer(
        category.serverId,
        Array.from(groups),
      );
      if (!groupsValid) throw new BadRequestException(containsInvalidGroups);
    }

    try {
      await this.connection.transaction(async manager => {
        if (name) {
          category.name = name;
          category = await manager.save(category);
        }

        await this.configRepository.setCategoryGroups(
          categoryId,
          groups,
          manager,
        );
      });

      return this.getCategoryById({ id }, true);
    } catch (e) {
      if (e.code == DbErrorCodes.DuplicateKey)
        throw new ConflictException(categoryAlreadyExists);

      throw e;
    }
  }

  /**
   * Delete a category
   * @param options find options
   * @throws BadRequestException if there are associated categories
   * @throws NotFoundException when no records were deleted
   */
  async deleteCategory(options: CategoryFindOptionsDto): Promise<void> {
    if (Object.keys(options).length === 0)
      throw new Error('options cannot be empty');

    const configCount = await this.categoryRepository
      .createQueryBuilder('c')
      .innerJoin(GroupConfig, 'conf', 'c.id = conf.categoryId')
      .where('c.id = :id', { id: options.id })
      .getCount();

    if (configCount > 0) throw new BadRequestException(categoryHasConfigs);

    const result = await this.categoryRepository.delete(options);

    if (result.affected === 0) throw new NotFoundException();
  }

  /**
   * Builds a select query for one or more categories
   * @param options find options
   * @param withGroups if linked groups should be retrieved
   */
  private getCategorySelectQuery(
    options: CategoryFindOptionsDto,
    withGroups = false,
  ): SelectQueryBuilder<GroupCategory> {
    const { id, serverId } = options;

    if (Object.keys(options).length === 0)
      throw new Error('options cannot be empty');

    const builder = this.categoryRepository.createQueryBuilder('c');

    if (withGroups) {
      builder
        .leftJoinAndMapMany(
          'c.configs',
          GroupConfig,
          'conf',
          'c.id = conf.categoryId',
        )
        .leftJoinAndMapOne(
          'conf.group',
          ServerGroup,
          'g',
          'conf.groupId = g.id',
        );
    }

    if (id) builder.andWhere('c.id = :id', { id });

    if (serverId) builder.andWhere('c.serverId = :serverId', { serverId });

    return builder;
  }
}
