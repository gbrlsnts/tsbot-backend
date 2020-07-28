import { ZoneRepository } from './zone.repository';
import { InjectRepository } from '@nestjs/typeorm';
export class ZoneService {
  constructor(
    @InjectRepository(ZoneRepository)
    private zoneRepository: ZoneRepository,
  ) {}

  /**
   * Check if a zone id exists
   * @param id
   */
  async checkZoneExists(id: number): Promise<boolean> {
    const zoneCount = await this.zoneRepository.count({
      where: { id },
    });

    return zoneCount > 0;
  }

  /**
   * Check if a given zone id belongs to a server
   * @param id
   * @param serverId
   */
  async checkZoneBelongsToServer(id: number, serverId: number): Promise<boolean> {
    const zoneCount = await this.zoneRepository.count({
      where: { id, serverId }
    });

    return zoneCount > 0;
  }
}
