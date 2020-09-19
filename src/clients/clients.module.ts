import { Module, forwardRef } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientRepository } from './client.repository';
import { ClientHistoryRepository } from './client-history.repository';
import { ServersModule } from '../servers/servers.module';
import { VerificationTokenRepository } from './verification-token.repository';
import { ClientVerificationService } from './verification.service';
import { TeamspeakModule } from '../teamspeak/teamspeak.module';
import { VerificationController } from './verification.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ClientRepository,
      ClientHistoryRepository,
      VerificationTokenRepository,
    ]),
    forwardRef(() => ServersModule),
    TeamspeakModule,
  ],
  providers: [ClientsService, ClientVerificationService],
  controllers: [ClientsController, VerificationController],
  exports: [ClientsService],
})
export class ClientsModule {}
