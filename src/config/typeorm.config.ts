import { TypeOrmModuleOptions } from "@nestjs/typeorm";

export const typeOrmConfig: TypeOrmModuleOptions = {
    type: 'postgres',
    host: 'home.local',
    port: 5432,
    username: 'postgres',
    password: 'development',
    database: 'magicteamspeak',
    entities: [
        __dirname + '/../**/*.entity.{js,ts}',
    ],
    synchronize: true,
};