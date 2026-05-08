-- ============================================================
-- PP Plus migration: menu_items.id INT AUTO_INCREMENT -> VARCHAR(64)
-- Run once. Safe to re-run (idempotent guards inside).
-- Affects: menu_items.id, order_items.menuItemId, quote_requests.productId
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ---------- 1. Drop any FK on order_items.menuItemId ----------
SET @fkname := (
  SELECT CONSTRAINT_NAME
    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
   WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME   = 'order_items'
     AND COLUMN_NAME  = 'menuItemId'
     AND REFERENCED_TABLE_NAME = 'menu_items'
   LIMIT 1
);
SET @sql := IF(
  @fkname IS NOT NULL,
  CONCAT('ALTER TABLE `order_items` DROP FOREIGN KEY `', @fkname, '`'),
  'DO 0'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ---------- 2. menu_items.id -> VARCHAR(64) (drops AUTO_INCREMENT) ----------
SET @cur := (
  SELECT DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME   = 'menu_items'
     AND COLUMN_NAME  = 'id'
);
SET @sql := IF(
  LOWER(@cur) <> 'varchar',
  'ALTER TABLE `menu_items` MODIFY `id` VARCHAR(64) NOT NULL',
  'DO 0'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ---------- 3. order_items.menuItemId -> VARCHAR(64) ----------
SET @hasOrderItems := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'order_items'
);
SET @cur := (
  SELECT DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME   = 'order_items'
     AND COLUMN_NAME  = 'menuItemId'
);
SET @sql := IF(
  @hasOrderItems > 0 AND LOWER(@cur) <> 'varchar',
  'ALTER TABLE `order_items` MODIFY `menuItemId` VARCHAR(64) NOT NULL',
  'DO 0'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ---------- 4. Re-add the FK on order_items.menuItemId ----------
SET @hasFk := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
   WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME   = 'order_items'
     AND COLUMN_NAME  = 'menuItemId'
     AND REFERENCED_TABLE_NAME = 'menu_items'
);
SET @sql := IF(
  @hasOrderItems > 0 AND @hasFk = 0,
  'ALTER TABLE `order_items` ADD CONSTRAINT `order_items_menuitem_fk` FOREIGN KEY (`menuItemId`) REFERENCES `menu_items`(`id`) ON DELETE CASCADE',
  'DO 0'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ---------- 5. quote_requests.productId -> VARCHAR(64) ----------
SET @hasQR := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME   = 'quote_requests'
     AND COLUMN_NAME  = 'productId'
);
SET @cur := (
  SELECT DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME   = 'quote_requests'
     AND COLUMN_NAME  = 'productId'
);
SET @sql := IF(
  @hasQR > 0 AND LOWER(@cur) = 'int',
  'ALTER TABLE `quote_requests` MODIFY `productId` VARCHAR(64) NULL',
  'DO 0'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET FOREIGN_KEY_CHECKS = 1;

-- Done. Existing numeric IDs remain valid (stored as their string form, e.g. 1, 2, 3).
-- New products may use SKU-style IDs like SRR001, TOA-2K-WHITE, etc.
