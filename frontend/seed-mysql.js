/* eslint-disable @typescript-eslint/no-require-imports */
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
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
    { key: 'store_name', valueTh: 'PP+', valueEn: 'PP+', type: 'text' },
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

  await conn.end();
  console.log('Done!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
