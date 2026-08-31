import { RiskPoint } from '../safe-area/entities/risk-point.entity';
export declare class District {
    id: number;
    name: string;
    centerLat: number;
    centerLng: number;
    isSurveyed: boolean;
    riskPoints: RiskPoint[];
}
