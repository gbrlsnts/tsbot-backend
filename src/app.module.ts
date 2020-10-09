import { NestEmitterModule } from 'nest-emitter';
import { EventEmitter } from 'events';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { typeOrmConfig } from './config/typeorm.config';
import { AuthModule } from './auth/auth.module';
import { UserManagerModule } from './user-manager/user-manager.module';
import { ServersModule } from './servers/servers.module';
import { ResponseMapperInterceptor } from './shared/interceptors/response-mapper.interceptor';
import { ClientsModule } from './clients/clients.module';
import { MetadataModule } from './metadata/metadata.module';
import { ServerGroupsModule } from './server-groups/server-groups.module';
import { IconsModule } from './icons/icons.module';
import { ChannelsModule } from './channels/channels.module';
import { TeamspeakModule } from './teamspeak/teamspeak.module';
import { CrawlsModule } from './crawls/crawls.module';
import { BadgesModule } from './badges/badges.module';
import { EventsModule } from './events/events.module';

@Module({
  imports: [
    NestEmitterModule.forRoot(new EventEmitter()),
    TypeOrmModule.forRoot(typeOrmConfig),
    UsersModule,
    AuthModule,
    UserManagerModule,
    ServersModule,
    ClientsModule,
    MetadataModule,
    ServerGroupsModule,
    IconsModule,
    ChannelsModule,
    TeamspeakModule,
    CrawlsModule,
    BadgesModule,
    EventsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseMapperInterceptor,
    },
  ],
})
export class AppModule {}
