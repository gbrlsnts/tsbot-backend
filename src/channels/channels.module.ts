import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServersModule } from '../servers/servers.module';
import { ChannelsService } from './channels.service';
import { ChannelRepository } from './channel.repository';
import { ClientsModule } from '../clients/clients.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChannelRepository]),
    ServersModule,
    ClientsModule,
  ],
  providers: [ChannelsService],
  controllers: [],
  exports: [],
})
export class ChannelsModule {}
