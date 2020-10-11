import { Module } from '@nestjs/common';
import { Ts3EventsService } from './ts3-events.service';
import { TeamspeakModule } from '../teamspeak/teamspeak.module';
import { TeamspeakCommonModule } from '../teamspeak-common/teamspeak-common.module';

@Module({
  imports: [TeamspeakModule, TeamspeakCommonModule],
  providers: [Ts3EventsService],
})
export class EventsModule {}
