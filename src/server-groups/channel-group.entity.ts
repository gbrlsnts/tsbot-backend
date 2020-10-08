import { Entity, Unique } from 'typeorm';
import { TsGroup } from './ts-group.entity';

@Entity()
@Unique('uniq_channel_group', ['tsId', 'serverId'])
export class ChannelGroup extends TsGroup {}
