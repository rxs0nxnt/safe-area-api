import { ApiProperty } from '@nestjs/swagger';
import { RiskCategory } from '../entities/risk-point.entity';

export type RiskLevel = 'red' | 'orange' | 'yellow' | null;

export class HeatmapPointDto {
  @ApiProperty({ example: 13.728 })
  lat: number;

  @ApiProperty({ example: 100.522 })
  lng: number;

  // ค่า intensity ที่ถูกถ่วงน้ำหนักแล้วด้วย recency + time-of-day (0-1)
  @ApiProperty({ example: 0.8, minimum: 0, maximum: 1 })
  intensity: number;

  @ApiProperty({ example: 'บริเวณสะพานลอยคนข้ามถนนหลานหลวง' })
  location_name: string;

  @ApiProperty({ enum: RiskCategory, example: RiskCategory.OVERPASS })
  category: RiskCategory;
}

export class SafeAreaResponseDto {
  @ApiProperty({ example: 'บางรัก' })
  district: string;

  @ApiProperty({ example: false })
  is_safe: boolean;

  @ApiProperty({
    example: 'orange',
    enum: ['red', 'orange', 'yellow'],
    nullable: true,
  })
  risk_level: RiskLevel;

  @ApiProperty({
    example: 'ส้ม',
    enum: ['แดง', 'ส้ม', 'เหลือง'],
    nullable: true,
  })
  risk_label: string | null;

  @ApiProperty({ example: 65, minimum: 0, maximum: 100 })
  risk_score: number;

  @ApiProperty({ type: [HeatmapPointDto] })
  heatmap: HeatmapPointDto[];

  @ApiProperty({ example: 'พื้นที่เขตบางรักมีความเสี่ยงระดับ ส้ม' })
  message: string;
}

export class ErrorMessageDto {
  @ApiProperty({ example: 'ไม่พบเขตที่ระบุในระบบ กรุณาตรวจสอบชื่อเขตอีกครั้ง' })
  message: string;
}
