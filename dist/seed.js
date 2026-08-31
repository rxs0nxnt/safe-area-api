"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const district_entity_1 = require("./districts/district.entity");
const risk_point_entity_1 = require("./safe-area/entities/risk-point.entity");
dotenv.config();
function parseCsv(content) {
    const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
    const headers = splitCsvLine(lines[0]);
    return lines.slice(1).map((line) => {
        const values = splitCsvLine(line);
        const row = {};
        headers.forEach((h, i) => (row[h] = values[i] ?? ''));
        return row;
    });
}
function splitCsvLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        }
        else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        }
        else {
            current += char;
        }
    }
    result.push(current);
    return result;
}
async function seed() {
    const dataSource = new typeorm_1.DataSource({
        type: 'mysql',
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 3306,
        username: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_DATABASE || 'safe_area_db',
        entities: [district_entity_1.District, risk_point_entity_1.RiskPoint],
        synchronize: true,
    });
    await dataSource.initialize();
    const districtRepo = dataSource.getRepository(district_entity_1.District);
    const riskPointRepo = dataSource.getRepository(risk_point_entity_1.RiskPoint);
    const dbDir = path.join(__dirname, '..', 'database');
    const districtsCsv = fs.readFileSync(path.join(dbDir, 'districts.csv'), 'utf-8');
    const districtRows = parseCsv(districtsCsv);
    for (const row of districtRows) {
        await districtRepo.upsert({
            id: Number(row.id),
            name: row.name,
            centerLat: Number(row.centerLat),
            centerLng: Number(row.centerLng),
            isSurveyed: true,
        }, ['id']);
    }
    console.log(`Seeded ${districtRows.length} districts.`);
    const riskPointsCsv = fs.readFileSync(path.join(dbDir, 'risk_points.csv'), 'utf-8');
    const riskPointRows = parseCsv(riskPointsCsv);
    for (const row of riskPointRows) {
        await riskPointRepo.upsert({
            id: Number(row.id),
            districtId: Number(row.district_id),
            locationName: row.location_name,
            category: row.category,
            lat: Number(row.lat),
            lng: Number(row.lng),
            intensity: Number(row.intensity),
            incidentDatetime: new Date(row.incident_datetime.replace(' ', 'T')),
        }, ['id']);
    }
    console.log(`Seeded ${riskPointRows.length} risk points.`);
    console.log('Seed completed.');
    await dataSource.destroy();
}
seed().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
});
//# sourceMappingURL=seed.js.map