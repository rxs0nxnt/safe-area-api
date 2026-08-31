-- Safe Area API — MySQL DDL
-- charset utf8mb4 เพื่อรองรับภาษาไทยเต็มรูปแบบ

CREATE DATABASE IF NOT EXISTS `safe_area_db`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `safe_area_db`;

-- 1. ตาราง districts (ต้องสร้างก่อน เพราะ risk_points อ้าง FK มาที่นี่)
CREATE TABLE IF NOT EXISTS `districts` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `centerLat` DECIMAL(10, 8) NOT NULL,
  `centerLng` DECIMAL(11, 8) NOT NULL,
  `is_surveyed` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_districts_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. ตาราง risk_points
CREATE TABLE IF NOT EXISTS `risk_points` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `district_id` INT NOT NULL,
  `location_name` VARCHAR(255) NOT NULL,
  `category` ENUM('overpass', 'dark_alley', 'park', 'abandoned_building', 'other') NOT NULL DEFAULT 'other',
  `lat` DECIMAL(10, 8) NOT NULL,
  `lng` DECIMAL(11, 8) NOT NULL,
  `intensity` DECIMAL(3, 2) NOT NULL,
  `incident_datetime` DATETIME NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_risk_points_districts_idx` (`district_id`),
  CONSTRAINT `fk_risk_points_districts` FOREIGN KEY (`district_id`) REFERENCES `districts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
