import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { District } from './districts/district.entity';
import { RiskPoint, RiskCategory } from './safe-area/entities/risk-point.entity';

dotenv.config();

// CSV parser เล็ก ๆ ที่รองรับ field ที่ครอบด้วย " " (เผื่อมี comma อยู่ในชื่อสถานที่)
function parseCsv(content: string): Record<string, string>[] {
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const headers = splitCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = splitCsvLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => (row[h] = values[i] ?? ''));
    return row;
  });
}

function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

async function seed() {
  const dataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'safe_area_db',
    entities: [District, RiskPoint],
    synchronize: true,
  });

  await dataSource.initialize();

  const districtRepo = dataSource.getRepository(District);
  const riskPointRepo = dataSource.getRepository(RiskPoint);

  const dbDir = path.join(__dirname, '..', 'database');

  // --- 1. Import districts.csv ---
  const districtsCsv = fs.readFileSync(
    path.join(dbDir, 'districts.csv'),
    'utf-8',
  );
  const districtRows = parseCsv(districtsCsv);

  for (const row of districtRows) {
    await districtRepo.upsert(
      {
        id: Number(row.id),
        name: row.name,
        centerLat: Number(row.centerLat),
        centerLng: Number(row.centerLng),
        isSurveyed: true,
      },
      ['id'],
    );
  }
  console.log(`Seeded ${districtRows.length} districts.`);

  // --- 2. Import risk_points.csv ---
  const riskPointsCsv = fs.readFileSync(
    path.join(dbDir, 'risk_points.csv'),
    'utf-8',
  );
  const riskPointRows = parseCsv(riskPointsCsv);

  for (const row of riskPointRows) {
    await riskPointRepo.upsert(
      {
        id: Number(row.id),
        districtId: Number(row.district_id),
        locationName: row.location_name,
        category: row.category as RiskCategory,
        lat: Number(row.lat),
        lng: Number(row.lng),
        intensity: Number(row.intensity),
        incidentDatetime: new Date(row.incident_datetime.replace(' ', 'T')),
      },
      ['id'],
    );
  }
  console.log(`Seeded ${riskPointRows.length} risk points.`);

  console.log('Seed completed.');
  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
