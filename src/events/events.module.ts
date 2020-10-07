import { Module } from '@nestjs/common';
import { Ts3EventsService } from './ts3-events.service';
import { TeamspeakModule } from '../teamspeak/teamspeak.module';
import { ServersModule } from '../servers/servers.module';

@Module({
  imports: [TeamspeakModule, ServersModule],
  providers: [Ts3EventsService],
})
export class EventsModule {}
