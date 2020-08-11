import { Module, CacheModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IconRepository } from './icon.repository';
import { IconContentRepository } from './icon-content.repository';
import { IconsService } from './icons.service';
import { IconsController } from './icons.controller';
import { ServersModule } from '../servers/servers.module';
import { ClientsModule } from '../clients/clients.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([IconRepository, IconContentRepository]),
    ServersModule,
    ClientsModule,
  ],
  providers: [IconsService],
  controllers: [IconsController],
})
export class IconsModule {}
