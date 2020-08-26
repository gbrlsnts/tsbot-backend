import { Controller, Body, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserIdResponse, AccessToken } from './auth.types';
import { UserCredentialsDto } from '../users/dto/user-credentials.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signUp(
    @Body() credentials: UserCredentialsDto,
  ): Promise<UserIdResponse> {
    const id = await this.authService.signUp(credentials);

    return {
      user: { id },
    };
  }

  @Post('signin')
  signIn(@Body() credentials: UserCredentialsDto): Promise<AccessToken> {
    return this.authService.signIn(credentials);
  }
}
