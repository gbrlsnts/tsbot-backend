import { Module, forwardRef } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientRepository } from './client.repository';
import { ClientHistoryRepository } from './client-history.repository';
import { ServersModule } from '../servers/servers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClientRepository, ClientHistoryRepository]),
    forwardRef(() => ServersModule),
  ],
  providers: [ClientsService],
  controllers: [ClientsController],
  exports: [ClientsService],
})
export class ClientsModule {}
