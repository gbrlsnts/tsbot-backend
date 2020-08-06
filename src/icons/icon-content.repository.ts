import { Repository, EntityRepository } from 'typeorm';
import { IconContent } from './icon-content.entity';

@EntityRepository(IconContent)
export class IconContentRepository extends Repository<IconContent> {}