import { RiskCategory } from '../entities/risk-point.entity';
export type RiskLevel = 'red' | 'orange' | 'yellow' | null;
export declare class HeatmapPointDto {
    lat: number;
    lng: number;
    intensity: number;
    location_name: string;
    category: RiskCategory;
}
export declare class SafeAreaResponseDto {
    district: string;
    is_safe: boolean;
    risk_level: RiskLevel;
    risk_label: string | null;
    risk_score: number;
    heatmap: HeatmapPointDto[];
    message: string;
}
export declare class ErrorMessageDto {
    message: string;
}
