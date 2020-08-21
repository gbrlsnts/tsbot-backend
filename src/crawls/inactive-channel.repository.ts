import { Repository, EntityRepository } from 'typeorm';
import { InactiveChannel } from './inactive-channel.entity';

@EntityRepository(InactiveChannel)
export class InactiveChannelRepository extends Repository<InactiveChannel> {}
