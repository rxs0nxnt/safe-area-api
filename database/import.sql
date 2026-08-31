-- คำสั่ง import ข้อมูลจากไฟล์ CSV เข้า MySQL
-- ก่อนรัน: วางไฟล์ districts.csv และ risk_points.csv ไว้ในโฟลเดอร์ที่ MySQL อ่านได้
-- (ปกติคือ /var/lib/mysql-files/ หรือใช้ mysql client กับ --local-infile=1 แล้วเปลี่ยนเป็น LOAD DATA LOCAL INFILE)

USE `safe_area_db`;

-- Import districts (ต้อง import ก่อน risk_points เพราะมี FK)
LOAD DATA INFILE '/var/lib/mysql-files/districts.csv'
INTO TABLE `districts`
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 LINES
(id, name, centerLat, centerLng);

ALTER TABLE `districts` AUTO_INCREMENT = 51;

-- Import risk_points
LOAD DATA INFILE '/var/lib/mysql-files/risk_points.csv'
INTO TABLE `risk_points`
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 LINES
(id, district_id, location_name, category, lat, lng, intensity, incident_datetime);

ALTER TABLE `risk_points` AUTO_INCREMENT = 40;
