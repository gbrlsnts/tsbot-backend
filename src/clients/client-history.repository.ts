import { Repository, EntityRepository, QueryRunner } from 'typeorm';
import { ClientHistory } from './client-history.entity';
import { Client } from './client.entity';

@EntityRepository(ClientHistory)
export class ClientHistoryRepository extends Repository<ClientHistory> {
  /**
   *
   * @param client client to push to history
   * @param queryRunner optional - provide if should be ran within a query runner transaction
   */
  pushClientToHistory(
    client: Client,
    queryRunner?: QueryRunner,
  ): Promise<ClientHistory> {
    const history = ClientHistory.fromClient(client);

    if (queryRunner) return queryRunner.manager.save(history);

    return this.save(history);
  }
}
