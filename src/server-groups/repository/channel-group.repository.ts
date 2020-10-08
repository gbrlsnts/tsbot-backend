import { EntityRepository } from 'typeorm';
import { ChannelGroup } from '../channel-group.entity';
import { TsGroupRepository } from './ts-group.repository';

@EntityRepository(ChannelGroup)
export class ChannelGroupRepository extends TsGroupRepository<ChannelGroup> {
  // eslint-disable-next-line @typescript-eslint/ban-types
  getEntityType(): Function {
    return ChannelGroup;
  }
}
