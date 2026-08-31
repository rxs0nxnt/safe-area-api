import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SafeAreaModule } from './safe-area/safe-area.module';
import { District } from './districts/district.entity';
import { RiskPoint } from './safe-area/entities/risk-point.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 3306),
        username: config.get('DB_USERNAME', 'root'),
        password: config.get('DB_PASSWORD', ''),
        database: config.get('DB_DATABASE', 'safe_area_db'),
        entities: [District, RiskPoint],
        synchronize: true, // dev only — ปิดและใช้ migration จริงตอน production
      }),
    }),
    SafeAreaModule,
  ],
})
export class AppModule {}
