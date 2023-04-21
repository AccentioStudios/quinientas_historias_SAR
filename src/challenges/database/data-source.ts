import { DataSource, DataSourceOptions } from 'typeorm'
import { ChallengeEntity } from 'src/shared/entities/challenge.entity'

export const dataSourceOptions: DataSourceOptions = {
  type: 'mysql',
  database: process.env.MYSQL_DATABASE,
  username: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  port: parseInt(process.env.MYSQL_PORT) || 3006,
  host: process.env.MYSQL_IP,
  entities: [ChallengeEntity],
  migrations: ['dist/src/challenges/database/migrations/*.js'],
}

export const dataSource = new DataSource(dataSourceOptions)
