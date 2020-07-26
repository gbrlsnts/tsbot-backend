import { Repository, EntityRepository } from 'typeorm';
import { ChannelConfig } from './channel-config.entity';

@EntityRepository(ChannelConfig)
export class ChannelConfigRepository extends Repository<ChannelConfig> {}
