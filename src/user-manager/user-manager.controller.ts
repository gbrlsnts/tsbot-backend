import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Body,
  Patch,
  ValidationPipe,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  SerializeOptions,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { UpdateEmailDto } from '../users/dto/update-email.dto';
import { UpdatePasswordDto } from '../users/dto/update-password.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { LoggedUserGuard } from '../auth/guards/self-user.guard';
import { User } from '../users/user.entity';
import { appSerializeOptions } from '../constants';
import { IsAdminGuard } from 'src/auth/guards/admin.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions(appSerializeOptions)
export class UserManagerController {
  constructor(private usersService: UsersService) {}

  @Get()
  @UseGuards(IsAdminGuard)
  async getUsers(): Promise<User[]> {
    return this.usersService.getUsers();
  }

  @Get('/:id')
  @UseGuards(LoggedUserGuard)
  getUserById(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.usersService.getUserById(id);
  }

  @Patch('/:id/email')
  @UseGuards(LoggedUserGuard)
  updateUserEmail(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateEmailDto: UpdateEmailDto,
  ): Promise<User> {
    return this.usersService.updateEmail(id, updateEmailDto);
  }

  @Patch('/:id/password')
  @UseGuards(LoggedUserGuard)
  updateUserPassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ): Promise<void> {
    return this.usersService.updatePassword(id, updatePasswordDto);
  }
}
