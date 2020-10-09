import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServersModule } from '../servers/servers.module';
import { ChannelsService } from './channels.service';
import { ChannelRepository } from './channel.repository';
import { ClientsModule } from '../clients/clients.module';
import { ChannelsController } from './channels.controller';
import { TeamspeakModule } from '../teamspeak/teamspeak.module';
import { ChannelRolesGuard } from './guard/channel-roles.guard';
import { UserChannelService } from './user-channel.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChannelRepository]),
    ServersModule,
    ClientsModule,
    TeamspeakModule,
  ],
  providers: [ChannelsService, UserChannelService, ChannelRolesGuard],
  controllers: [ChannelsController],
  exports: [],
})
export class ChannelsModule {}
