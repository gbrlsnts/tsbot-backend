import { Module } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientRepository } from './client.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ClientRepository])],
  providers: [ClientsService],
  controllers: [ClientsController],
})
export class ClientsModule {}
