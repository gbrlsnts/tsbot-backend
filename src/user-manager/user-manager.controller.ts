import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Body,
  Patch,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  SerializeOptions,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { UpdateEmailDto } from '../users/dto/update-email.dto';
import { UpdatePasswordDto } from '../users/dto/update-password.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from '../users/user.entity';
import { appSerializeOptions } from '../shared/constants';
import { IsAdminGuard } from 'src/auth/guards/admin.guard';

@Controller('users')
@UseGuards(JwtAuthGuard, IsAdminGuard)
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions(appSerializeOptions)
export class UserManagerController {
  constructor(private usersService: UsersService) {}

  @Get()
  async getUsers(): Promise<User[]> {
    return this.usersService.getUsers();
  }

  @Get('/:id')
  getUserById(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.usersService.getUserById(id);
  }

  @Patch('/:id/email')
  updateUserEmail(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEmailDto: UpdateEmailDto,
  ): Promise<User> {
    return this.usersService.updateEmail(id, updateEmailDto);
  }

  @Patch('/:id/password')
  updateUserPassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ): Promise<void> {
    return this.usersService.updatePassword(id, updatePasswordDto);
  }
}
