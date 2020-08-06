import { Repository, EntityRepository } from 'typeorm';
import { GroupConfig } from './group-config.entity';

@EntityRepository(GroupConfig)
export class GroupConfigRepository extends Repository<GroupConfig> {}
