import { Module } from '@nestjs/common';
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { JwtStrategy } from './jwt.strategy';
import * as config from "config";

const jwtConfig = config.get('jwt');

@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || jwtConfig.secret,
      signOptions: {
        expiresIn: process.env.JWT_EXPIRES || jwtConfig.expires,
      }
    }),
    UsersModule,
  ],
  providers: [
    AuthService,
    JwtStrategy
  ],
  controllers: [
    AuthController
  ],
  exports: [
    JwtStrategy
  ]
})
export class AuthModule {}
