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
exports.RiskPoint = exports.RiskCategory = void 0;
const typeorm_1 = require("typeorm");
const district_entity_1 = require("../../districts/district.entity");
var RiskCategory;
(function (RiskCategory) {
    RiskCategory["OVERPASS"] = "overpass";
    RiskCategory["DARK_ALLEY"] = "dark_alley";
    RiskCategory["PARK"] = "park";
    RiskCategory["ABANDONED_BUILDING"] = "abandoned_building";
    RiskCategory["OTHER"] = "other";
})(RiskCategory || (exports.RiskCategory = RiskCategory = {}));
let RiskPoint = class RiskPoint {
};
exports.RiskPoint = RiskPoint;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], RiskPoint.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => district_entity_1.District, (district) => district.riskPoints, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'district_id' }),
    __metadata("design:type", district_entity_1.District)
], RiskPoint.prototype, "district", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'district_id' }),
    __metadata("design:type", Number)
], RiskPoint.prototype, "districtId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'location_name', type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], RiskPoint.prototype, "locationName", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: RiskCategory,
        default: RiskCategory.OTHER,
    }),
    __metadata("design:type", String)
], RiskPoint.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 8 }),
    __metadata("design:type", Number)
], RiskPoint.prototype, "lat", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 11, scale: 8 }),
    __metadata("design:type", Number)
], RiskPoint.prototype, "lng", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 3, scale: 2 }),
    __metadata("design:type", Number)
], RiskPoint.prototype, "intensity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'incident_datetime', type: 'datetime' }),
    __metadata("design:type", Date)
], RiskPoint.prototype, "incidentDatetime", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], RiskPoint.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], RiskPoint.prototype, "updatedAt", void 0);
exports.RiskPoint = RiskPoint = __decorate([
    (0, typeorm_1.Entity)('risk_points')
], RiskPoint);
//# sourceMappingURL=risk-point.entity.js.map