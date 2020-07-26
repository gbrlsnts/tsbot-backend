import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServersService } from './servers.service';
import { ServersController } from './servers.controller';
import { ServerRepository } from './server.repository';
import { ServerConfigRepository } from './configs/server/server-config.repository';
import { ServersConfigService } from './configs/server/servers-config.service';
import { AuthModule } from '../auth/auth.module';
import { ServerRolesGuard } from './guards/server-roles.guard';
import { ClientsModule } from '../clients/clients.module';
import { ChannelConfigController } from './configs/channel/channel-config.controller';
import { ChannelConfigRepository } from './configs/channel/channel-config.repository';
import { ZoneRepository } from './configs/zone/zone/zone.repository';
import { ChannelConfigService } from './configs/channel/channel-config.service';
import { ZoneService } from './configs/zone/zone/zone.service';
import { ServerRefDataModule } from '../server-ref-data/server-ref-data.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ServerRepository,
      ServerConfigRepository,
      ChannelConfigRepository,
      ZoneRepository,
    ]),
    AuthModule,
    forwardRef(() => ClientsModule),
    ServerRefDataModule,
  ],
  providers: [
    ServersService,
    ServersConfigService,
    ServerRolesGuard,
    ChannelConfigService,
    ZoneService,
  ],
  controllers: [ServersController, ChannelConfigController],
  exports: [ServersService, ServerRolesGuard],
})
export class ServersModule {}
