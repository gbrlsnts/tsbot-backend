export const createChannelSubject = (serverId: number): string =>
  `bot.server.${serverId}.channel.create`;

export const deleteChannelSubject = (serverId: number): string =>
  `bot.server.${serverId}.channel.delete`;

export const createSubChannelSubject = (serverId: number): string =>
  `bot.server.${serverId}.channel.sub.create`;

export const getSubChannelCountSubject = (serverId: number): string =>
  `bot.server.${serverId}.channel.sub.count`;

export const getChannelIsUniqueSubject = (serverId: number): string =>
  `bot.server.${serverId}.channel.is-unique`;

export const getServerGroupsSubject = (serverId: number): string =>
  `bot.server.${serverId}.server-groups.get`;

export const getIconsSubject = (serverId: number): string =>
  `bot.server.${serverId}.icons.get`;
