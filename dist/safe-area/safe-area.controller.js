"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SafeAreaController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const safe_area_service_1 = require("./safe-area.service");
const query_safe_area_dto_1 = require("./dto/query-safe-area.dto");
const safe_area_response_dto_1 = require("./dto/safe-area-response.dto");
let SafeAreaController = class SafeAreaController {
    constructor(safeAreaService) {
        this.safeAreaService = safeAreaService;
    }
    async getSafeArea(query) {
        return this.safeAreaService.findSafeArea(query);
    }
};
exports.SafeAreaController = SafeAreaController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'ค้นหาข้อมูลจุดเสี่ยงของพื้นที่ตามเขต' }),
    (0, swagger_1.ApiOkResponse)({ type: safe_area_response_dto_1.SafeAreaResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 404, type: safe_area_response_dto_1.ErrorMessageDto, description: 'ไม่พบข้อมูลเขตที่ค้นหาในระบบ' }),
    (0, swagger_1.ApiResponse)({ status: 422, type: safe_area_response_dto_1.ErrorMessageDto, description: 'ส่ง parameter ไม่ครบ' }),
    (0, swagger_1.ApiResponse)({ status: 502, type: safe_area_response_dto_1.ErrorMessageDto, description: 'เรียกข้อมูลจุดเสี่ยงไม่สำเร็จ' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_safe_area_dto_1.QuerySafeAreaDto]),
    __metadata("design:returntype", Promise)
], SafeAreaController.prototype, "getSafeArea", null);
exports.SafeAreaController = SafeAreaController = __decorate([
    (0, swagger_1.ApiTags)('safe-area'),
    (0, common_1.Controller)('safe-area'),
    __metadata("design:paramtypes", [safe_area_service_1.SafeAreaService])
], SafeAreaController);
//# sourceMappingURL=safe-area.controller.js.map