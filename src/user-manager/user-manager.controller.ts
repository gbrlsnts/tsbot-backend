import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Body,
  Patch,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { UpdateEmailDto } from '../users/dto/update-email.dto';
import { UpdatePasswordDto } from '../users/dto/update-password.dto';
import { UsersListResponse, UserResponse } from '../users/users.types';
import { User } from '../users/user.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserManagerController {
  constructor(private usersService: UsersService) {}

  @Get()
  async getUsers(): Promise<UsersListResponse> {
    const users = await this.usersService.getUsers();

    return { users };
  }

  @Get('/:id')
  async getUserById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UserResponse> {
    const user = await this.usersService.getUserById(id);

    return { user };
  }

  @Patch('/:id/email')
  async updateUserEmail(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateEmailDto: UpdateEmailDto,
  ): Promise<UserResponse> {
    const user = await this.usersService.updateEmail(id, updateEmailDto);

    return { user };
  }

  @Patch('/:id/password')
  updateUserPassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ): Promise<void> {
    return this.usersService.updatePassword(id, updatePasswordDto);
  }
}
