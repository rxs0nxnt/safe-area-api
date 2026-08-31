import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { District } from '../../districts/district.entity';

export enum RiskCategory {
  OVERPASS = 'overpass', // สะพานลอย / จุดกลับรถใต้สะพาน
  DARK_ALLEY = 'dark_alley', // ซอยมืด / ทางเท้าเปลี่ยว
  PARK = 'park', // สวนหย่อม
  ABANDONED_BUILDING = 'abandoned_building', // ตึกร้าง / อาคารรกร้าง
  OTHER = 'other',
}

@Entity('risk_points')
export class RiskPoint {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => District, (district) => district.riskPoints, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'district_id' })
  district: District;

  @Column({ name: 'district_id' })
  districtId: number;

  @Column({ name: 'location_name', type: 'varchar', length: 255 })
  locationName: string;

  @Column({
    type: 'enum',
    enum: RiskCategory,
    default: RiskCategory.OTHER,
  })
  category: RiskCategory;

  @Column({ type: 'decimal', precision: 10, scale: 8 })
  lat: number;

  @Column({ type: 'decimal', precision: 11, scale: 8 })
  lng: number;

  // ค่าฐาน (base) ความเสี่ยงของจุดนี้ 0.00 - 1.00
  // risk_score จริงที่ตอบกลับ user จะถูกถ่วงน้ำหนักเพิ่มด้วย recency + time-of-day ใน service
  @Column({ type: 'decimal', precision: 3, scale: 2 })
  intensity: number;

  @Column({ name: 'incident_datetime', type: 'datetime' })
  incidentDatetime: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
