import { getConnection, SelectQueryBuilder } from 'typeorm';
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
   * @param id
   * @throws NotFoundException when the category doesn't exist
   */
  getCategoryById(
    options: CategoryFindOptionsDto,
    withGroups = false,
  ): Promise<GroupCategory> {
    return this.getCategorySelectQuery(options, withGroups).getOne();
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
   * @param dto category data
   * @throws NotFoundException when the category doesn't exist
   * @throws ConflictException if the category name exists in the server
   */
  async updateCategory(
    id: number,
    dto: UpdateCategoryDto,
  ): Promise<GroupCategory> {
    const { name } = dto;
    const groups = new Set(dto.groups); // remove dupes

    let category = await this.getCategoryById({ id });
    const { id: categoryId } = category;

    if (groups && groups.size > 0) {
      const groupsValid = await this.groupsService.checkGroupsByServer(
        category.serverId,
        Array.from(groups),
      );
      if (!groupsValid) throw new BadRequestException(containsInvalidGroups);
    }

    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (name) {
        category.name = name;

        category = await this.categoryRepository.save(category, {
          transaction: false,
        });
      }

      await this.setCategoryGroups(categoryId, groups);

      await queryRunner.commitTransaction();

      return this.getCategoryById({ id }, true);
    } catch (e) {
      await queryRunner.rollbackTransaction();

      if (e.code == DbErrorCodes.DuplicateKey)
        throw new ConflictException(categoryAlreadyExists);

      throw e;
    } finally {
      await queryRunner.release();
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

    if (configCount > 0) throw new BadRequestException(categoryHasConfigs);

    const result = await this.categoryRepository.delete(id);

    if (result.affected === 0) throw new NotFoundException();
  }

  /**
   * Set groups for a category. Doesn't run in a transaction.
   * @param categoryId
   * @param groups
   */
  private async setCategoryGroups(
    categoryId: number,
    groups: Set<number>,
  ): Promise<void> {
    if (groups) {
      await this.configRepository.delete({ categoryId });
    }

    if (groups && groups.size > 0) {
      const configs = this.configRepository.create(
        Array.from(groups).map(groupId => ({
          groupId,
          categoryId,
        })),
      );

      await this.configRepository.save(configs, {
        transaction: false,
      });
    }
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
