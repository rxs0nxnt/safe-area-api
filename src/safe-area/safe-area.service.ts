import {
  BadGatewayException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { District } from '../districts/district.entity';
import { RiskPoint } from './entities/risk-point.entity';
import { QuerySafeAreaDto } from './dto/query-safe-area.dto';
import {
  RiskLevel,
  SafeAreaResponseDto,
} from './dto/safe-area-response.dto';

const RISK_LABELS: Record<Exclude<RiskLevel, null>, string> = {
  red: 'แดง',
  orange: 'ส้ม',
  yellow: 'เหลือง',
};

interface WeightedPoint {
  point: RiskPoint;
  weightedIntensity: number; // intensity หลังคูณ recency + time-of-day (0-1)
}

@Injectable()
export class SafeAreaService {
  constructor(
    @InjectRepository(District)
    private readonly districtRepo: Repository<District>,
    @InjectRepository(RiskPoint)
    private readonly riskPointRepo: Repository<RiskPoint>,
  ) {}

  async findSafeArea(query: QuerySafeAreaDto): Promise<SafeAreaResponseDto> {
    // 422: ต้องระบุ district หรือ lat/lng อย่างใดอย่างหนึ่ง
    const hasCoords = query.lat !== undefined && query.lng !== undefined;
    if (!query.district && !hasCoords) {
      throw new UnprocessableEntityException({
        message: 'กรุณาระบุชื่อเขต หรือพิกัดตำแหน่ง',
      });
    }

    const queryTime = query.at ? new Date(query.at) : new Date();

    let district: District | null;
    try {
      if (query.district) {
        district = await this.districtRepo.findOne({
          where: { name: query.district },
        });
      } else {
        district = await this.resolveDistrictFromCoords(
          query.lat as number,
          query.lng as number,
        );
      }
    } catch (err) {
      // 502: เรียกข้อมูลจากฐานข้อมูลไม่สำเร็จ
      throw new BadGatewayException({
        message: 'ไม่สามารถเชื่อมต่อฐานข้อมูลจุดเสี่ยงได้ กรุณาลองใหม่',
      });
    }

    if (!district) {
      // 404: ไม่พบเขตที่ระบุในระบบ
      throw new NotFoundException({
        message: 'ไม่พบเขตที่ระบุในระบบ กรุณาตรวจสอบชื่อเขตอีกครั้ง',
      });
    }

    let riskPoints: RiskPoint[];
    try {
      riskPoints = await this.riskPointRepo.find({
        where: { districtId: district.id },
      });
    } catch (err) {
      throw new BadGatewayException({
        message: 'ไม่สามารถเชื่อมต่อฐานข้อมูลจุดเสี่ยงได้ กรุณาลองใหม่',
      });
    }

    if (!riskPoints || riskPoints.length === 0) {
      return {
        district: district.name,
        is_safe: true,
        risk_level: null,
        risk_label: null,
        risk_score: 0,
        heatmap: [],
        message: `พื้นที่เขต${district.name} เป็นพื้นที่ปลอดภัย`,
      };
    }

    const weightedPoints: WeightedPoint[] = riskPoints.map((point) => ({
      point,
      weightedIntensity: this.calculatePointRiskScore(
        Number(point.intensity),
        point.incidentDatetime,
        queryTime,
      ),
    }));

    const riskScore = this.calculateAggregateRiskScore(weightedPoints);
    const riskLevel = this.mapScoreToLevel(riskScore);

    return {
      district: district.name,
      is_safe: false,
      risk_level: riskLevel,
      risk_label: RISK_LABELS[riskLevel],
      risk_score: riskScore,
      heatmap: weightedPoints.map(({ point, weightedIntensity }) => ({
        lat: Number(point.lat),
        lng: Number(point.lng),
        intensity: weightedIntensity,
        location_name: point.locationName,
        category: point.category,
      })),
      message: `พื้นที่เขต${district.name}มีความเสี่ยงระดับ ${RISK_LABELS[riskLevel]}`,
    };
  }

  // เลือกเขตอัตโนมัติจากพิกัด โดยหาเขตที่มี center ใกล้ที่สุด (nearest-center)
  private async resolveDistrictFromCoords(
    lat: number,
    lng: number,
  ): Promise<District | null> {
    const districts = await this.districtRepo.find();
    if (districts.length === 0) return null;

    let nearest: District | null = null;
    let minDist = Infinity;
    for (const d of districts) {
      const dist = Math.hypot(Number(d.centerLat) - lat, Number(d.centerLng) - lng);
      if (dist < minDist) {
        minDist = dist;
        nearest = d;
      }
    }
    return nearest;
  }

  /**
   * Recency Weight — เหตุการณ์ที่เพิ่งเกิดขึ้นไม่นานมีน้ำหนักสูงกว่า (step decay)
   */
  private calculateRecencyFactor(incidentDate: Date, now: Date): number {
    const diffInDays =
      (now.getTime() - new Date(incidentDate).getTime()) / (1000 * 3600 * 24);

    if (diffInDays <= 30) return 1.0;
    if (diffInDays <= 90) return 0.85;
    if (diffInDays <= 180) return 0.7;
    if (diffInDays <= 365) return 0.5;
    return 0.3;
  }

  /**
   * Time-of-Day Multiplier — ถ้าเวลาที่ query ตรงกับช่วงที่จุดนั้นมีประวัติเกิดเหตุ (กลางคืน 19:00-04:00)
   * จะเพิ่มน้ำหนัก ถ้า query กลางวันแต่จุดนั้นเกิดเหตุกลางคืนบ่อยจะลดน้ำหนักลง
   */
  private calculateTimeOfDayFactor(incidentDate: Date, targetTime: Date): number {
    const incidentHour = new Date(incidentDate).getHours();
    const queryHour = targetTime.getHours();

    const isNightIncident = incidentHour >= 19 || incidentHour <= 4;
    const isNightQuery = queryHour >= 19 || queryHour <= 4;

    if (isNightQuery && isNightIncident) return 1.25;
    if (!isNightQuery && isNightIncident) return 0.85;
    return 1.0;
  }

  /**
   * คำนวณ risk score ของจุดเสี่ยงเดี่ยว ๆ (base intensity ถ่วงด้วย recency + time-of-day)
   * ผลลัพธ์ถูก cap ไว้ที่ 0.0 - 1.0
   */
  private calculatePointRiskScore(
    baseIntensity: number,
    incidentDatetime: Date,
    queryTime: Date,
  ): number {
    const recencyFactor = this.calculateRecencyFactor(incidentDatetime, queryTime);
    const timeFactor = this.calculateTimeOfDayFactor(incidentDatetime, queryTime);

    const finalScore = baseIntensity * recencyFactor * timeFactor;
    return Math.min(Math.max(Number(finalScore.toFixed(4)), 0), 1);
  }

  // risk_score รวมของทั้งเขต (0-100) จาก weighted intensity เฉลี่ย + ความหนาแน่นของจุด
  private calculateAggregateRiskScore(weighted: WeightedPoint[]): number {
    const totalIntensity = weighted.reduce(
      (sum, w) => sum + w.weightedIntensity,
      0,
    );
    const avgIntensity = totalIntensity / weighted.length;
    const densityBoost = Math.min(weighted.length, 10) * 2; // จุดยิ่งเยอะยิ่งเสี่ยงขึ้น
    const score = Math.round(avgIntensity * 80 + densityBoost);
    return Math.max(0, Math.min(100, score));
  }

  private mapScoreToLevel(score: number): Exclude<RiskLevel, null> {
    if (score >= 70) return 'red';
    if (score >= 40) return 'orange';
    return 'yellow';
  }
}
