import { Repository, EntityRepository } from 'typeorm';
import { Icon } from './icon.entity';

@EntityRepository(Icon)
export class IconRepository extends Repository<Icon> {}