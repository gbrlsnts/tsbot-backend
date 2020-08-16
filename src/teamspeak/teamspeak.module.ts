import { Module } from '@nestjs/common';
import { TeamspeakService } from './teamspeak.service';

@Module({
  providers: [TeamspeakService],
  exports: [TeamspeakService],
})
export class TeamspeakModule {}
