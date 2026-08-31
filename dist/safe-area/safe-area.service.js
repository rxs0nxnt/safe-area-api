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
exports.SafeAreaService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const district_entity_1 = require("../districts/district.entity");
const risk_point_entity_1 = require("./entities/risk-point.entity");
const RISK_LABELS = {
    red: 'แดง',
    orange: 'ส้ม',
    yellow: 'เหลือง',
};
let SafeAreaService = class SafeAreaService {
    constructor(districtRepo, riskPointRepo) {
        this.districtRepo = districtRepo;
        this.riskPointRepo = riskPointRepo;
    }
    async findSafeArea(query) {
        const hasCoords = query.lat !== undefined && query.lng !== undefined;
        if (!query.district && !hasCoords) {
            throw new common_1.UnprocessableEntityException({
                message: 'กรุณาระบุชื่อเขต หรือพิกัดตำแหน่ง',
            });
        }
        const queryTime = query.at ? new Date(query.at) : new Date();
        let district;
        try {
            if (query.district) {
                district = await this.districtRepo.findOne({
                    where: { name: query.district },
                });
            }
            else {
                district = await this.resolveDistrictFromCoords(query.lat, query.lng);
            }
        }
        catch (err) {
            throw new common_1.BadGatewayException({
                message: 'ไม่สามารถเชื่อมต่อฐานข้อมูลจุดเสี่ยงได้ กรุณาลองใหม่',
            });
        }
        if (!district) {
            throw new common_1.NotFoundException({
                message: 'ไม่พบเขตที่ระบุในระบบ กรุณาตรวจสอบชื่อเขตอีกครั้ง',
            });
        }
        let riskPoints;
        try {
            riskPoints = await this.riskPointRepo.find({
                where: { districtId: district.id },
            });
        }
        catch (err) {
            throw new common_1.BadGatewayException({
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
        const weightedPoints = riskPoints.map((point) => ({
            point,
            weightedIntensity: this.calculatePointRiskScore(Number(point.intensity), point.incidentDatetime, queryTime),
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
    async resolveDistrictFromCoords(lat, lng) {
        const districts = await this.districtRepo.find();
        if (districts.length === 0)
            return null;
        let nearest = null;
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
    calculateRecencyFactor(incidentDate, now) {
        const diffInDays = (now.getTime() - new Date(incidentDate).getTime()) / (1000 * 3600 * 24);
        if (diffInDays <= 30)
            return 1.0;
        if (diffInDays <= 90)
            return 0.85;
        if (diffInDays <= 180)
            return 0.7;
        if (diffInDays <= 365)
            return 0.5;
        return 0.3;
    }
    calculateTimeOfDayFactor(incidentDate, targetTime) {
        const incidentHour = new Date(incidentDate).getHours();
        const queryHour = targetTime.getHours();
        const isNightIncident = incidentHour >= 19 || incidentHour <= 4;
        const isNightQuery = queryHour >= 19 || queryHour <= 4;
        if (isNightQuery && isNightIncident)
            return 1.25;
        if (!isNightQuery && isNightIncident)
            return 0.85;
        return 1.0;
    }
    calculatePointRiskScore(baseIntensity, incidentDatetime, queryTime) {
        const recencyFactor = this.calculateRecencyFactor(incidentDatetime, queryTime);
        const timeFactor = this.calculateTimeOfDayFactor(incidentDatetime, queryTime);
        const finalScore = baseIntensity * recencyFactor * timeFactor;
        return Math.min(Math.max(Number(finalScore.toFixed(4)), 0), 1);
    }
    calculateAggregateRiskScore(weighted) {
        const totalIntensity = weighted.reduce((sum, w) => sum + w.weightedIntensity, 0);
        const avgIntensity = totalIntensity / weighted.length;
        const densityBoost = Math.min(weighted.length, 10) * 2;
        const score = Math.round(avgIntensity * 80 + densityBoost);
        return Math.max(0, Math.min(100, score));
    }
    mapScoreToLevel(score) {
        if (score >= 70)
            return 'red';
        if (score >= 40)
            return 'orange';
        return 'yellow';
    }
};
exports.SafeAreaService = SafeAreaService;
exports.SafeAreaService = SafeAreaService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(district_entity_1.District)),
    __param(1, (0, typeorm_1.InjectRepository)(risk_point_entity_1.RiskPoint)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], SafeAreaService);
//# sourceMappingURL=safe-area.service.js.map