export const createChannelSubject = (serverId: number): string =>
  `bot.server.${serverId}.channel.create`;

export const deleteChannelSubject = (serverId: number): string =>
  `bot.server.${serverId}.channel.delete`;
