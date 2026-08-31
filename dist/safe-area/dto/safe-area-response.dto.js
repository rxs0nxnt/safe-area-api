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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorMessageDto = exports.SafeAreaResponseDto = exports.HeatmapPointDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const risk_point_entity_1 = require("../entities/risk-point.entity");
class HeatmapPointDto {
}
exports.HeatmapPointDto = HeatmapPointDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 13.728 }),
    __metadata("design:type", Number)
], HeatmapPointDto.prototype, "lat", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 100.522 }),
    __metadata("design:type", Number)
], HeatmapPointDto.prototype, "lng", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 0.8, minimum: 0, maximum: 1 }),
    __metadata("design:type", Number)
], HeatmapPointDto.prototype, "intensity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'บริเวณสะพานลอยคนข้ามถนนหลานหลวง' }),
    __metadata("design:type", String)
], HeatmapPointDto.prototype, "location_name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: risk_point_entity_1.RiskCategory, example: risk_point_entity_1.RiskCategory.OVERPASS }),
    __metadata("design:type", String)
], HeatmapPointDto.prototype, "category", void 0);
class SafeAreaResponseDto {
}
exports.SafeAreaResponseDto = SafeAreaResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'บางรัก' }),
    __metadata("design:type", String)
], SafeAreaResponseDto.prototype, "district", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: false }),
    __metadata("design:type", Boolean)
], SafeAreaResponseDto.prototype, "is_safe", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'orange',
        enum: ['red', 'orange', 'yellow'],
        nullable: true,
    }),
    __metadata("design:type", Object)
], SafeAreaResponseDto.prototype, "risk_level", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'ส้ม',
        enum: ['แดง', 'ส้ม', 'เหลือง'],
        nullable: true,
    }),
    __metadata("design:type", Object)
], SafeAreaResponseDto.prototype, "risk_label", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 65, minimum: 0, maximum: 100 }),
    __metadata("design:type", Number)
], SafeAreaResponseDto.prototype, "risk_score", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [HeatmapPointDto] }),
    __metadata("design:type", Array)
], SafeAreaResponseDto.prototype, "heatmap", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'พื้นที่เขตบางรักมีความเสี่ยงระดับ ส้ม' }),
    __metadata("design:type", String)
], SafeAreaResponseDto.prototype, "message", void 0);
class ErrorMessageDto {
}
exports.ErrorMessageDto = ErrorMessageDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ไม่พบเขตที่ระบุในระบบ กรุณาตรวจสอบชื่อเขตอีกครั้ง' }),
    __metadata("design:type", String)
], ErrorMessageDto.prototype, "message", void 0);
//# sourceMappingURL=safe-area-response.dto.js.map