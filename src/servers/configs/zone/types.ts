import { ZoneRelations } from './zone.entity';

export interface FindZoneOptions {
  relations: ZoneRelations[];
  withInactive: boolean;
}
