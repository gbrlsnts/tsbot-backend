import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServersService } from './servers.service';
import { ServersController } from './servers.controller';
import { ServerRepository } from './server.repository';
import { ServerConfigRepository } from './server-config.repository';
import { ServersConfigService } from './servers-config.service';
import { AuthModule } from '../auth/auth.module';
import { ServerRolesGuard } from './guards/server-roles.guard';
import { ClientsModule } from './clients/clients.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ServerRepository, ServerConfigRepository]),
    AuthModule,
    ClientsModule,
  ],
  providers: [ServersService, ServersConfigService, ServerRolesGuard],
  controllers: [ServersController],
  exports: [ServersService],
})
export class ServersModule {}
