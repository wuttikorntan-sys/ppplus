-- ============================================
-- PP Plus - Hostinger Database Seed
-- Paste this in phpMyAdmin > SQL tab
-- Database: u626866170_ppplus
-- ============================================

-- 1. TABLES
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
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
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
  videoUrl VARCHAR(500) NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS blog_posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titleTh VARCHAR(500) NOT NULL,
  titleEn VARCHAR(500) NOT NULL,
  contentTh LONGTEXT NOT NULL,
  contentEn LONGTEXT NOT NULL,
  excerptTh TEXT NOT NULL,
  excerptEn TEXT NOT NULL,
  image VARCHAR(500) NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  tags TEXT NOT NULL,
  isPublished TINYINT(1) NOT NULL DEFAULT 0,
  publishedAt DATETIME NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  rating INT NOT NULL,
  comment TEXT NOT NULL,
  isApproved TINYINT(1) NOT NULL DEFAULT 0,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS popups (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  titleTh VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  descriptionTh TEXT NOT NULL,
  imageUrl VARCHAR(500) NULL,
  badge VARCHAR(100) NOT NULL DEFAULT '',
  tags TEXT NOT NULL,
  tagsTh TEXT NOT NULL,
  features TEXT NOT NULL,
  featuresTh TEXT NOT NULL,
  buttonText VARCHAR(255) NOT NULL DEFAULT '',
  buttonTextTh VARCHAR(255) NOT NULL DEFAULT '',
  isActive TINYINT(1) NOT NULL DEFAULT 1,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS hero_slides (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type VARCHAR(50) NOT NULL DEFAULT 'image',
  image VARCHAR(500) NULL,
  videoUrl VARCHAR(500) NULL,
  titleTh VARCHAR(500) NULL,
  titleEn VARCHAR(500) NULL,
  isActive TINYINT(1) NOT NULL DEFAULT 1,
  sortOrder INT NOT NULL DEFAULT 0,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS gallery_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  image VARCHAR(500) NOT NULL,
  category VARCHAR(100) NOT NULL DEFAULT 'general',
  labelTh VARCHAR(255) NULL,
  labelEn VARCHAR(255) NULL,
  sortOrder INT NOT NULL DEFAULT 0,
  isActive TINYINT(1) NOT NULL DEFAULT 1,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS site_contents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  `key` VARCHAR(255) NOT NULL UNIQUE,
  valueTh TEXT NOT NULL,
  valueEn TEXT NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'text',
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS color_formulas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  carBrand VARCHAR(100) NOT NULL,
  colorCode VARCHAR(50) NOT NULL,
  colorNameTh VARCHAR(200) NULL,
  colorNameEn VARCHAR(200) NULL,
  yearRange VARCHAR(50) NULL,
  formulaType ENUM('solid','metallic','pearl') NOT NULL DEFAULT 'solid',
  deltaE DECIMAL(4,2) NULL,
  image VARCHAR(500) NULL,
  isActive TINYINT(1) NOT NULL DEFAULT 1,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS b2b_applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  companyName VARCHAR(200) NOT NULL,
  contactPerson VARCHAR(200) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(200) NOT NULL,
  businessType VARCHAR(100) NOT NULL,
  province VARCHAR(100) NULL,
  message TEXT NULL,
  status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS quote_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(200) NULL,
  company VARCHAR(200) NULL,
  productId INT NULL,
  productName VARCHAR(255) NULL,
  quantity VARCHAR(100) NULL,
  message TEXT NULL,
  cartItems JSON NULL,
  status ENUM('pending','quoted','closed') NOT NULL DEFAULT 'pending',
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. ADMIN USER (admin@ppplus.co.th / admin123)
INSERT INTO users (email, password, name, role, locale) VALUES
('admin@ppplus.co.th', '$2b$10$BCTdQ7Nvr5UtgAGQYsDcBeXbgQOvlIrEmEy8YPPHYXQAXhHp2TAgS', 'Admin', 'ADMIN', 'th');

-- 3. SITE CONTENTS
INSERT INTO site_contents (`key`, valueTh, valueEn, type) VALUES
('store_name', 'PP Plus', 'PP Plus', 'text'),
('store_phone', '02-XXX-XXXX', '02-XXX-XXXX', 'text'),
('store_email', 'info@ppplus.co.th', 'info@ppplus.co.th', 'text'),
('store_address', 'กรุงเทพฯ', 'Bangkok', 'text'),
('store_hours', 'จันทร์-เสาร์ 08:00-17:00', 'Mon-Sat 08:00-17:00', 'text');

-- 4. CATEGORIES (12 automotive paint categories)
INSERT INTO categories (nameTh, nameEn, sortOrder) VALUES
('2K Topcoat', '2K Topcoat', 1),
('Basecoat', 'Basecoat', 2),
('Clear Coat', 'Clear Coat', 3),
('Primer / Surfacer', 'Primer / Surfacer', 4),
('Epoxy Primer', 'Epoxy Primer', 5),
('ทินเนอร์', 'Thinner', 6),
('ฮาร์ดเดนเนอร์', 'Hardener', 7),
('สารเติมแต่ง', 'Additives', 8),
('ปืนพ่นสี', 'Spray Gun', 9),
('กระดาษทราย', 'Sandpaper', 10),
('เครื่องขัด', 'Polisher', 11),
('อุปกรณ์ป้องกัน (PPE)', 'PPE', 12);

-- 5. SAMPLE COLOR FORMULAS
INSERT INTO color_formulas (carBrand, colorCode, colorNameTh, colorNameEn, yearRange, formulaType, deltaE) VALUES
('TOYOTA', '040', 'ซุปเปอร์ไวท์', 'Super White', '2015-2026', 'solid', 0.35),
('TOYOTA', '1G3', 'เกร์ เมทัลลิก', 'Grey Metallic', '2018-2026', 'metallic', 0.42),
('TOYOTA', '3R3', 'เรด ไมก้า เมทัลลิก', 'Red Mica Metallic', '2017-2025', 'metallic', 0.38),
('HONDA', 'NH-731P', 'คริสตัล แบล็ค เพิร์ล', 'Crystal Black Pearl', '2016-2026', 'pearl', 0.28),
('HONDA', 'NH-883P', 'พลาทินัม ไวท์ เพิร์ล', 'Platinum White Pearl', '2019-2026', 'pearl', 0.31),
('NISSAN', 'KH3', 'ซุปเปอร์ แบล็ค', 'Super Black', '2015-2026', 'solid', 0.25),
('ISUZU', '527', 'ซิลเวอร์ เมทัลลิก', 'Silver Metallic', '2020-2026', 'metallic', 0.40),
('MAZDA', '46V', 'โซล เรด คริสตัล เมทัลลิก', 'Soul Red Crystal Metallic', '2019-2026', 'pearl', 0.33),
('FORD', 'PN4GE', 'เมทิโอ ไกร์ เมทัลลิก', 'Meteor Grey Metallic', '2020-2025', 'metallic', 0.37),
('MITSUBISHI', 'W13', 'ไวท์ เพิร์ล', 'White Pearl', '2018-2026', 'pearl', 0.30);
