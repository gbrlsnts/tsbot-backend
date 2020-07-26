import { ZoneRepository } from './zone.repository';
import { InjectRepository } from '@nestjs/typeorm';
export class ZoneService {
  constructor(
    @InjectRepository(ZoneRepository)
    private zoneRepository: ZoneRepository,
  ) {}

  async checkZoneExists(id: number): Promise<boolean> {
    const zoneCount = await this.zoneRepository.count({
      where: { id },
    });

    return zoneCount > 0;
  }

  async checkZoneExistsByUserId(id: number, userId: number): Promise<boolean> {
    const zoneCount = await this.zoneRepository
      .createQueryBuilder('zone')
      .innerJoin('server', 'server')
      .where('zone.id = :id ', { id })
      .andWhere('server.userId = :userId', { userId })
      .getCount();


    return zoneCount > 0;
  }
}
