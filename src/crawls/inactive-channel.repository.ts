import { Repository, EntityRepository, In, Not, EntityManager } from 'typeorm';
import { InactiveChannel } from './inactive-channel.entity';

@EntityRepository(InactiveChannel)
export class InactiveChannelRepository extends Repository<InactiveChannel> {
  /**
   * Set the inactive channels for a server. Deletes channels not in the list.
   * @param serverId server id
   * @param channels channels to set
   * @param manager optional - set if wrapping in a transaction
   */
  async setChannelsForServer(
    serverId: number,
    channels: InactiveChannel[],
    manager?: EntityManager,
  ): Promise<void> {
    if (!manager) manager = this.manager;

    const toKeep = channels.map(c => c.tsChannelId);

    if (channels.length > 0) {
      await manager.delete(InactiveChannel, {
        serverId,
        tsChannelId: Not(In(toKeep)),
      });

      channels.forEach(c => {
        c.serverId = serverId;
      });

      await manager.save(channels);
    } else {
      await manager.delete(InactiveChannel, {
        serverId,
      });
    }
  }
}
