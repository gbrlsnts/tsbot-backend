import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServersService } from './servers.service';
import { ServersController } from './servers.controller';
import { ServerRepository } from './server.repository';
import { ServerConfigRepository } from './configs/server-config.repository';
import { ServersConfigService } from './configs/servers-config.service';
import { AuthModule } from '../auth/auth.module';
import { ServerRolesGuard } from './guards/server-roles.guard';
import { ClientsModule } from '../clients/clients.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ServerRepository, ServerConfigRepository]),
    AuthModule,
    forwardRef(() => ClientsModule)
  ],
  providers: [ServersService, ServersConfigService, ServerRolesGuard],
  controllers: [ServersController],
  exports: [ServersService, ServerRolesGuard],
})
export class ServersModule {}
