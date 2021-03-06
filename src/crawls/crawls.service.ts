import { Connection } from 'typeorm';
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
import { Zone } from '../servers/configs/zone/zone.entity';

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
    private connection: Connection,
  ) {}

  getCrawlsByServerId(serverId: number): Promise<Crawl[]> {
    return this.crawlRepository
      .createQueryBuilder('c')
      .innerJoinAndMapMany('c.zones', CrawlZone, 'cz', 'c.id = cz.crawlId')
      .innerJoinAndMapOne('cz.zone', Zone, 'z', 'cz.zoneId = z.id')
      .where('c.serverId = :serverId AND cz.serverId = :serverId', { serverId })
      .orderBy('c.runAt', 'DESC')
      .getMany();
  }

  /**
   * Get the last crawl ran on the server
   * @param serverId server id
   */
  async getLastCrawl(serverId: number): Promise<Crawl> {
    const crawl = await this.crawlRepository
      .createQueryBuilder('c')
      .innerJoinAndMapMany('c.zones', CrawlZone, 'cz', 'c.id = cz.crawlId')
      .innerJoinAndMapOne('cz.zone', Zone, 'z', 'cz.zoneId = z.id')
      .where('c.serverId = :serverId AND cz.serverId = :serverId', { serverId })
      .orderBy('c.runAt', 'DESC')
      .getOne();

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
    let zoneId = Number(checkZoneId);

    try {
      // not a number, parse and try to get by name
      if (!zoneId) {
        const stringZone = checkZoneId.toString();
        const hashIdx = stringZone.lastIndexOf('#');

        if (hashIdx >= 0) {
          // is in format of name#id
          zoneId = Number(stringZone.substr(hashIdx + 1));
        }

        // did we have a successful parse?
        if (!zoneId) {
          return await this.zoneService.getZoneIdByName(stringZone, serverId);
        }
      }

      const zone = await this.zoneService.getZone({ id: zoneId, serverId });

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

    await this.connection.transaction(async manager => {
      await this.inactiveRepository.setChannelsForServer(
        serverId,
        channels,
        manager,
      );
    });
  }

  /**
   * Get an inactive channel by server and ts channel id
   * @param serverId
   * @param tsChannelId
   */
  async getInactiveChannelById(
    serverId: number,
    tsChannelId: number,
  ): Promise<InactiveChannel> {
    const channel = await this.inactiveRepository.findOne({
      where: { serverId, tsChannelId },
    });

    if (!channel) throw new NotFoundException();

    return channel;
  }

  /**
   * Toggle the notified flag of a channel
   * @param serverId
   * @param tsChannelId
   * @param isNotified
   */
  async setChannelNotified(
    serverId: number,
    tsChannelId: number,
    isNotified: boolean,
  ): Promise<void> {
    await this.inactiveRepository.update(
      { serverId, tsChannelId },
      { isNotified },
    );
  }
}
