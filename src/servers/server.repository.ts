import { EntityRepository, Repository } from 'typeorm';
import { Server } from './server.entity';
import { ServerConfig } from './server-config.entity';

@EntityRepository(Server)
export class ServerRepository extends Repository<Server> {

    /**
     * Save a server and config in a single transaction. Works for create and update.
     * @param server Server to save
     * @param config The associated config
     */
    async saveTransactionServerAndConfig(server: Server, config: ServerConfig): Promise<Server> {
        let createdServer: Server;

        await this.manager.transaction(async transactionalManager => {
            createdServer = await transactionalManager.save(server);

            config.id = createdServer.id;
            createdServer.config = await transactionalManager.save(config);
        });

        return createdServer;
    }
}
