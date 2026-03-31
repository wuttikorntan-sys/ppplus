/* eslint-disable @typescript-eslint/no-require-imports */
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || 'Thailand2022',
    database: process.env.MYSQL_DATABASE || 'ppplus',
    multipleStatements: true,
  });

  console.log('Connected to MySQL. Creating tables...');

  await conn.query(`
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
      \`key\` VARCHAR(255) NOT NULL UNIQUE,
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
      status ENUM('pending','quoted','closed') NOT NULL DEFAULT 'pending',
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  console.log('Tables created.');

  // Seed admin user
  const [existingAdmins] = await conn.query("SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1");
  if (!existingAdmins.length) {
    const hash = await bcrypt.hash('admin123', 10);
    await conn.query(
      "INSERT INTO users (email, password, name, role, locale) VALUES (?, ?, ?, 'ADMIN', 'th')",
      ['admin@ppplus.co.th', hash, 'Admin']
    );
    console.log('Admin user created: admin@ppplus.co.th / admin123');
  }

  // Seed default site contents
  const siteDefaults = [
    { key: 'store_name', valueTh: 'PP Plus', valueEn: 'PP Plus', type: 'text' },
    { key: 'store_phone', valueTh: '02-XXX-XXXX', valueEn: '02-XXX-XXXX', type: 'text' },
    { key: 'store_email', valueTh: 'info@ppplus.co.th', valueEn: 'info@ppplus.co.th', type: 'text' },
    { key: 'store_address', valueTh: 'กรุงเทพฯ', valueEn: 'Bangkok', type: 'text' },
    { key: 'store_hours', valueTh: 'จันทร์-เสาร์ 08:00-17:00', valueEn: 'Mon-Sat 08:00-17:00', type: 'text' },
  ];

  for (const sc of siteDefaults) {
    await conn.query(
      `INSERT INTO site_contents (\`key\`, valueTh, valueEn, type) VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE valueTh = VALUES(valueTh)`,
      [sc.key, sc.valueTh, sc.valueEn, sc.type]
    );
  }
  console.log('Site contents seeded.');

  // Seed automotive paint categories
  const categoryDefaults = [
    { nameTh: '2K Topcoat', nameEn: '2K Topcoat', sortOrder: 1 },
    { nameTh: 'Basecoat', nameEn: 'Basecoat', sortOrder: 2 },
    { nameTh: 'Clear Coat', nameEn: 'Clear Coat', sortOrder: 3 },
    { nameTh: 'Primer / Surfacer', nameEn: 'Primer / Surfacer', sortOrder: 4 },
    { nameTh: 'Epoxy Primer', nameEn: 'Epoxy Primer', sortOrder: 5 },
    { nameTh: 'ทินเนอร์', nameEn: 'Thinner', sortOrder: 6 },
    { nameTh: 'ฮาร์ดเดนเนอร์', nameEn: 'Hardener', sortOrder: 7 },
    { nameTh: 'สารเติมแต่ง', nameEn: 'Additives', sortOrder: 8 },
    { nameTh: 'ปืนพ่นสี', nameEn: 'Spray Gun', sortOrder: 9 },
    { nameTh: 'กระดาษทราย', nameEn: 'Sandpaper', sortOrder: 10 },
    { nameTh: 'เครื่องขัด', nameEn: 'Polisher', sortOrder: 11 },
    { nameTh: 'อุปกรณ์ป้องกัน (PPE)', nameEn: 'PPE', sortOrder: 12 },
  ];

  const [existingCats] = await conn.query('SELECT COUNT(*) as cnt FROM categories');
  if (existingCats[0].cnt === 0) {
    for (const cat of categoryDefaults) {
      await conn.query(
        'INSERT INTO categories (nameTh, nameEn, sortOrder) VALUES (?, ?, ?)',
        [cat.nameTh, cat.nameEn, cat.sortOrder]
      );
    }
    console.log('Categories seeded.');
  }

  // Seed sample color formulas
  const [existingFormulas] = await conn.query('SELECT COUNT(*) as cnt FROM color_formulas');
  if (existingFormulas[0].cnt === 0) {
    const colorDefaults = [
      { carBrand: 'TOYOTA', colorCode: '040', colorNameTh: 'ซุปเปอร์ไวท์', colorNameEn: 'Super White', yearRange: '2015-2026', formulaType: 'solid', deltaE: 0.35 },
      { carBrand: 'TOYOTA', colorCode: '1G3', colorNameTh: 'เกร์ เมทัลลิก', colorNameEn: 'Grey Metallic', yearRange: '2018-2026', formulaType: 'metallic', deltaE: 0.42 },
      { carBrand: 'TOYOTA', colorCode: '3R3', colorNameTh: 'เรด ไมก้า เมทัลลิก', colorNameEn: 'Red Mica Metallic', yearRange: '2017-2025', formulaType: 'metallic', deltaE: 0.38 },
      { carBrand: 'HONDA', colorCode: 'NH-731P', colorNameTh: 'คริสตัล แบล็ค เพิร์ล', colorNameEn: 'Crystal Black Pearl', yearRange: '2016-2026', formulaType: 'pearl', deltaE: 0.28 },
      { carBrand: 'HONDA', colorCode: 'NH-883P', colorNameTh: 'พลาทินัม ไวท์ เพิร์ล', colorNameEn: 'Platinum White Pearl', yearRange: '2019-2026', formulaType: 'pearl', deltaE: 0.31 },
      { carBrand: 'NISSAN', colorCode: 'KH3', colorNameTh: 'ซุปเปอร์ แบล็ค', colorNameEn: 'Super Black', yearRange: '2015-2026', formulaType: 'solid', deltaE: 0.25 },
      { carBrand: 'ISUZU', colorCode: '527', colorNameTh: 'ซิลเวอร์ เมทัลลิก', colorNameEn: 'Silver Metallic', yearRange: '2020-2026', formulaType: 'metallic', deltaE: 0.40 },
      { carBrand: 'MAZDA', colorCode: '46V', colorNameTh: 'โซล เรด คริสตัล เมทัลลิก', colorNameEn: 'Soul Red Crystal Metallic', yearRange: '2019-2026', formulaType: 'pearl', deltaE: 0.33 },
      { carBrand: 'FORD', colorCode: 'PN4GE', colorNameTh: 'เมทิโอ ไกร์ เมทัลลิก', colorNameEn: 'Meteor Grey Metallic', yearRange: '2020-2025', formulaType: 'metallic', deltaE: 0.37 },
      { carBrand: 'MITSUBISHI', colorCode: 'W13', colorNameTh: 'ไวท์ เพิร์ล', colorNameEn: 'White Pearl', yearRange: '2018-2026', formulaType: 'pearl', deltaE: 0.30 },
    ];

    for (const cf of colorDefaults) {
      await conn.query(
        'INSERT INTO color_formulas (carBrand, colorCode, colorNameTh, colorNameEn, yearRange, formulaType, deltaE) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [cf.carBrand, cf.colorCode, cf.colorNameTh, cf.colorNameEn, cf.yearRange, cf.formulaType, cf.deltaE]
      );
    }
    console.log('Color formulas seeded.');
  }

  await conn.end();
  console.log('Done!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
