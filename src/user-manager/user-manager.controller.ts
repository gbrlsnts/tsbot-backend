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
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { LoggedUserGuard } from '../auth/guards/self-user.guard';

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
  @UseGuards(LoggedUserGuard)
  async getUserById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UserResponse> {
    const user = await this.usersService.getUserById(id);

    return { user };
  }

  @Patch('/:id/email')
  @UseGuards(LoggedUserGuard)
  async updateUserEmail(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateEmailDto: UpdateEmailDto,
  ): Promise<UserResponse> {
    const user = await this.usersService.updateEmail(id, updateEmailDto);

    return { user };
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
