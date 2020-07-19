import { Repository, EntityRepository } from 'typeorm';
import { ClientHistory } from './client-history.entity';

@EntityRepository(ClientHistory)
export class ClientHistoryRepository extends Repository<ClientHistory> {}
