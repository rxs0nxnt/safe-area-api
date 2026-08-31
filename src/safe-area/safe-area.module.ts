import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SafeAreaController } from './safe-area.controller';
import { SafeAreaService } from './safe-area.service';
import { RiskPoint } from './entities/risk-point.entity';
import { District } from '../districts/district.entity';

@Module({
  imports: [TypeOrmModule.forFeature([District, RiskPoint])],
  controllers: [SafeAreaController],
  providers: [SafeAreaService],
})
export class SafeAreaModule {}
