import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ServerGroupRepository } from '../repository/server-group.repository';
import { ServerGroup } from '../server-group.entity';
import { TsGroupsService } from './ts-groups.service';

@Injectable()
export class ServerGroupsService extends TsGroupsService<ServerGroup> {
  constructor(
    @InjectRepository(ServerGroupRepository)
    groupRepository: ServerGroupRepository,
  ) {
    super(groupRepository);
  }
}
