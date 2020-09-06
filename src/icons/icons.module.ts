import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IconRepository } from './icon.repository';
import { IconContentRepository } from './icon-content.repository';
import { IconsService } from './icons.service';
import { IconsController } from './icons.controller';
import { ServersModule } from '../servers/servers.module';
import { ClientsModule } from '../clients/clients.module';
import { ServerIconsController } from './server-icons.controller';
import { TeamspeakModule } from '../teamspeak/teamspeak.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([IconRepository, IconContentRepository]),
    forwardRef(() => ServersModule),
    ClientsModule,
    TeamspeakModule,
  ],
  providers: [IconsService],
  controllers: [IconsController, ServerIconsController],
  exports: [IconsService],
})
export class IconsModule {}
