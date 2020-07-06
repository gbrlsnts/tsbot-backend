import { Repository, EntityRepository } from "typeorm";
import { ServerConfig } from './server-config.entity';

@EntityRepository(ServerConfig)
export class ServerConfigRepository extends Repository<ServerConfig> {

}