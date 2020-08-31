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
import { ZoneRepository } from './configs/zone/zone.repository';
import { ChannelConfigService } from './configs/channel/channel-config.service';
import { ZoneService } from './configs/zone/zone.service';
import { MetadataModule } from '../metadata/metadata.module';
import { ChannelConfigPermission } from './configs/channel/channel-perm.entity';
import { ZoneController } from './configs/zone/zone.controller';
import { GroupCategoryService } from './configs/group/group-category.service';
import { GroupCategoryRepository } from './configs/group/group-category.repository';
import { GroupConfigRepository } from './configs/group/group-config.repository';
import { GroupCategoryController } from './configs/group/group-category.controller';
import { ServerGroupsModule } from 'src/server-groups/server-groups.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ServerRepository,
      ServerConfigRepository,
      ChannelConfigRepository,
      ChannelConfigPermission,
      ZoneRepository,
      GroupCategoryRepository,
      GroupConfigRepository,
    ]),
    AuthModule,
    MetadataModule,
    forwardRef(() => ClientsModule),
    forwardRef(() => ServerGroupsModule),
  ],
  providers: [
    ServersService,
    ServersConfigService,
    ServerRolesGuard,
    ChannelConfigService,
    ZoneService,
    GroupCategoryService,
  ],
  controllers: [
    ServersController,
    ChannelConfigController,
    ZoneController,
    GroupCategoryController,
  ],
  exports: [
    ServersService,
    ZoneService,
    ChannelConfigService,
    ServerRolesGuard,
  ],
})
export class ServersModule {}
