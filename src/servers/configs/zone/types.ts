import { ZoneRelations } from './zone.entity';

export interface FindZoneOptions {
  relations?: ZoneRelations[];
  withDeleted?: boolean;
}

export interface ZoneFilters {
  withDeleted?: boolean;
}
