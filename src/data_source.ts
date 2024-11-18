import { DataSource, DataSourceOptions } from 'typeorm';
import { registerAs } from '@nestjs/config';

const config = <DataSourceOptions>{
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [__dirname + '/entities.ts'],

  synchronize: false,
  migrations: [__dirname + '../migrations/*.ts'],
};

export default registerAs('typeorm', () => config);
export const connectionSource = new DataSource(config as DataSourceOptions);

connectionSource.initialize();
