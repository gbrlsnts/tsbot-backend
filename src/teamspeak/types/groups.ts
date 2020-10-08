export interface TsGroup {
  tsId: number;
  iconId?: number;
  name: string;
}

export interface SetUserBadgesData {
  clientDatabaseId: number;
  groups: number[];
  allowed?: number[];
}

export enum TsGroupType {
  SERVER = 'SERVER',
  CHANNEL = 'CHANNEL',
}
