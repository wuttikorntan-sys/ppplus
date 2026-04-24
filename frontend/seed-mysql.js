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
      sdsFile VARCHAR(500) NULL,
      videoUrl VARCHAR(500) NULL,
      specColor VARCHAR(100) NULL,
      specDensity VARCHAR(50) NULL,
      specFlashPoint VARCHAR(50) NULL,
      specPotLife VARCHAR(100) NULL,
      relatedProductIds TEXT NULL,
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
      cartItems JSON NULL,
      status ENUM('pending','quoted','closed') NOT NULL DEFAULT 'pending',
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS b2b_documents (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nameTh VARCHAR(300) NOT NULL,
      nameEn VARCHAR(300) NOT NULL,
      filePath VARCHAR(500) NOT NULL,
      fileSize VARCHAR(50) NOT NULL DEFAULT '',
      fileType VARCHAR(50) NOT NULL DEFAULT 'pdf',
      sortOrder INT NOT NULL DEFAULT 0,
      isActive TINYINT(1) NOT NULL DEFAULT 1,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  console.log('Tables created.');

  // Migrations: idempotently add columns that may be missing on older DBs
  const ensureColumn = async (table, column, ddl) => {
    const [rows] = await conn.query(
      `SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
      [table, column]
    );
    if (rows[0].cnt === 0) {
      await conn.query(`ALTER TABLE ${table} ADD COLUMN ${ddl}`);
      console.log(`Added column ${table}.${column}`);
    }
  };

  await ensureColumn('menu_items', 'sdsFile', 'sdsFile VARCHAR(500) NULL AFTER tdsFile');
  await ensureColumn('menu_items', 'specColor', 'specColor VARCHAR(100) NULL');
  await ensureColumn('menu_items', 'specDensity', 'specDensity VARCHAR(50) NULL');
  await ensureColumn('menu_items', 'specFlashPoint', 'specFlashPoint VARCHAR(50) NULL');
  await ensureColumn('menu_items', 'specPotLife', 'specPotLife VARCHAR(100) NULL');
  await ensureColumn('menu_items', 'relatedProductIds', 'relatedProductIds TEXT NULL');

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

  // Seed sample menu items (products)
  const [existingItems] = await conn.query('SELECT COUNT(*) as cnt FROM menu_items');
  if (existingItems[0].cnt === 0) {
    const [catRows] = await conn.query('SELECT id, nameEn FROM categories');
    const catByName = {};
    for (const c of catRows) catByName[c.nameEn] = c.id;

    const productDefaults = [
      {
        category: '2K Topcoat',
        nameTh: 'สี 2K ท็อปโคท ซุปเปอร์ไวท์',
        nameEn: '2K Topcoat Super White',
        descriptionTh: 'สีพ่นรถยนต์ 2K คุณภาพสูง สีขาวสด ทนทานต่อสภาพอากาศ',
        descriptionEn: 'High-quality 2K automotive topcoat, bright white, weather resistant',
        price: 1290, brand: 'PP Plus', colorCode: '#FFFFFF', colorName: 'Super White',
        finishType: 'Gloss', size: '4', unit: 'L', mixingRatio: '2:1:10%',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop',
      },
      {
        category: 'Basecoat',
        nameTh: 'สีเบสโค้ท เมทัลลิก ซิลเวอร์',
        nameEn: 'Basecoat Metallic Silver',
        descriptionTh: 'สีเบสโค้ทเมทัลลิกเงิน ประกายสวย พร้อมพ่น',
        descriptionEn: 'Premium silver metallic basecoat, brilliant sparkle, ready-to-spray',
        price: 890, brand: 'PP Plus', colorCode: '#C0C0C0', colorName: 'Metallic Silver',
        finishType: 'Satin', size: '1', unit: 'L', mixingRatio: '1:1',
        image: 'https://images.unsplash.com/photo-1611791485487-ea5a58ed5f31?w=600&h=600&fit=crop',
      },
      {
        category: 'Clear Coat',
        nameTh: 'เคลียร์โค้ท 2K เงาลึก',
        nameEn: '2K Clear Coat High Gloss',
        descriptionTh: 'เคลียร์โค้ท 2K ให้เงางามสูง ปกป้องสีจากรังสี UV',
        descriptionEn: '2K clear coat with high gloss finish, UV protection',
        price: 1450, brand: 'PP Plus', colorCode: null, colorName: null,
        finishType: 'Gloss', size: '4', unit: 'L', mixingRatio: '2:1',
        image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&h=600&fit=crop',
      },
      {
        category: 'Primer / Surfacer',
        nameTh: 'ไพร์เมอร์ เซอร์เฟสเซอร์ สีเทา',
        nameEn: 'Primer Surfacer Grey',
        descriptionTh: 'ไพร์เมอร์สีเทา ช่วยยึดเกาะ ปกปิดรอยขูดขีด',
        descriptionEn: 'Grey primer surfacer for optimal adhesion and defect coverage',
        price: 750, brand: 'PP Plus', colorCode: '#808080', colorName: 'Grey',
        finishType: 'Matte', size: '1', unit: 'L', mixingRatio: '4:1:10%',
        image: 'https://images.unsplash.com/photo-1581092786450-7ef25f46d4b8?w=600&h=600&fit=crop',
      },
      {
        category: 'Epoxy Primer',
        nameTh: 'อีพ็อกซี่ ไพร์เมอร์ กันสนิม',
        nameEn: 'Epoxy Primer Anti-Rust',
        descriptionTh: 'อีพ็อกซี่ไพร์เมอร์กันสนิม เกาะเหล็กดี ป้องกันสนิม',
        descriptionEn: 'Anti-rust epoxy primer, excellent metal adhesion',
        price: 1100, brand: 'PP Plus', colorCode: null, colorName: null,
        finishType: 'Matte', size: '1', unit: 'L', mixingRatio: '1:1',
        image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=600&h=600&fit=crop',
      },
      {
        category: 'Thinner',
        nameTh: 'ทินเนอร์ 2K เกรดพรีเมียม',
        nameEn: 'Premium 2K Thinner',
        descriptionTh: 'ทินเนอร์สำหรับสี 2K แห้งเร็ว ไม่เกิดฝ้า',
        descriptionEn: 'Premium thinner for 2K paint, fast-drying, no blush',
        price: 420, brand: 'PP Plus', colorCode: null, colorName: null,
        finishType: null, size: '4', unit: 'L', mixingRatio: null,
        image: 'https://images.unsplash.com/photo-1582913130063-8318329fa089?w=600&h=600&fit=crop',
      },
      {
        category: 'Hardener',
        nameTh: 'ฮาร์ดเดนเนอร์ 2K',
        nameEn: '2K Hardener',
        descriptionTh: 'ฮาร์ดเดนเนอร์สำหรับสี 2K ทำให้สีแข็งตัวเร็ว',
        descriptionEn: 'Hardener for 2K paint, fast curing, glossy finish',
        price: 680, brand: 'PP Plus', colorCode: null, colorName: null,
        finishType: null, size: '1', unit: 'L', mixingRatio: null,
        image: 'https://images.unsplash.com/photo-1617104551722-3b2d51366400?w=600&h=600&fit=crop',
      },
      {
        category: 'Spray Gun',
        nameTh: 'ปืนพ่นสี HVLP 1.3mm',
        nameEn: 'HVLP Spray Gun 1.3mm',
        descriptionTh: 'ปืนพ่นสี HVLP หัวพ่น 1.3mm ละออง ละเอียด ประหยัดสี',
        descriptionEn: 'HVLP spray gun with 1.3mm nozzle, fine atomization, paint saving',
        price: 2590, brand: 'PP Plus', colorCode: null, colorName: null,
        finishType: null, size: null, unit: null, mixingRatio: null,
        image: 'https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=600&h=600&fit=crop',
      },
    ];

    let inserted = 0;
    for (let i = 0; i < productDefaults.length; i++) {
      const p = productDefaults[i];
      const categoryId = catByName[p.category];
      if (!categoryId) continue;
      await conn.query(
        `INSERT INTO menu_items
          (categoryId, nameTh, nameEn, descriptionTh, descriptionEn, price, image, isAvailable, sortOrder,
           brand, colorCode, colorName, finishType, size, unit, mixingRatio)
         VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [categoryId, p.nameTh, p.nameEn, p.descriptionTh, p.descriptionEn, p.price, p.image, i,
         p.brand, p.colorCode, p.colorName, p.finishType, p.size, p.unit, p.mixingRatio]
      );
      inserted++;
    }
    console.log(`Menu items seeded: ${inserted} products.`);
  }

  await conn.end();
  console.log('Done!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
