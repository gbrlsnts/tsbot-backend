import { In, getConnection } from 'typeorm';
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InactiveChannelRepository } from './inactive-channel.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Crawl } from './crawl.entity';
import { CrawlRepository } from './crawl.repository';
import { CrawlZoneRepository } from './crawl-zone.repository';
import { CrawlZone } from './crawl-zone.entity';
import { CrawlDto } from './dto/crawl.dto';
import { ZoneService } from '../servers/configs/zone/zone.service';
import { zoneInvalid } from '../shared/messages/server.messages';
import { InactiveChannel } from './inactive-channel.entity';
import { SetInactiveChannelsDto } from './dto/set-inactive.dto';

@Injectable()
export class CrawlsService {
  constructor(
    @InjectRepository(InactiveChannelRepository)
    private inactiveRepository: InactiveChannelRepository,
    @InjectRepository(CrawlRepository)
    private crawlRepository: CrawlRepository,
    @InjectRepository(CrawlZone)
    private crawlZoneRepository: CrawlZoneRepository,
    private zoneService: ZoneService,
  ) {}

  /**
   * Get the last crawl ran on the server
   * @param serverId server id
   */
  async getLastCrawl(serverId: number): Promise<Crawl> {
    const crawl = await this.crawlRepository.findOne({
      where: { serverId },
      order: {
        runAt: 'DESC',
      },
      relations: ['zones'],
    });

    if (!crawl) throw new NotFoundException();

    return crawl;
  }

  /**
   * Store a crawl information
   * @param serverId server id
   * @param dto crawl data
   */
  async storeCrawl(serverId: number, dto: CrawlDto): Promise<Crawl> {
    const { zones, runAt } = dto;
    const crawl = this.crawlRepository.create({ runAt, serverId });

    const crawlZones = await Promise.all(
      zones.map(async z => {
        const { zone: dirtyZone } = z;

        const zoneId = await this.getValidZoneId(dirtyZone, serverId);

        return {
          serverId,
          zoneId,
          inactiveChannels: z.inactiveChannels,
          deletedChannels: z.deletedChannels,
          totalChannels: z.totalChannels,
        };
      }),
    );

    crawl.zones = this.crawlZoneRepository.create(crawlZones);

    return this.crawlRepository.save(crawl);
  }

  /**
   * Check if a zone belongs to a serverr
   * @param checkZoneId zone id or name to check
   * @param serverId server id
   */
  private async getValidZoneId(
    checkZoneId: string | number,
    serverId: number,
  ): Promise<number> {
    const zoneId = Number(checkZoneId);

    try {
      // not a number, try to get by name
      if (!zoneId) {
        return await this.zoneService.getZoneIdByName(
          checkZoneId.toString(),
          serverId,
        );
      }

      const zone = await this.zoneService.getZoneIdByServer(zoneId, serverId);

      return zone.id;
    } catch (e) {
      throw new BadRequestException(zoneInvalid);
    }
  }

  /**
   * Get all inactive channels on a server
   * @param serverId server id
   */
  getInactiveChannelsByServer(serverId: number): Promise<InactiveChannel[]> {
    return this.inactiveRepository.find({
      where: { serverId },
    });
  }

  /**
   * Set the list of inactive channels for a server
   * @param serverId server to update
   * @param dto channel data to set
   */
  async setInactiveChannelsInServer(
    serverId: number,
    dto: SetInactiveChannelsDto,
  ): Promise<void> {
    const channels = this.inactiveRepository.create(dto.channels);

    channels.forEach(c => {
      c.serverId = serverId;
    });

    const toDelete = (await this.getInactiveChannelsByServer(serverId))
      .map(c => c.tsChannelId)
      .filter(cid => {
        return channels.findIndex(c => c.tsChannelId === cid) === -1;
      });

    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (toDelete.length > 0) {
        await this.inactiveRepository.delete({
          serverId,
          tsChannelId: In(toDelete),
        });
      }

      await this.inactiveRepository.save(channels, { transaction: false });

      await queryRunner.commitTransaction();
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }
}
