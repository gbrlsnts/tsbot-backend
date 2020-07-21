import { ChannelConfigRepository } from './channel-config.repository';
import { InjectRepository } from '@nestjs/typeorm';

export class ChannelConfigService {
  constructor(
    @InjectRepository(ChannelConfigRepository)
    private configRepository: ChannelConfigRepository
  ) {}
}