import { DeleteResult } from 'typeorm';
import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { VerificationStatus } from './types';
import { VerificationTokenRepository } from './verification-token.repository';
import { ClientsService } from './clients.service';
import { TsClientService } from '../teamspeak/client.service';
import { TsClientIds } from '../teamspeak/types/client';
import { VerificationToken as TsVerificationToken } from '../teamspeak/types/client';
import { verificationMessageTemplate } from '../shared/messages/client.messages';
import {
  clientAlreadyVerified,
  clientAlreadyLinkedOtherUser,
} from '../shared/messages/client.messages';

@Injectable()
export class ClientVerificationService {
  constructor(
    @InjectRepository(VerificationTokenRepository)
    private tokenRepository: VerificationTokenRepository,
    private clientsService: ClientsService,
    private tsClientService: TsClientService,
  ) {}

  /**
   * Try to verify a client. If only one found, immediately verify/save.
   * Otherwise, sends verification tokens to TS3 or does nothing if no clients found.
   * @param serverId
   * @param userId
   * @param clientIpAddress
   */
  async verifyClient(
    serverId: number,
    userId: number,
    clientIpAddress: string,
  ): Promise<VerificationStatus> {
    const tsClients = await this.tsClientService.getClientsByAddress(
      serverId,
      clientIpAddress,
    );

    // No clients found!
    if (tsClients.length === 0) return VerificationStatus.NOT_FOUND;

    // Only one found, create client in database
    if (tsClients.length === 1) {
      await this.saveClient(
        serverId,
        userId,
        tsClients[0].dbId,
        tsClients[0].uid,
      );

      return VerificationStatus.VERIFIED;
    }

    // Multiple found under same address - send tokens
    const [, tokens] = await Promise.all([
      this.cleanUpOldTokens(),
      this.createTokens(serverId, clientIpAddress, tsClients),
    ]);

    await this.tsClientService.sendVerificationTokens(
      serverId,
      tokens,
      verificationMessageTemplate,
    );

    return VerificationStatus.TOKEN_SENT;
  }

  /**
   * Verify using a token sent to a client
   * @param serverId
   * @param userId
   * @param clientIpAddress
   * @param tokenId
   */
  async verifyUsingToken(
    serverId: number,
    userId: number,
    clientIpAddress: string,
    tokenId: string,
  ): Promise<void> {
    const token = await this.tokenRepository.findOne({
      where: { id: tokenId, serverId, address: clientIpAddress },
    });

    if (!token) throw new NotFoundException();

    await this.tokenRepository.delete({
      address: clientIpAddress,
    });

    return this.saveClient(
      serverId,
      userId,
      token.tsClientDbId,
      token.tsUniqueId,
    );
  }

  /**
   * Saves a verified client. First checks if trying to verify a client
   * already linked (to the same user), then if the client is linked to other user.
   * @param serverId
   * @param userId
   * @param tsClientDbId
   * @param tsUniqueId
   */
  async saveClient(
    serverId: number,
    userId: number,
    tsClientDbId: number,
    tsUniqueId: string,
  ): Promise<void> {
    const client = await this.clientsService.getServerClientByUserId(
      serverId,
      userId,
    );

    if (
      client &&
      client.tsClientDbId === tsClientDbId &&
      client.tsUniqueId === tsUniqueId
    )
      throw new ConflictException(clientAlreadyVerified);

    try {
      const checkClient = await this.clientsService.getServerClientByTsUid(
        serverId,
        tsUniqueId,
      );

      if (checkClient.userId !== userId)
        throw new BadRequestException(clientAlreadyLinkedOtherUser);
    } catch (e) {
      if (e?.status !== HttpStatus.NOT_FOUND) throw e;
    }

    await this.clientsService.saveClient(serverId, {
      userId,
      tsUniqueId,
      tsClientDbId,
    });
  }

  /**
   * Create verification tokens
   * @param serverId
   * @param address ip address linked to the verification
   * @param clients clients to create tokens for
   */
  async createTokens(
    serverId: number,
    address: string,
    clients: TsClientIds[],
  ): Promise<TsVerificationToken[]> {
    const data = this.tokenRepository.create(
      clients.map(c => ({
        serverId,
        address,
        tsClientDbId: c.dbId,
        tsUniqueId: c.uid,
      })),
    );

    const tokens = await this.tokenRepository.save(data);

    return tokens.map(({ id, tsClientDbId }) => ({
      token: id,
      clientId: clients.find(c => c.dbId === tsClientDbId).id,
    }));
  }

  /**
   * Clean up tokens sent longer than 1 day ago
   */
  cleanUpOldTokens(): Promise<DeleteResult> {
    return this.tokenRepository
      .createQueryBuilder()
      .delete()
      .where("createdAt < now() - interval '1 day'")
      .execute();
  }
}
