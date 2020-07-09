import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { typeOrmConfig } from './config/typeorm.config';
import { AuthModule } from './auth/auth.module';
import { UserManagerModule } from './user-manager/user-manager.module';
import { ServersModule } from './servers/servers.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    UsersModule,
    AuthModule,
    UserManagerModule,
    ServersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
