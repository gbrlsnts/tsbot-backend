import * as config from 'config';
import {
  Controller,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
  UseInterceptors,
  SerializeOptions,
  ClassSerializerInterceptor,
  Ip,
  ParseUUIDPipe,
  HttpCode,
} from '@nestjs/common';
import { ClientVerificationService } from './verification.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { appSerializeOptions } from '../shared/constants';
import { GetUser } from '../auth/decorators/get-user-decorator';
import { User } from '../users/user.entity';
import { VerificationStatus } from './types';

const overrideIp = config.get('verification.address');

@Controller('/servers/:server/verify')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions(appSerializeOptions)
export class VerificationController {
  constructor(private verificationService: ClientVerificationService) {}

  @Post()
  @HttpCode(200)
  verifyClient(
    @GetUser() user: User,
    @Param('server', ParseIntPipe) serverId: number,
    @Ip() clientIpAddress: string,
  ): Promise<VerificationStatus> {
    return this.verificationService.verifyClient(
      serverId,
      user.id,
      this.getClientAddress(clientIpAddress),
    );
  }

  @Post('/:token')
  @HttpCode(200)
  verifyToken(
    @GetUser() user: User,
    @Param('server', ParseIntPipe) serverId: number,
    @Param('token', ParseUUIDPipe) token: string,
    @Ip() clientIpAddress: string,
  ): Promise<void> {
    return this.verificationService.verifyUsingToken(
      serverId,
      user.id,
      this.getClientAddress(clientIpAddress),
      token,
    );
  }

  private getClientAddress(incomingAddr: string): string {
    if (process.env.NODE_ENV === 'production') return incomingAddr;

    return overrideIp ?? incomingAddr;
  }
}
