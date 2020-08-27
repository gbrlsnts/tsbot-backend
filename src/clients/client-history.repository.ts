import { Repository, EntityRepository, EntityManager } from 'typeorm';
import { ClientHistory } from './client-history.entity';
import { Client } from './client.entity';

@EntityRepository(ClientHistory)
export class ClientHistoryRepository extends Repository<ClientHistory> {
  /**
   *
   * @param client client to push to history
   * @param manager optional - provide if should be run within a transaction
   */
  pushClientToHistory(
    client: Client,
    manager?: EntityManager,
  ): Promise<ClientHistory> {
    if (!manager) manager = this.manager;

    const history = ClientHistory.fromClient(client);

    return manager.save(history);
  }
}
