import { UserEntity } from '../../../../libs/shared/src/entities/user.entity';
import { DataSource, DataSourceOptions } from 'typeorm';

export const dataSourceOptions: DataSourceOptions = {
  type: 'mysql',
  database: process.env.MYSQL_DATABASE,
  username: process.env.MYSQL_USER, 
  password: process.env.MYSQL_PASSWORD,
  port: parseInt(process.env.MYSQL_PORT)||3006,
  host: process.env.MYSQL_IP,  entities: [UserEntity],
  //migrations: ['dist/apps/auth/db/migrations/*.js'],
};

export const dataSource = new DataSource(dataSourceOptions);
