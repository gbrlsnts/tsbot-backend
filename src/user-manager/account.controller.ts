import {
  Controller,
  Get,
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
import { LoggedUserGuard } from '../auth/guards/self-user.guard';
import { User } from '../users/user.entity';
import { appSerializeOptions } from '../shared/constants';
import { GetUser } from '../auth/decorators/get-user-decorator';

@Controller('account')
@UseGuards(JwtAuthGuard, LoggedUserGuard)
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions(appSerializeOptions)
export class AccountController {
  constructor(private usersService: UsersService) {}

  @Get()
  getUserById(@GetUser() user: User): Promise<User> {
    return this.usersService.getUserById(user.id);
  }

  @Patch('/email')
  updateUserEmail(
    @GetUser() user: User,
    @Body() updateEmailDto: UpdateEmailDto,
  ): Promise<User> {
    return this.usersService.updateEmail(user.id, updateEmailDto);
  }

  @Patch('/password')
  updateUserPassword(
    @GetUser() user: User,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ): Promise<void> {
    return this.usersService.updatePassword(user.id, updatePasswordDto);
  }
}
