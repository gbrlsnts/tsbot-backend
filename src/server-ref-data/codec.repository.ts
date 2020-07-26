import { Repository, EntityRepository } from 'typeorm';
import { Codec } from './codec.entity';

@EntityRepository(Codec)
export class CodecRepository extends Repository<Codec> {}