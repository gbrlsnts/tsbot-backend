import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TsGroupsService } from './ts-groups.service';
import { ChannelGroup } from '../channel-group.entity';
import { ChannelGroupRepository } from '../repository/channel-group.repository';

@Injectable()
export class ChannelGroupsService extends TsGroupsService<ChannelGroup> {
  constructor(
    @InjectRepository(ChannelGroupRepository)
    groupRepository: ChannelGroupRepository,
  ) {
    super(groupRepository);
  }
}
