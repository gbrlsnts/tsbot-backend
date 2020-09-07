import { Module } from '@nestjs/common';
import { BadgesService } from './badges.service';
import { BadgesController } from './badges.controller';
import { TeamspeakModule } from '../teamspeak/teamspeak.module';
import { ServersModule } from '../servers/servers.module';
import { ClientsModule } from '../clients/clients.module';

@Module({
  imports: [ServersModule, ClientsModule, TeamspeakModule],
  providers: [BadgesService],
  controllers: [BadgesController],
})
export class BadgesModule {}
