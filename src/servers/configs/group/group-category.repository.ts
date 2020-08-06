import { Repository, EntityRepository } from 'typeorm';
import { GroupCategory } from './group-category.entity';

@EntityRepository(GroupCategory)
export class GroupCategoryRepository extends Repository<GroupCategory> {}
