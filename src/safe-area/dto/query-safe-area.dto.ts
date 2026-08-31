import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class QuerySafeAreaDto {
  @ApiPropertyOptional({ example: 'บางรัก', description: 'ชื่อเขตที่ต้องการค้นหา' })
  @IsOptional()
  @IsString()
  district?: string;

  @ApiPropertyOptional({ example: 13.7279, description: 'ละติจูด' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lat?: number;

  @ApiPropertyOptional({ example: 100.5214, description: 'ลองจิจูด' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lng?: number;

  @ApiPropertyOptional({
    example: '2026-09-01T22:30:00',
    description:
      'เวลาที่ใช้คำนวณ time-of-day weighting (ISO string) — ถ้าไม่ส่งมาจะใช้เวลาปัจจุบันของ server',
  })
  @IsOptional()
  @IsDateString()
  at?: string;
}
