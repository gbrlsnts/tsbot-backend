import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from '../users/user.repository';
import { AuthModule } from '../auth/auth.module';
import { UserManagerController } from './user-manager.controller';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserRepository]),
    UsersModule,
    AuthModule,
  ],
  providers: [],
  controllers: [UserManagerController],
})
export class UserManagerModule {}
