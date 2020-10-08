import { Entity, Unique, OneToOne } from 'typeorm';
import { GroupConfig } from '../servers/configs/group/group-config.entity';
import { TsGroup } from './ts-group.entity';

@Entity()
@Unique('uniq_server_group', ['tsId', 'serverId'])
export class ServerGroup extends TsGroup {
  @OneToOne(
    () => GroupConfig,
    config => config.group,
  )
  config: GroupConfig;
}
