import { ZoneRepository } from './zone.repository';
import { InjectRepository } from '@nestjs/typeorm';
export class ZoneService {
  constructor(
    @InjectRepository(ZoneRepository)
    private zoneRepository: ZoneRepository,
  ) {}
}
