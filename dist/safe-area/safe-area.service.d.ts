import { Repository } from 'typeorm';
import { District } from '../districts/district.entity';
import { RiskPoint } from './entities/risk-point.entity';
import { QuerySafeAreaDto } from './dto/query-safe-area.dto';
import { SafeAreaResponseDto } from './dto/safe-area-response.dto';
export declare class SafeAreaService {
    private readonly districtRepo;
    private readonly riskPointRepo;
    constructor(districtRepo: Repository<District>, riskPointRepo: Repository<RiskPoint>);
    findSafeArea(query: QuerySafeAreaDto): Promise<SafeAreaResponseDto>;
    private resolveDistrictFromCoords;
    private calculateRecencyFactor;
    private calculateTimeOfDayFactor;
    private calculatePointRiskScore;
    private calculateAggregateRiskScore;
    private mapScoreToLevel;
}
