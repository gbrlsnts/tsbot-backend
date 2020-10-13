/** EVENTS */

export const crawlConfigUpdatedEventSubject = (serverId: number): string =>
  `bot.server.${serverId}.evt.crawl.updated`;

export const botConnectionLostEventSubject = 'bot.server.*.connection.lost';

/** REQUESTS */

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

export const getChannelZoneSubject = (serverId: number): string =>
  `bot.server.${serverId}.channel.get-zone`;

export const getServerGroupsSubject = (serverId: number): string =>
  `bot.server.${serverId}.server-groups.get`;

export const getIconsSubject = (serverId: number): string =>
  `bot.server.${serverId}.icon.list`;

export const uploadIconSubject = (serverId: number): string =>
  `bot.server.${serverId}.icon.upload`;

export const deleteIconSubject = (serverId: number): string =>
  `bot.server.${serverId}.icon.delete`;

export const setUserBadgesSubject = (serverId: number): string =>
  `bot.server.${serverId}.badges.set`;

export const getUserServerGroupsSubject = (serverId: number): string =>
  `bot.server.${serverId}.user.sgroups`;

export const getUsersByAddressSubject = (serverId: number): string =>
  `bot.server.${serverId}.user.get-by-addr`;

export const sendVerificationMessageSubject = (serverId: number): string =>
  `bot.server.${serverId}.user.verification`;

/** BOT->BACKEND REQUESTS */

export const getServersToLoadSubject = 'backend.servers.config.get';
export const getServerConfigSubject = 'backend.server.*.config.get';

export const getAllCrawlsSubject = 'backend.server.*.crawl.get-all';
export const getPrevCrawlSubject = 'backend.server.*.crawl.get-prev';
export const getAddCrawlSubject = 'backend.server.*.crawl.add';
export const getAllInactiveChannelsSubject =
  'backend.server.*.inactive-channels.get-all';
export const getSetInactiveChannelsSubject =
  'backend.server.*.inactive-channels.set';
export const getFindInactiveChannelByIdSubject =
  'backend.server.*.inactive-channels.get-by-id';
export const getSetInactiveChannelNotifiedSubject =
  'backend.server.*.inactive-channels.set-notified';
