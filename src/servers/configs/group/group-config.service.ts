import { Injectable } from '@nestjs/common';
import { GroupCategoryRepository } from './group-category.repository';
import { GroupConfigRepository } from './group-config.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { GroupCategory } from './group-category.entity';

@Injectable()
export class GroupConfigService {
  constructor(
    @InjectRepository(GroupCategoryRepository)
    private categoryRepository: GroupCategoryRepository,
    @InjectRepository(GroupConfigRepository)
    private configRepository: GroupConfigRepository,
  ) {}

  getAllCategoriesByServer(serverId: number): Promise<GroupCategory[]> {
    return this.categoryRepository.find({
      where: { serverId },
    });
  }
}
