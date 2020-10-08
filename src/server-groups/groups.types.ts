import { TsGroup } from './ts-group.entity';

export interface FindGroupOptions {
  relations?: string[];
  withDeleted?: boolean;
}

export interface GroupFilters {
  withDeleted?: boolean;
}

export interface SyncChanges {
  toInsert: Partial<TsGroup>[];
  toSave: TsGroup[];
  toDelete: number[];
}
