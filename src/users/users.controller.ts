import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Body,
  Patch,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateEmailDto } from './dto/update-email.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UsersListResponse, UserResponse } from './users.types';

@Controller('users')
export class UsersController {
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
  updateUserEmail(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEmailDto: UpdateEmailDto,
  ): Promise<void> {
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
