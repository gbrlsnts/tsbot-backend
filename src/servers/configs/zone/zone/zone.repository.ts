import { Repository, EntityRepository } from 'typeorm';
import { Zone } from './zone.entity';

@EntityRepository(Zone)
export class ZoneRepository extends Repository<Zone> {}
