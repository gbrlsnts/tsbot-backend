import { Module } from '@nestjs/common';
import { UserChannelService } from './user-channel.service';

@Module({
  providers: [UserChannelService],
  exports: [UserChannelService],
})
export class TeamspeakModule {}
