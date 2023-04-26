import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        //url: configService.get('MYSQL_URI'),
        autoLoadEntities: true,
        database: configService.get('MYSQL_DATABASE'),
        username: configService.get('MYSQL_USER'),
        password: configService.get('MYSQL_PASSWORD'),
        port: configService.get('MYSQL_PORT'),
        host: configService.get('MYSQL_HOST'),
        // if env is not production, synchronize the database
        synchronize: true,
      }),

      inject: [ConfigService],
    }),
  ],
})
export class MysqlDBModule {}
