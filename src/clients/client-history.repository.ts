import { Repository, EntityRepository } from 'typeorm';
import { ClientHistory } from './client-history.entity';
import { Client } from './client.entity';

@EntityRepository(ClientHistory)
export class ClientHistoryRepository extends Repository<ClientHistory> {
  pushClientToHistory(client: Client): Promise<ClientHistory> {
    const history = ClientHistory.fromClient(client);

    return this.save(history);
  }
}
