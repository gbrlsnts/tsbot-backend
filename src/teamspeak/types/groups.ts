export interface TsServerGroup {
  tsId: number;
  iconId?: number;
  name: string;
}

export interface SetUserBadgesData {
  clientDatabaseId: number;
  groups: number[];
  allowed?: number[];
}
