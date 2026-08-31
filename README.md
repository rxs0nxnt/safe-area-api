# Safe Area API (NestJS + MySQL)

Implementation ของ `openapi.json` (Safe Area API) โดยใช้ **NestJS** และ **MySQL** (ผ่าน TypeORM)
พร้อมข้อมูลจริง 50 เขต กทม. + 39 จุดเสี่ยง และ risk scoring แบบถ่วงน้ำหนักด้วย recency + time-of-day

## โครงสร้าง

```
database/
  schema.sql        # DDL: CREATE DATABASE + ตาราง districts, risk_points
  import.sql        # LOAD DATA INFILE สำหรับ import CSV ทั้งสองไฟล์
  districts.csv      # ข้อมูล 50 เขต กทม.
  risk_points.csv     # ข้อมูล 39 จุดเสี่ยง (มี category + incident_datetime)
src/
  main.ts                 # bootstrap + Swagger (/docs)
  app.module.ts            # ต่อ MySQL ผ่าน TypeORM
  seed.ts                  # อ่าน CSV ใน database/ แล้ว upsert เข้า MySQL ผ่าน TypeORM
  districts/
    district.entity.ts     # ตาราง districts
  safe-area/
    safe-area.module.ts
    safe-area.controller.ts  # GET /safe-area
    safe-area.service.ts     # logic: หา district → หา risk points → คำนวณ risk score/level
    entities/risk-point.entity.ts  # ตาราง risk_points (มี RiskCategory enum)
    dto/
```

## Endpoint

`GET /safe-area?district=บางรัก`
`GET /safe-area?lat=13.7279&lng=100.5214`
`GET /safe-area?district=บางรัก&at=2026-09-01T22:30:00` (ระบุเวลาที่ใช้คำนวณ time-of-day weighting)

- **200**: พบ/ไม่พบจุดเสี่ยง → ส่ง `SafeAreaResponse` (มี `heatmap` ถ้าเสี่ยง — แต่ละจุดมี `location_name`, `category`, `intensity` ที่ถูกถ่วงน้ำหนักแล้ว)
- **404**: ไม่พบเขตในระบบ
- **422**: ไม่ได้ส่ง `district` หรือ `lat`/`lng` มาเลย
- **502**: query ฐานข้อมูลล้มเหลว

### วิธีคำนวณ risk score

อยู่ใน `safe-area.service.ts`:

1. **`calculatePointRiskScore`** — คำนวณคะแนนต่อจุดเสี่ยง 1 จุด จาก `intensity` ฐาน (ในฐานข้อมูล) คูณด้วย
   - **Recency factor** (step decay): เหตุใน 30 วันล่าสุด = น้ำหนักเต็ม 1.0, 1-3 เดือน = 0.85, 3-6 เดือน = 0.70, 6-12 เดือน = 0.50, เกิน 1 ปี = 0.30
   - **Time-of-day factor**: ถ้าเวลาที่ query (`at` หรือเวลาปัจจุบัน) อยู่ในช่วงกลางคืน (19:00–04:00) และจุดนั้นมีประวัติเกิดเหตุกลางคืน → คูณ 1.25, ถ้า query กลางวันแต่จุดเกิดเหตุกลางคืน → คูณ 0.85 ลดความสำคัญลง
2. **`calculateAggregateRiskScore`** — รวมคะแนนที่ถ่วงน้ำหนักแล้วของทุกจุดในเขต (ค่าเฉลี่ย × 80 + density boost) ได้ risk_score 0-100
3. **`mapScoreToLevel`** — map เป็น red (≥70) / orange (≥40) / yellow (<40)

ปรับ threshold หรือน้ำหนักตัวคูณได้ตรงจุดเหล่านี้เมื่อมีข้อมูลจริงมากขึ้น (เช่น crime rate, lighting, crowdsourced report ตามที่เคยเสนอไว้ในสูตร weighted scoring model — ยังไม่ได้ผูกเข้ามาเพราะยังไม่มี raw data ของปัจจัยเหล่านั้น)

## ติดตั้งและรัน

### วิธีที่ 1: สร้าง schema ด้วย TypeORM sync + seed ผ่าน Node (แนะนำสำหรับ dev)

```bash
cp .env.example .env
# แก้ DB_HOST / DB_USERNAME / DB_PASSWORD / DB_DATABASE ให้ตรงกับ MySQL ของคุณ
# ต้องสร้าง database เปล่า ๆ ไว้ก่อน (ชื่อเดียวกับ DB_DATABASE ใน .env)

npm install
npm run seed         # อ่าน database/districts.csv + risk_points.csv แล้ว insert เข้า MySQL
npm run start:dev
```

### วิธีที่ 2: สร้างตารางด้วย DDL ตรง ๆ แล้ว LOAD DATA INFILE (แนะนำสำหรับ production/staging)

```bash
mysql -u root -p < database/schema.sql

# วางไฟล์ CSV ไว้ในโฟลเดอร์ที่ MySQL server อ่านได้ (ปกติ /var/lib/mysql-files/)
# หรือแก้ import.sql ให้ใช้ LOAD DATA LOCAL INFILE แล้วรันผ่าน client ที่เปิด --local-infile=1
cp database/districts.csv database/risk_points.csv /var/lib/mysql-files/
mysql -u root -p < database/import.sql
```

จากนั้นปิด `synchronize` ใน `app.module.ts` (ตั้งเป็น `false`) เพราะ schema ถูกสร้างจาก DDL แล้ว ไม่ต้องให้ TypeORM auto-sync ทับ

- Swagger UI: http://localhost:3000/docs
- ทดสอบ: `GET http://localhost:3000/safe-area?district=บางรัก`

## หมายเหตุ

- `synchronize: true` ใน `app.module.ts` เหมาะสำหรับ dev เท่านั้น — บน production ให้ปิดและใช้ migration หรือ DDL ใน `database/schema.sql` แทน
- การเลือกเขตจาก `lat`/`lng` ใช้วิธี nearest-center แบบง่าย (ระยะทางจาก `centerLat/centerLng` ของแต่ละเขต) สามารถเปลี่ยนไปใช้ reverse-geocoding หรือ polygon boundary จริงได้ภายหลัง
- เขตที่ไม่มีจุดเสี่ยงในฐานข้อมูล = ถือว่า `is_safe: true` ทั้งหมด (~20 เขตจาก 50 เขต) — ถ้าต้องการแยก "ปลอดภัยจริง" กับ "ยังไม่ได้สำรวจ" ให้ใช้ field `isSurveyed` ใน `District` entity ประกอบการตัดสินใจใน service เพิ่มเติม (ตอนนี้ยังไม่ได้ผูก logic นี้เข้ากับ response)
- ไฟล์ `.bru` เดิม (Bruno collection) ยังใช้ทดสอบ endpoint นี้ได้ตามปกติ เพราะ path/response shape ตรงกับ `openapi.json` (มีการเพิ่ม field `location_name`, `category` ใน heatmap point เมื่อเทียบกับสเปกเดิม)
