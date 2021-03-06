import { ZoneRelations } from './zone.entity';

export interface FindZoneOptions {
  relations?: ZoneRelations[] | string[];
  withDeleted?: boolean;
}

export interface ZoneFilters {
  withDeleted?: boolean;
}
