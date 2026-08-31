"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SafeAreaModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const safe_area_controller_1 = require("./safe-area.controller");
const safe_area_service_1 = require("./safe-area.service");
const risk_point_entity_1 = require("./entities/risk-point.entity");
const district_entity_1 = require("../districts/district.entity");
let SafeAreaModule = class SafeAreaModule {
};
exports.SafeAreaModule = SafeAreaModule;
exports.SafeAreaModule = SafeAreaModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([district_entity_1.District, risk_point_entity_1.RiskPoint])],
        controllers: [safe_area_controller_1.SafeAreaController],
        providers: [safe_area_service_1.SafeAreaService],
    })
], SafeAreaModule);
//# sourceMappingURL=safe-area.module.js.map