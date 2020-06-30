import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from "@nestjs/jwt";
import { UsersService } from '../users/users.service';
import { UserCredentialsDto } from '../users/dto/user-credentials.dto';
import { AccessToken, JwtPayload } from './auth.types';
import { invalidCredentials } from '../messages/auth.messages';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  signUp(credentials: UserCredentialsDto): Promise<number> {
    return this.usersService.createUser(credentials);
  }

  async signIn(credentials: UserCredentialsDto): Promise<AccessToken> {
    const { email, password } = credentials;
    let payload: JwtPayload;
    
    try {
      const user = await this.usersService.getUserByEmail(email, true);
      const valid = await user.validatePassword(password);

      if(!valid) throw new UnauthorizedException();

      payload = { email: user.email };
    } catch(e) {
      if(typeof e === NotFoundException.name || typeof e === UnauthorizedException.name)
        throw new UnauthorizedException(invalidCredentials);

      throw e;
    }

    const token: string = this.jwtService.sign(payload);

    return { token };
  }
}
