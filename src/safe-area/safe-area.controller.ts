import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiTags, ApiResponse } from '@nestjs/swagger';
import { SafeAreaService } from './safe-area.service';
import { QuerySafeAreaDto } from './dto/query-safe-area.dto';
import {
  ErrorMessageDto,
  SafeAreaResponseDto,
} from './dto/safe-area-response.dto';

@ApiTags('safe-area')
@Controller('safe-area')
export class SafeAreaController {
  constructor(private readonly safeAreaService: SafeAreaService) {}

  @Get()
  @ApiOperation({ summary: 'ค้นหาข้อมูลจุดเสี่ยงของพื้นที่ตามเขต' })
  @ApiOkResponse({ type: SafeAreaResponseDto })
  @ApiResponse({ status: 404, type: ErrorMessageDto, description: 'ไม่พบข้อมูลเขตที่ค้นหาในระบบ' })
  @ApiResponse({ status: 422, type: ErrorMessageDto, description: 'ส่ง parameter ไม่ครบ' })
  @ApiResponse({ status: 502, type: ErrorMessageDto, description: 'เรียกข้อมูลจุดเสี่ยงไม่สำเร็จ' })
  async getSafeArea(
    @Query() query: QuerySafeAreaDto,
  ): Promise<SafeAreaResponseDto> {
    return this.safeAreaService.findSafeArea(query);
  }
}
