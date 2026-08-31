import { SafeAreaService } from './safe-area.service';
import { QuerySafeAreaDto } from './dto/query-safe-area.dto';
import { SafeAreaResponseDto } from './dto/safe-area-response.dto';
export declare class SafeAreaController {
    private readonly safeAreaService;
    constructor(safeAreaService: SafeAreaService);
    getSafeArea(query: QuerySafeAreaDto): Promise<SafeAreaResponseDto>;
}
