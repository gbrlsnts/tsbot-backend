import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UserManagerController } from './user-manager.controller';
import { UsersModule } from 'src/users/users.module';
import { AccountController } from './account.controller';

@Module({
  imports: [UsersModule, AuthModule],
  providers: [],
  controllers: [UserManagerController, AccountController],
})
export class UserManagerModule {}
