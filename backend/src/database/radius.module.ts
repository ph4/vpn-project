import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      name: 'radius', // connection name
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('RADIUS_DATABASE_HOST'),
        port: config.get<number>('RADIUS_DATABASE_PORT'),
        username: config.get('RADIUS_DATABASE_USER'),
        password: config.get('RADIUS_DATABASE_PASS'),
        database: config.get('RADIUS_DATABASE_NAME'),
        synchronize: false,
        autoLoadEntities: true,
        extra: {
          ssl: {
            rejectUnauthorized: false,
          },
        },
      }),
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseRadiusModule {}
