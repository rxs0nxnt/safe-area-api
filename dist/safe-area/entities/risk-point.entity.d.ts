import { District } from '../../districts/district.entity';
export declare enum RiskCategory {
    OVERPASS = "overpass",
    DARK_ALLEY = "dark_alley",
    PARK = "park",
    ABANDONED_BUILDING = "abandoned_building",
    OTHER = "other"
}
export declare class RiskPoint {
    id: number;
    district: District;
    districtId: number;
    locationName: string;
    category: RiskCategory;
    lat: number;
    lng: number;
    intensity: number;
    incidentDatetime: Date;
    createdAt: Date;
    updatedAt: Date;
}
