import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserRepository } from './user.repository';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([UserRepository])],
  providers: [UsersService],
  controllers: [],
  exports: [TypeOrmModule, UsersService],
})
export class UsersModule {}
