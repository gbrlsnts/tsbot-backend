import { Module } from '@nestjs/common';
import { ConfigCommonService } from './config-common.service';
import { ServersModule } from '../servers/servers.module';

@Module({
  imports: [ServersModule],
  providers: [ConfigCommonService],
  exports: [ConfigCommonService],
})
export class TeamspeakCommonModule {}
