import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RiskPoint } from '../safe-area/entities/risk-point.entity';

@Entity('districts')
export class District {
  @PrimaryGeneratedColumn()
  id: number;

  // ชื่อเขต เช่น "บางรัก"
  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  // ใช้สำหรับเลือกเขตอัตโนมัติจากพิกัด (lat/lng) แบบ nearest-center
  @Column({ type: 'decimal', precision: 10, scale: 8 })
  centerLat: number;

  @Column({ type: 'decimal', precision: 11, scale: 8 })
  centerLng: number;

  // true = มีการสำรวจ/เก็บข้อมูลจุดเสี่ยงของเขตนี้แล้ว
  // false = ยังไม่เคยสำรวจ (ต่างจาก "ปลอดภัย" ที่สำรวจแล้วไม่พบจุดเสี่ยง)
  @Column({ type: 'tinyint', width: 1, default: 1 })
  isSurveyed: boolean;

  @OneToMany(() => RiskPoint, (point) => point.district)
  riskPoints: RiskPoint[];
}
