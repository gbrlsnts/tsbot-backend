import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UserManagerController } from './user-manager.controller';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [UsersModule, AuthModule],
  providers: [],
  controllers: [UserManagerController],
})
export class UserManagerModule {}
