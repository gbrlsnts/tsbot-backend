import { Repository, EntityRepository } from 'typeorm';
import { ChannelConfigPermission } from './channel-perm.entity';

@EntityRepository(ChannelConfigPermission)
export class ChannelConfigPermissionRepository extends Repository<
  ChannelConfigPermission
> {}
