-- ============================================
-- PP Plus — Schema + Categories Import (ไม่มีสินค้าตัวอย่าง)
-- ============================================
-- วิธีใช้:
--   1. เข้า Hostinger hPanel → phpMyAdmin
--   2. เลือกฐานข้อมูล (u626866170_ppplus)
--   3. แท็บ "Import" → เลือกไฟล์นี้ → Go
--   หรือแท็บ "SQL" → paste เนื้อหาทั้งหมด → Go
--
-- ไฟล์นี้ทำแค่:
--   • สร้าง/อัปเดต schema ให้ครบ (รวมคอลัมน์ใหม่)
--   • เพิ่ม 12 หมวดหมู่สีพ่นรถยนต์
--   • ไม่มีสินค้าตัวอย่าง — สินค้าให้เพิ่มผ่าน /admin/menu
--
-- ปลอดภัย: รันซ้ำได้ ไม่ลบข้อมูลเก่า
--   • CREATE TABLE IF NOT EXISTS (ข้าม table ที่มีอยู่)
--   • ALTER TABLE เพิ่มคอลัมน์ใหม่เฉพาะเมื่อยังไม่มี
--   • INSERT IGNORE (ข้ามหมวดที่มีชื่อซ้ำ)
-- ============================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- 1. TABLES (สร้างเฉพาะที่ยังไม่มี)
-- ============================================

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NULL,
  role ENUM('CUSTOMER','ADMIN') NOT NULL DEFAULT 'CUSTOMER',
  locale VARCHAR(10) NOT NULL DEFAULT 'th',
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nameTh VARCHAR(255) NOT NULL,
  nameEn VARCHAR(255) NOT NULL,
  sortOrder INT NOT NULL DEFAULT 0,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY ux_categories_nameEn (nameEn)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS menu_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  categoryId INT NOT NULL,
  nameTh VARCHAR(255) NOT NULL,
  nameEn VARCHAR(255) NOT NULL,
  descriptionTh TEXT NOT NULL,
  descriptionEn TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  image VARCHAR(500) NULL,
  isAvailable TINYINT(1) NOT NULL DEFAULT 1,
  sortOrder INT NOT NULL DEFAULT 0,
  brand VARCHAR(255) NULL,
  colorCode VARCHAR(50) NULL,
  colorName VARCHAR(255) NULL,
  finishType VARCHAR(100) NULL,
  coverageArea DECIMAL(10,2) NULL,
  size VARCHAR(100) NULL,
  unit VARCHAR(50) NULL,
  mixingRatio VARCHAR(50) NULL,
  applicationMethodTh TEXT NULL,
  applicationMethodEn TEXT NULL,
  featuresTh TEXT NULL,
  featuresEn TEXT NULL,
  tdsFile VARCHAR(500) NULL,
  sdsFile VARCHAR(500) NULL,
  videoUrl VARCHAR(500) NULL,
  specColor VARCHAR(100) NULL,
  specDensity VARCHAR(50) NULL,
  specFlashPoint VARCHAR(50) NULL,
  specPotLife VARCHAR(100) NULL,
  relatedProductIds TEXT NULL,
  safetyNotesTh TEXT NULL,
  safetyNotesEn TEXT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 2. MIGRATIONS — เพิ่มคอลัมน์ใหม่ใน menu_items
-- (ปลอดภัยสำหรับ DB เก่าที่ยังไม่มีคอลัมน์เหล่านี้)
-- ============================================

DROP PROCEDURE IF EXISTS ppplus_add_column;
DELIMITER $$
CREATE PROCEDURE ppplus_add_column(
  IN p_table VARCHAR(64),
  IN p_column VARCHAR(64),
  IN p_ddl VARCHAR(255)
)
BEGIN
  DECLARE cnt INT DEFAULT 0;
  SELECT COUNT(*) INTO cnt
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = p_table
      AND COLUMN_NAME = p_column;
  IF cnt = 0 THEN
    SET @stmt = CONCAT('ALTER TABLE `', p_table, '` ADD COLUMN ', p_ddl);
    PREPARE q FROM @stmt;
    EXECUTE q;
    DEALLOCATE PREPARE q;
  END IF;
END$$
DELIMITER ;

CALL ppplus_add_column('menu_items', 'sdsFile',           '`sdsFile` VARCHAR(500) NULL AFTER `tdsFile`');
CALL ppplus_add_column('menu_items', 'specColor',         '`specColor` VARCHAR(100) NULL');
CALL ppplus_add_column('menu_items', 'specDensity',       '`specDensity` VARCHAR(50) NULL');
CALL ppplus_add_column('menu_items', 'specFlashPoint',    '`specFlashPoint` VARCHAR(50) NULL');
CALL ppplus_add_column('menu_items', 'specPotLife',       '`specPotLife` VARCHAR(100) NULL');
CALL ppplus_add_column('menu_items', 'relatedProductIds', '`relatedProductIds` TEXT NULL');
CALL ppplus_add_column('menu_items', 'safetyNotesTh',     '`safetyNotesTh` TEXT NULL');
CALL ppplus_add_column('menu_items', 'safetyNotesEn',     '`safetyNotesEn` TEXT NULL');

DROP PROCEDURE IF EXISTS ppplus_add_column;

-- ============================================
-- 3. CATEGORIES (12 หมวดหมู่หลัก) — INSERT IGNORE
-- ============================================

INSERT IGNORE INTO categories (nameTh, nameEn, sortOrder) VALUES
  ('2K Topcoat',         '2K Topcoat',         1),
  ('Basecoat',           'Basecoat',           2),
  ('Clear Coat',         'Clear Coat',         3),
  ('Primer / Surfacer',  'Primer / Surfacer',  4),
  ('Epoxy Primer',       'Epoxy Primer',       5),
  ('ทินเนอร์',            'Thinner',            6),
  ('ฮาร์ดเดนเนอร์',        'Hardener',           7),
  ('สารเติมแต่ง',          'Additives',          8),
  ('ปืนพ่นสี',             'Spray Gun',          9),
  ('กระดาษทราย',          'Sandpaper',          10),
  ('เครื่องขัด',           'Polisher',           11),
  ('อุปกรณ์ป้องกัน (PPE)', 'PPE',                12);

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- ✅ เสร็จสิ้น
-- ตรวจสอบหมวดหมู่:    SELECT id, nameEn FROM categories;
-- ตรวจสอบ schema:     DESCRIBE menu_items;
-- เพิ่มสินค้าต่อที่:   /admin/menu
-- ============================================
