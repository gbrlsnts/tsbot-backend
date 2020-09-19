import { Injectable } from '@nestjs/common';
import { TeamspeakBusService } from './teamspeak-bus.service';
import {
  getUsersByAddressSubject,
  sendVerificationMessageSubject,
} from './subjects';
import { VerifyUserData, VerificationToken, TsClientIds } from './types/client';

@Injectable()
export class TsClientService {
  constructor(private busService: TeamspeakBusService) {}

  getClientsByAddress(
    serverId: number,
    address: string,
  ): Promise<TsClientIds[]> {
    return this.busService.send<TsClientIds[]>(
      getUsersByAddressSubject(serverId),
      address,
    );
  }

  /**
   * Send verification tokens
   * @param serverId
   * @param tokens tokens to send
   * @param template message template, will be replaced with tokens for each client
   */
  sendVerificationTokens(
    serverId: number,
    tokens: VerificationToken[],
    template: string,
  ): Promise<void> {
    const data: VerifyUserData = {
      targets: tokens,
      template,
    };

    return this.busService.send<void>(
      sendVerificationMessageSubject(serverId),
      data,
    );
  }
}
