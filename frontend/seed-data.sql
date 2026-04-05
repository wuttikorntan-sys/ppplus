-- ============================================
-- PP Plus - Realistic Product Data Seed
-- สำหรับ phpMyAdmin > SQL tab
-- Database: u626866170_ppplus
-- ============================================
-- ⚠️  รัน hostinger-seed.sql สร้างตารางก่อน แล้วค่อยรัน seed นี้
-- ============================================

-- ลบข้อมูลเก่า (ถ้ามี) เพื่อเริ่มใหม่
SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM menu_items;
DELETE FROM categories;
DELETE FROM popups;
DELETE FROM blog_posts;
DELETE FROM hero_slides;
DELETE FROM gallery_images;
DELETE FROM color_formulas;
DELETE FROM site_contents;
ALTER TABLE menu_items AUTO_INCREMENT = 1;
ALTER TABLE categories AUTO_INCREMENT = 1;
ALTER TABLE popups AUTO_INCREMENT = 1;
ALTER TABLE blog_posts AUTO_INCREMENT = 1;
ALTER TABLE hero_slides AUTO_INCREMENT = 1;
ALTER TABLE gallery_images AUTO_INCREMENT = 1;
ALTER TABLE color_formulas AUTO_INCREMENT = 1;
ALTER TABLE site_contents AUTO_INCREMENT = 1;
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- 1. SITE CONTENTS (ข้อมูลร้าน)
-- ============================================
INSERT INTO site_contents (`key`, valueTh, valueEn, type) VALUES
('store_name', 'PP Plus Color', 'PP Plus Color', 'text'),
('store_phone', '081-234-5678', '081-234-5678', 'text'),
('store_email', 'info@ppcolour.com', 'info@ppcolour.com', 'text'),
('store_address', '123/45 ถ.พหลโยธิน แขวงจตุจักร เขตจตุจักร กรุงเทพฯ 10900', '123/45 Phahonyothin Rd, Chatuchak, Bangkok 10900', 'text'),
('store_hours', 'จันทร์-เสาร์ 08:00-17:30 / อาทิตย์ 09:00-15:00', 'Mon-Sat 08:00-17:30 / Sun 09:00-15:00', 'text'),
('store_line', '@ppplus', '@ppplus', 'text'),
('store_facebook', 'PPPlusColor', 'PPPlusColor', 'text'),
('about_description', 'PP Plus ศูนย์รวมสีพ่นรถยนต์ครบวงจร จำหน่ายสีพ่นรถยนต์ อุปกรณ์พ่นสี และเครื่องมือช่างคุณภาพสูง พร้อมบริการผสมสีตามสูตรรถยนต์ทุกยี่ห้อ', 'PP Plus is a comprehensive automotive paint center. We supply automotive paint, spray equipment, and professional tools with color matching service for all car brands.', 'text'),
('store_map_lat', '13.8199', '13.8199', 'text'),
('store_map_lng', '100.5615', '100.5615', 'text');

-- ============================================
-- 2. CATEGORIES (หมวดหมู่สินค้า)
-- ============================================
INSERT INTO categories (nameTh, nameEn, sortOrder) VALUES
('สีทับหน้า 2K', '2K Topcoat', 1),
('เบสโค้ท', 'Basecoat', 2),
('แลคเกอร์ / เคลียร์โค้ท', 'Lacquer / Clear Coat', 3),
('พาร์ทเมอร์ / เซอร์เฟเซอร์', 'Primer / Surfacer', 4),
('อีพ็อกซี่ไพรเมอร์', 'Epoxy Primer', 5),
('ทินเนอร์', 'Thinner', 6),
('ฮาร์ดเดนเนอร์', 'Hardener', 7),
('สารเติมแต่ง', 'Additives', 8),
('ปืนพ่นสี', 'Spray Gun', 9),
('กระดาษทราย & อุปกรณ์ขัด', 'Sandpaper & Polishing', 10),
('อุปกรณ์ซ่อมสี', 'Body Repair Tools', 11),
('อุปกรณ์ป้องกัน (PPE)', 'PPE & Safety', 12);

-- ============================================
-- 3. MENU ITEMS (สินค้าจริง)
-- ============================================

-- ── หมวด 1: สีทับหน้า 2K ──
INSERT INTO menu_items (categoryId, nameTh, nameEn, descriptionTh, descriptionEn, price, isAvailable, sortOrder, brand, finishType, size, unit, mixingRatio, featuresTh, featuresEn, applicationMethodTh, applicationMethodEn, colorCode, colorName) VALUES
(1, 'สี 2K Solid ขาว (040)', '2K Solid White (040)', 
'สี 2K โซลิดขาวคุณภาพสูง เนื้อแน่น กลบมิดดี ทนทานต่อสภาพอากาศ เหมาะสำหรับรถ Toyota Honda และรถยี่ห้ออื่นๆ ที่ใช้สีขาวโซลิด',
'High-quality 2K solid white paint with excellent coverage and weather resistance. Suitable for Toyota, Honda and other vehicles using solid white.',
1250.00, 1, 1, 'PP Plus', 'Gloss', '1L', 'L', '2:1 (สี:ฮาร์ด)',
'เนื้อสีแน่น กลบมิดใน 2 เที่ยว\nทนแดด ทนฝน ไม่เหลืองง่าย\nแห้งเร็ว ขัดเงาได้ดี\nเทียบเท่าสีศูนย์บริการ',
'Dense formula, full coverage in 2 coats\nUV & weather resistant, anti-yellowing\nFast drying, excellent polishing result\nOEM-equivalent quality',
'1. ผสมสี 2 ส่วน : ฮาร์ดเดนเนอร์ 1 ส่วน\n2. เติมทินเนอร์ 10-15% ตามสภาพอากาศ\n3. พ่น 2-3 เที่ยว เว้นระยะทิ้ง 5-10 นาที\n4. อบแห้ง 60°C 30 นาที หรือผึ่งลม 24 ชม.',
'1. Mix paint 2 parts : hardener 1 part\n2. Add 10-15% thinner depending on weather\n3. Apply 2-3 coats with 5-10 min flash time\n4. Bake at 60°C for 30 min or air dry 24 hrs.',
'#FFFFFF', 'Super White'),

(1, 'สี 2K Solid ดำ (202)', '2K Solid Black (202)',
'สี 2K โซลิดดำเข้มสนิท เนื้อสีละเอียด กลบมิดดีเยี่ยม สำหรับงานพ่นสีรถยนต์ทุกประเภท',
'Premium 2K solid jet black paint with fine texture and excellent coverage for all automotive refinish work.',
1250.00, 1, 2, 'PP Plus', 'Gloss', '1L', 'L', '2:1 (สี:ฮาร์ด)',
'สีดำเข้มสนิท ไม่ออกเทา\nเนื้อละเอียด พ่นง่าย\nทนทาน ไม่ซีดง่าย\nเหมาะสำหรับทุกยี่ห้อรถ',
'Deep jet black, no grey tone\nFine texture, easy to spray\nDurable, fade resistant\nUniversal automotive use',
'1. ผสมสี 2:1 กับฮาร์ดเดนเนอร์\n2. เติมทินเนอร์ 10-15%\n3. พ่น 2-3 เที่ยว\n4. ทิ้งให้แห้ง แล้วขัดเงา',
'1. Mix 2:1 with hardener\n2. Add 10-15% thinner\n3. Apply 2-3 coats\n4. Dry and polish',
'#000000', 'Black'),

(1, 'สี 2K Metallic ซิลเวอร์ (1C0)', '2K Metallic Silver (1C0)',
'สี 2K เมทัลลิกซิลเวอร์ เกล็ดละเอียดสวย เงาประกายระยิบ สำหรับรถ Toyota Vios Yaris Hilux',
'2K metallic silver with fine aluminum flakes and brilliant sparkle. For Toyota Vios, Yaris, Hilux and similar models.',
1450.00, 1, 3, 'PP Plus', 'Gloss', '1L', 'L', '2:1 (สี:ฮาร์ด)',
'เกล็ดเมทัลลิกละเอียดสม่ำเสมอ\nประกายสวย ไม่ด่าง\nเทียบสีได้ตรงศูนย์\nต้องพ่นเคลียร์โค้ททับ',
'Fine and uniform metallic flakes\nBeautiful sparkle, no mottling\nOEM color match accuracy\nRequires clear coat on top',
'1. คนสีให้เข้ากัน ผสม 2:1 กับฮาร์ดเดนเนอร์\n2. เติมทินเนอร์ 10%\n3. พ่น 3 เที่ยว มิสต์โค้ทเที่ยวสุดท้าย\n4. Flash 10 นาที แล้วพ่นเคลียร์โค้ททับ',
'1. Stir well, mix 2:1 with hardener\n2. Add 10% thinner\n3. Apply 3 coats, mist coat on final\n4. Flash 10 min then apply clear coat',
'#C0C0C0', 'Silver Metallic');

-- ── หมวด 2: เบสโค้ท ──
INSERT INTO menu_items (categoryId, nameTh, nameEn, descriptionTh, descriptionEn, price, isAvailable, sortOrder, brand, finishType, size, unit, mixingRatio, featuresTh, featuresEn, applicationMethodTh, applicationMethodEn, colorCode, colorName) VALUES
(2, 'เบสโค้ท เมทัลลิก ซิลเวอร์ (1G3)', 'Basecoat Metallic Silver (1G3)',
'เบสโค้ทเมทัลลิกซิลเวอร์ เนื้อละเอียด กลบมิด เกล็ดสม่ำเสมอ สูตร Toyota 1G3 สำหรับ Camry Altis Fortuner',
'Metallic silver basecoat, fine particles, excellent coverage with uniform flake for Toyota 1G3 formula - Camry, Altis, Fortuner.',
890.00, 1, 1, 'PP Plus', 'Matte', '1L', 'L', 'พร้อมใช้ (เติมทินเนอร์ 50-80%)',
'สูตรเทียบตรงจากโรงงาน Toyota\nเกล็ดเมทัลลิกละเอียด ไม่ด่าง\nกลบมิดใน 3-4 เที่ยว\nต้องพ่นเคลียร์โค้ททับ',
'OEM-matched Toyota formula\nFine metallic flakes, no mottling\nFull coverage in 3-4 coats\nRequires clear coat topcoat',
'1. ผสมเบสโค้ทกับทินเนอร์เบส 1:1 (50-80%)\n2. พ่น 3-4 เที่ยว เว้นระยะ 5-8 นาที\n3. เที่ยวสุดท้ายพ่นมิสต์โค้ท\n4. ทิ้ง 15-20 นาที แล้วพ่นเคลียร์',
'1. Mix basecoat with base thinner 1:1 (50-80%)\n2. Apply 3-4 coats with 5-8 min flash\n3. Final coat as mist coat\n4. Wait 15-20 min then apply clear coat',
'#A9A9A9', 'Grey Metallic 1G3'),

(2, 'เบสโค้ท เพิร์ล ขาว (070)', 'Basecoat Pearl White (070)',
'เบสโค้ทเพิร์ลขาวประกาย 3 ชั้น สูตร Toyota 070 Platinum White Pearl สำหรับ Camry Corolla Cross CHR',
'3-stage pearl white basecoat, Toyota 070 Platinum White Pearl formula for Camry, Corolla Cross, C-HR.',
1100.00, 1, 2, 'PP Plus', 'Matte', '1L', 'L', 'พร้อมใช้ (เติมทินเนอร์ 60-80%)',
'ระบบ 3 ชั้น: ขาว + เพิร์ล + เคลียร์\nเกล็ดเพิร์ลละเอียดประกายสวย\nเทียบสีตรง OEM Toyota 070\nใช้คู่กับเพิร์ล PP Plus P-070',
'3-stage system: white + pearl + clear\nFine pearl flakes with beautiful iridescence\nOEM color match Toyota 070\nUse with PP Plus Pearl P-070',
'1. พ่นเบสขาว 2-3 เที่ยว จนกลบมิด\n2. พ่นเพิร์ลโค้ท 2-3 เที่ยว\n3. ทิ้ง 15 นาที แล้วพ่นเคลียร์โค้ท',
'1. Apply white base 2-3 coats until opaque\n2. Apply pearl coat 2-3 coats\n3. Wait 15 min then apply clear coat',
'#F5F5F0', 'Platinum White Pearl 070'),

(2, 'เบสโค้ท โซลิด แดง (3P0)', 'Basecoat Solid Red (3P0)',
'เบสโค้ทแดงโซลิดสด สูตร Toyota 3P0 Super Red สำหรับ Yaris Vios Hilux Revo',
'Vibrant solid red basecoat, Toyota 3P0 Super Red formula for Yaris, Vios, Hilux Revo.',
950.00, 1, 3, 'PP Plus', 'Matte', '1L', 'L', 'พร้อมใช้ (เติมทินเนอร์ 50-70%)',
'สีแดงสดใส กลบมิดดี\nทนแดดไม่ซีดง่าย\nเทียบตรง OEM Toyota 3P0\nต้องพ่นเคลียร์โค้ททับ',
'Vivid red, excellent coverage\nUV resistant, anti-fade\nOEM match Toyota 3P0\nRequires clear coat topcoat',
'1. ผสมกับทินเนอร์เบส 1:1\n2. พ่น 3-4 เที่ยว\n3. ทิ้ง 15 นาที แล้วพ่นเคลียร์โค้ท',
'1. Mix with base thinner 1:1\n2. Apply 3-4 coats\n3. Wait 15 min then apply clear coat',
'#CC0000', 'Super Red 3P0');

-- ── หมวด 3: แลคเกอร์ / เคลียร์โค้ท ──
INSERT INTO menu_items (categoryId, nameTh, nameEn, descriptionTh, descriptionEn, price, isAvailable, sortOrder, brand, finishType, size, unit, mixingRatio, featuresTh, featuresEn, applicationMethodTh, applicationMethodEn) VALUES
(3, 'แลคเกอร์ 2:1 - ตัวเร่ง (สูตรฟิล์มหนาเงาสวย)', 'Clear Coat 2:1 HS (High Solid)',
'แลคเกอร์ 2K เคลียร์โค้ท สูตร High Solid ฟิล์มหนา เงาลึกเหมือนกระจก ทนรอยขีดข่วน ทน UV ไม่เหลือง',
'2K HS clear coat with thick film build, mirror-like deep gloss, scratch resistant, UV resistant and anti-yellowing formula.',
1110.00, 1, 1, 'PP Plus', 'Gloss', '1L', 'L', '2:1 (เคลียร์:ฮาร์ด) + ทินเนอร์ 10%',
'ฟิล์มหนา เงาลึกเหมือนกระจก\nทนรอยขีดข่วนสูง Scratch Resistance\nกัน UV ไม่เหลืองตลอดอายุการใช้งาน\nช่วยลดผิวส้ม เคลือบเรียบเนียน\nแห้งเร็ว ขัดเงาได้ภายใน 4 ชม.',
'Thick film build, mirror-like deep gloss\nHigh scratch resistance\nUV protection, lifetime anti-yellowing\nPerfect leveling, reduces orange peel\nFast dry, polishable within 4 hours',
'1. ผสมเคลียร์ 2 ส่วน : ฮาร์ดเดนเนอร์ 1 ส่วน\n2. เติมทินเนอร์ 10% (ปรับตามอากาศ)\n3. พ่น 2 เที่ยว ฟูลโค้ท เว้น 5-10 นาที\n4. อบ 60°C 30 นาที หรือผึ่งลม 12-16 ชม.\n5. ขัดเงาได้หลัง 4 ชม. (อบ) หรือ 24 ชม. (ผึ่งลม)',
'1. Mix clear 2 parts : hardener 1 part\n2. Add 10% thinner (adjust for weather)\n3. Apply 2 full coats with 5-10 min flash\n4. Bake 60°C 30 min or air dry 12-16 hrs\n5. Polish after 4 hrs (baked) or 24 hrs (air dry)'),

(3, 'แลคเกอร์ 4:1 - เกรดมาตรฐาน', 'Clear Coat 4:1 MS (Medium Solid)',
'แลคเกอร์ 2K เคลียร์โค้ท สูตร Medium Solid เหมาะสำหรับงานทั่วไป ราคาประหยัด เงาดี',
'2K MS clear coat, ideal for general refinish work, economical price with good gloss.',
850.00, 1, 2, 'PP Plus', 'Gloss', '1L', 'L', '4:1 (เคลียร์:ฮาร์ด) + ทินเนอร์ 15%',
'เงาดี ราคาประหยัด\nใช้ง่าย เหมาะสำหรับมือใหม่\nแห้งเร็วปานกลาง\nเหมาะงานซ่อมทั่วไป',
'Good gloss at economical price\nEasy to use, beginner-friendly\nMedium drying speed\nIdeal for general repair work',
'1. ผสมเคลียร์ 4 ส่วน : ฮาร์ดเดนเนอร์ 1 ส่วน\n2. เติมทินเนอร์ 15%\n3. พ่น 2-3 เที่ยว\n4. อบ 60°C 30 นาที หรือผึ่งลม 24 ชม.',
'1. Mix clear 4 parts : hardener 1 part\n2. Add 15% thinner\n3. Apply 2-3 coats\n4. Bake 60°C 30 min or air dry 24 hrs');

-- ── หมวด 4: พาร์ทเมอร์ / เซอร์เฟเซอร์ ──
INSERT INTO menu_items (categoryId, nameTh, nameEn, descriptionTh, descriptionEn, price, isAvailable, sortOrder, brand, finishType, size, unit, mixingRatio, featuresTh, featuresEn, applicationMethodTh, applicationMethodEn, colorCode, colorName) VALUES
(4, 'เซอร์เฟเซอร์ 2K สีเทา', '2K Surfacer Grey',
'เซอร์เฟเซอร์ 2K สีเทา เนื้อหนาเติมเต็มรอยขีดข่วน กระดาษทราย และรูเข็ม ขัดง่าย ยึดเกาะดี',
'2K grey surfacer with high build for filling scratches, sand marks and pinholes. Easy to sand and excellent adhesion.',
790.00, 1, 1, 'PP Plus', 'Matte', '1L', 'L', '4:1 (เซอร์เฟเซอร์:ฮาร์ด) + ทินเนอร์ 20%',
'เนื้อหนา เติมเต็มรอยตำหนิได้ดี\nขัดง่าย ไม่อุดตันกระดาษทราย\nยึดเกาะกับผิวเหล็กและสีเก่าได้ดี\nเหมาะสำหรับงานรองพื้นก่อนพ่นสี',
'High build, excellent defect filling\nEasy sanding, does not clog sandpaper\nGreat adhesion to bare metal and old paint\nIdeal undercoat before top coat application',
'1. ผสม 4:1 กับฮาร์ดเดนเนอร์\n2. เติมทินเนอร์ 20%\n3. พ่น 2-3 เที่ยว ฟูลโค้ท\n4. ทิ้งแห้ง 2-3 ชม. แล้วขัดด้วยกระดาษทราย P320-P400\n5. พ่นสีทับหน้า',
'1. Mix 4:1 with hardener\n2. Add 20% thinner\n3. Apply 2-3 full coats\n4. Dry 2-3 hrs then sand with P320-P400\n5. Apply topcoat',
'#808080', 'Grey'),

(4, 'เซอร์เฟเซอร์ 2K สีดำ', '2K Surfacer Dark Grey',
'เซอร์เฟเซอร์ 2K สีดำเทาเข้ม เหมาะรองพื้นก่อนพ่นสีเข้ม สีดำ สีน้ำเงิน สีแดงเข้ม',
'2K dark grey surfacer, ideal undercoat for dark topcoats - black, navy, dark red.',
790.00, 1, 2, 'PP Plus', 'Matte', '1L', 'L', '4:1 + ทินเนอร์ 20%',
'เนื้อสีเข้ม รองพื้นก่อนพ่นสีเข้ม\nลดจำนวนเที่ยวพ่นสีทับหน้า\nขัดง่าย ยึดเกาะดี',
'Dark tone for dark topcoat undercoat\nReduces topcoat coats needed\nEasy sanding, excellent adhesion',
'1. ผสม 4:1 กับฮาร์ดเดนเนอร์\n2. เติมทินเนอร์ 20%\n3. พ่น 2-3 เที่ยว\n4. ขัดด้วยกระดาษทราย P320-P400',
'1. Mix 4:1 with hardener\n2. Add 20% thinner\n3. Apply 2-3 coats\n4. Sand with P320-P400',
'#333333', 'Dark Grey');

-- ── หมวด 5: อีพ็อกซี่ไพรเมอร์ ──
INSERT INTO menu_items (categoryId, nameTh, nameEn, descriptionTh, descriptionEn, price, isAvailable, sortOrder, brand, finishType, size, unit, mixingRatio, featuresTh, featuresEn, applicationMethodTh, applicationMethodEn) VALUES
(5, 'อีพ็อกซี่ไพรเมอร์ 2K', '2K Epoxy Primer',
'อีพ็อกซี่ไพรเมอร์ 2K กันสนิมขั้นสูง ยึดเกาะกับเหล็กเปลือย อลูมิเนียม กัลวาไนซ์ และพลาสติก ป้องกันสนิมระยะยาว',
'Premium 2K epoxy primer with advanced corrosion protection. Adheres to bare metal, aluminum, galvanized steel and plastic.',
950.00, 1, 1, 'PP Plus', 'Matte', '1L', 'L', '1:1 (อีพ็อกซี่:ฮาร์ด)',
'กันสนิมขั้นสูง ป้องกันยาวนาน\nยึดเกาะกับทุกพื้นผิว: เหล็ก อลูมิเนียม พลาสติก\nฟิล์มบางแต่แข็งแรง\nพ่นทับด้วยเซอร์เฟเซอร์หรือสีทับหน้าได้',
'Advanced corrosion protection, long-lasting\nAdheres to all surfaces: steel, aluminum, plastic\nThin but strong film build\nCan be topcoated with surfacer or topcoat',
'1. ผสม 1:1 กับฮาร์ดเดนเนอร์อีพ็อกซี่\n2. ไม่ต้องเติมทินเนอร์ (หรือเติมได้ไม่เกิน 5%)\n3. พ่น 1-2 เที่ยว บาง\n4. ทิ้ง 2-4 ชม. แล้วพ่นเซอร์เฟเซอร์ทับ\n⚠️ ห้ามขัด ต้องพ่นทับภายใน 72 ชม.',
'1. Mix 1:1 with epoxy hardener\n2. No thinner needed (max 5% if needed)\n3. Apply 1-2 thin coats\n4. Wait 2-4 hrs then apply surfacer\n⚠️ Do not sand. Must recoat within 72 hrs.');

-- ── หมวด 6: ทินเนอร์ ──
INSERT INTO menu_items (categoryId, nameTh, nameEn, descriptionTh, descriptionEn, price, isAvailable, sortOrder, brand, finishType, size, unit, featuresTh, featuresEn) VALUES
(6, 'ทินเนอร์ 2K (สำหรับสีทับหน้า/เคลียร์)', '2K Thinner (Topcoat/Clear)',
'ทินเนอร์คุณภาพสูงสำหรับผสมสี 2K ทับหน้าและแลคเกอร์ ระเหยสม่ำเสมอ ไม่ทำให้สีด่าง ลดผิวส้ม',
'High-quality thinner for 2K topcoat and clear coat. Even evaporation, prevents mottling and reduces orange peel.',
350.00, 1, 1, 'PP Plus', NULL, '1L', 'L',
'ระเหยสม่ำเสมอ ลดผิวส้ม\nไม่ทำให้สีเปลี่ยน\nเหมาะสำหรับสี 2K ทุกชนิด\nมี 3 สูตร: เร็ว/ปกติ/ช้า',
'Even evaporation, reduces orange peel\nDoes not affect color\nSuitable for all 2K paints\nAvailable in 3 speeds: fast/normal/slow'),

(6, 'ทินเนอร์เบสโค้ท (สำหรับเบสโค้ท)', 'Basecoat Thinner',
'ทินเนอร์สูตรพิเศษสำหรับผสมเบสโค้ท ช่วยให้เกล็ดเมทัลลิกเรียงตัวสวย ไม่ด่าง ระเหยเร็ว',
'Specially formulated thinner for basecoat mixing. Helps metallic flakes lay down evenly, prevents mottling, fast evaporation.',
320.00, 1, 2, 'PP Plus', NULL, '1L', 'L',
'สูตรเฉพาะสำหรับเบสโค้ท\nช่วยเกล็ดเมทัลลิกเรียงตัวสวย\nระเหยเร็ว ไม่ทิ้งรอย\nลดปัญหาสีด่าง',
'Specially formulated for basecoat\nHelps metallic flakes lay down evenly\nFast evaporation, no residue\nReduces mottling issues'),

(6, 'ทินเนอร์ล้างปืน', 'Gun Wash Thinner',
'ทินเนอร์ล้างปืนพ่นสี ทำความสะอาดเร็ว ละลายสีแห้งได้ ไม่ทำลายซีลปืน ขนาดประหยัด',
'Gun wash thinner for spray gun cleaning. Fast cleaning action, dissolves dried paint without damaging gun seals.',
250.00, 1, 3, 'PP Plus', NULL, '1L', 'L',
'ละลายสีเร็ว ล้างง่าย\nไม่ทำลายซีลยางในปืน\nราคาประหยัด\nใช้ได้กับสีทุกระบบ',
'Fast paint dissolving, easy cleaning\nSafe for gun rubber seals\nEconomical price\nCompatible with all paint systems');

-- ── หมวด 7: ฮาร์ดเดนเนอร์ ──
INSERT INTO menu_items (categoryId, nameTh, nameEn, descriptionTh, descriptionEn, price, isAvailable, sortOrder, brand, size, unit, featuresTh, featuresEn) VALUES
(7, 'ฮาร์ดเดนเนอร์ 2K (สำหรับสี 2K)', '2K Hardener (For 2K Paint)',
'ฮาร์ดเดนเนอร์คุณภาพสูงสำหรับสี 2K ทับหน้า ช่วยให้ฟิล์มแข็งแรง ทนทาน แห้งเร็ว',
'High-quality hardener for 2K topcoat paint. Produces strong, durable film with fast drying.',
550.00, 1, 1, 'PP Plus', '500ml', 'ml',
'ผสมกับสี 2K อัตราส่วน 2:1\nช่วยให้ฟิล์มแข็งแรงทนทาน\nแห้งเร็ว ขัดเงาได้เร็ว\nมี 3 สูตร: เร็ว/ปกติ/ช้า',
'Mix with 2K paint at 2:1 ratio\nProduces strong durable film\nFast drying, quick polishing\nAvailable in 3 speeds: fast/normal/slow'),

(7, 'ฮาร์ดเดนเนอร์เคลียร์ HS', 'HS Clear Hardener',
'ฮาร์ดเดนเนอร์สำหรับแลคเกอร์ HS 2:1 ช่วยให้เคลียร์โค้ทแข็งแรง เงาลึก ทนรอยขีดข่วน',
'Hardener for HS 2:1 clear coat. Produces strong, deep gloss and scratch-resistant clear finish.',
650.00, 1, 2, 'PP Plus', '500ml', 'ml',
'ใช้คู่กับแลคเกอร์ HS 2:1\nช่วยให้เงาลึก ฟิล์มแข็ง\nทนรอยขีดข่วน\nแห้งเร็ว ขัดได้ใน 4 ชม.',
'Pairs with HS 2:1 clear coat\nDeep gloss, hard film\nScratch resistant\nFast cure, polishable in 4 hrs');

-- ── หมวด 8: สารเติมแต่ง ──
INSERT INTO menu_items (categoryId, nameTh, nameEn, descriptionTh, descriptionEn, price, isAvailable, sortOrder, brand, size, unit, featuresTh, featuresEn) VALUES
(8, 'สารป้องกันผิวส้ม (Anti-Orange Peel)', 'Anti-Orange Peel Additive',
'สารเติมแต่งลดผิวส้ม ช่วยให้สีเรียบเคลือบเนียน ใส่ได้ทั้งสี 2K และเคลียร์โค้ท',
'Anti-orange peel additive for smooth leveling. Compatible with 2K paint and clear coat.',
280.00, 1, 1, 'PP Plus', '250ml', 'ml',
'ลดผิวส้มอย่างเห็นผล\nช่วยให้ผิวเรียบเนียน\nใส่ได้ทั้งสีและเคลียร์\nเติม 5-10% ของปริมาณสี',
'Effectively reduces orange peel\nSmooth leveling result\nCompatible with paint and clear\nAdd 5-10% of paint volume'),

(8, 'สารยืดเวลาแห้ง (Retarder)', 'Paint Retarder Additive',
'สารยืดเวลาแห้ง สำหรับพ่นสีในอากาศร้อน ป้องกัน dry spray และรอยขาว',
'Drying retarder for spraying in hot weather. Prevents dry spray and blushing.',
250.00, 1, 2, 'PP Plus', '250ml', 'ml',
'ยืดเวลาแห้ง สำหรับอากาศร้อน\nป้องกัน dry spray\nลดปัญหาสีขาวหมอก (blushing)\nเติม 5-10%',
'Extends drying time for hot weather\nPrevents dry spray\nReduces blushing\nAdd 5-10%');

-- ── หมวด 9: ปืนพ่นสี ──
INSERT INTO menu_items (categoryId, nameTh, nameEn, descriptionTh, descriptionEn, price, isAvailable, sortOrder, brand, size, unit, featuresTh, featuresEn) VALUES
(9, 'ปืนพ่นสี HVLP 1.3mm', 'HVLP Spray Gun 1.3mm',
'ปืนพ่นสี HVLP หัว 1.3mm สำหรับพ่นสีทับหน้าและเคลียร์โค้ท ฝอยละเอียด กระจายสม่ำเสมอ ประหยัดสี',
'HVLP spray gun with 1.3mm nozzle for topcoat and clear coat. Fine atomization, uniform pattern, high transfer efficiency.',
3500.00, 1, 1, 'STAR', '1.3mm', NULL,
'หัวพ่น 1.3mm เหมาะสำหรับสีทับหน้า\nฝอยละเอียด กระจายสม่ำเสมอ\nประหยัดสี Transfer Efficiency สูง\nถ้วยบน 600ml\nแรงดันลม 2-3 bar',
'1.3mm nozzle for topcoat application\nFine atomization, uniform pattern\nHigh transfer efficiency, saves paint\n600ml gravity cup\nAir pressure 2-3 bar'),

(9, 'ปืนพ่นสี HVLP 1.7mm (สำหรับเซอร์เฟเซอร์)', 'HVLP Spray Gun 1.7mm (Surfacer)',
'ปืนพ่นสี HVLP หัว 1.7mm สำหรับพ่นเซอร์เฟเซอร์และไพรเมอร์ กระจายเนื้อสีหนาได้ดี',
'HVLP spray gun with 1.7mm nozzle for surfacer and primer application. Handles high-viscosity materials well.',
3200.00, 1, 2, 'STAR', '1.7mm', NULL,
'หัวพ่น 1.7mm เหมาะสำหรับเซอร์เฟเซอร์\nรองรับสีเนื้อหนา\nกระจายสม่ำเสมอ\nถ้วยบน 600ml',
'1.7mm nozzle for surfacer application\nHandles high-viscosity materials\nUniform spray pattern\n600ml gravity cup'),

(9, 'ปืนพ่นสี Mini HVLP 1.0mm (สำหรับงานจุด)', 'Mini HVLP Gun 1.0mm (Spot Repair)',
'ปืนพ่นสี Mini HVLP หัว 1.0mm สำหรับงานซ่อมจุด พ่นบริเวณเล็ก ฝอยละเอียดมาก ถ้วย 125ml',
'Mini HVLP gun with 1.0mm nozzle for spot repair. Ultra-fine atomization with 125ml cup.',
1800.00, 1, 3, 'STAR', '1.0mm', NULL,
'หัวพ่น 1.0mm สำหรับงานจุดเล็กๆ\nฝอยละเอียดมาก ควบคุมได้ง่าย\nถ้วย 125ml เหมาะงานซ่อมจุด\nน้ำหนักเบา จับถนัดมือ',
'1.0mm nozzle for small spot repairs\nUltra-fine atomization, easy control\n125ml cup for spot work\nLightweight, comfortable grip');

-- ── หมวด 10: กระดาษทราย & อุปกรณ์ขัด ──
INSERT INTO menu_items (categoryId, nameTh, nameEn, descriptionTh, descriptionEn, price, isAvailable, sortOrder, brand, size, unit, featuresTh, featuresEn) VALUES
(10, 'กระดาษทรายน้ำ P800 (แผ่น)', 'Wet Sandpaper P800 (sheet)',
'กระดาษทรายน้ำเบอร์ P800 สำหรับขัดเซอร์เฟเซอร์ก่อนพ่นสี ขัดง่าย ไม่อุดตัน ขนาด 230x280mm',
'P800 wet sandpaper for sanding surfacer before painting. Easy cutting, non-clogging. Size 230x280mm.',
15.00, 1, 1, 'KOVAX', '230x280mm', NULL,
'เบอร์ P800 ขัดเซอร์เฟเซอร์\nใช้ขัดน้ำหรือขัดแห้งได้\nเนื้อกระดาษทนทาน ไม่ขาดง่าย\nขนาดมาตรฐาน 230x280mm',
'P800 grit for surfacer sanding\nWet or dry use\nDurable backing, tear resistant\nStandard 230x280mm size'),

(10, 'กระดาษทรายน้ำ P1500 (แผ่น)', 'Wet Sandpaper P1500 (sheet)',
'กระดาษทรายน้ำเบอร์ P1500 สำหรับขัดลำ (color sanding) ก่อนขัดเงา ขนาด 230x280mm',
'P1500 wet sandpaper for color sanding before polishing. Size 230x280mm.',
18.00, 1, 2, 'KOVAX', '230x280mm', NULL,
'เบอร์ P1500 ขัดลำก่อนขัดเงา\nขัดน้ำเท่านั้น\nเนื้อละเอียด ไม่ทิ้งรอย\nผลลัพธ์เรียบเนียนพร้อมขัดเงา',
'P1500 grit for color sanding\nWet sanding only\nFine grit, scratch-free finish\nSmooth finish ready for polishing'),

(10, 'น้ำยาขัดเงา (Compound) #1 ตัดรอย', 'Polishing Compound #1 Heavy Cut',
'น้ำยาขัดเงาขั้นตัดรอย ลบรอยขีดข่วนจากกระดาษทราย P1500-P2000 ได้อย่างรวดเร็ว',
'Heavy cutting compound for removing P1500-P2000 sanding scratches quickly.',
450.00, 1, 3, 'PP Plus', '500ml', 'ml',
'ตัดรอยเร็ว ลบรอยทรายได้หมด\nไม่ทิ้งรอยหมุน\nใช้ได้กับเครื่องขัดและขัดมือ\nขนาด 500ml',
'Fast cutting, removes all sanding marks\nHologram-free finish\nMachine and hand use\n500ml size');

-- ── หมวด 11: อุปกรณ์ซ่อมสี ──
INSERT INTO menu_items (categoryId, nameTh, nameEn, descriptionTh, descriptionEn, price, isAvailable, sortOrder, brand, size, unit, featuresTh, featuresEn) VALUES
(11, 'สีโป๊ว 2K (Polyester Putty)', '2K Polyester Body Filler',
'สีโป๊วโพลีเอสเตอร์ 2 ส่วนผสม ยึดเกาะดี ขัดง่าย เนื้อละเอียด สำหรับซ่อมผิวรถบุบ รอยบุ๋ม',
'2-component polyester body filler with excellent adhesion, easy sanding and fine finish for dent repair.',
380.00, 1, 1, 'PP Plus', '1kg', 'kg',
'เนื้อละเอียด เกลี่ยง่าย\nยึดเกาะดี ไม่หลุดร่อน\nขัดง่าย ไม่อุดตันกระดาษทราย\nแห้งเร็ว 15-20 นาที',
'Fine texture, easy spreading\nExcellent adhesion, no peeling\nEasy sanding, non-clogging\nFast cure 15-20 minutes'),

(11, 'เทปกาวมาสกิ้ง (Masking Tape)', 'Automotive Masking Tape',
'เทปกาวมาสกิ้งสำหรับงานพ่นสีรถยนต์ ทนอุณหภูมิสูง ไม่ทิ้งกาว ขอบคม',
'Automotive masking tape, heat resistant, clean removal with sharp edges.',
85.00, 1, 2, '3M', '18mm x 55m', NULL,
'ทนความร้อนสูงถึง 80°C\nไม่ทิ้งกาวเมื่อลอกออก\nขอบคมไม่ยุ่ย\nยึดเกาะดีกับทุกพื้นผิว',
'Heat resistant up to 80°C\nClean removal, no residue\nSharp edges, no fraying\nExcellent adhesion to all surfaces');

-- ── หมวด 12: อุปกรณ์ป้องกัน ──
INSERT INTO menu_items (categoryId, nameTh, nameEn, descriptionTh, descriptionEn, price, isAvailable, sortOrder, brand, size, unit, featuresTh, featuresEn) VALUES
(12, 'หน้ากากกันสารเคมี (ตัวกรองคู่)', 'Chemical Respirator (Dual Filter)',
'หน้ากากครึ่งหน้ากันสารเคมี ตัวกรองคู่ สำหรับงานพ่นสีและทินเนอร์ กรองไอระเหยตัวทำละลาย',
'Half-face chemical respirator with dual filters for paint and solvent vapor protection.',
650.00, 1, 1, '3M', 'Free Size', NULL,
'กรองไอระเหยตัวทำละลายอินทรีย์\nตัวกรองคู่ 2 ด้าน\nใส่สบาย วาล์วหายใจออก\nเปลี่ยนตัวกรองได้',
'Filters organic solvent vapors\nDual filter design\nComfortable fit with exhalation valve\nReplaceable filter cartridges'),

(12, 'ชุดพ่นสี PPE ครบเซ็ต', 'PPE Paint Suit Full Set',
'ชุดป้องกันสำหรับงานพ่นสี ครบเซ็ต ประกอบด้วย ชุดหมี หน้ากาก ถุงมือ แว่นตา',
'Complete PPE set for painting: coverall suit, respirator, gloves, and safety goggles.',
1200.00, 1, 2, 'PP Plus', 'L/XL', NULL,
'ครบเซ็ตพร้อมใช้งาน\nชุดหมีกันสีเปื้อน\nหน้ากากกรองไอระเหย\nถุงมือไนไตรล์ + แว่นตานิรภัย',
'Complete ready-to-use set\nPaint-resistant coverall\nVapor-filtering respirator\nNitrile gloves + safety goggles');

-- ============================================
-- 4. POPUP โปรโมชั่น
-- ============================================
INSERT INTO popups (title, titleTh, description, descriptionTh, imageUrl, badge, tags, tagsTh, features, featuresTh, buttonText, buttonTextTh, isActive) VALUES
('🎉 Grand Opening Promotion!', '🎉 โปรเปิดร้านใหม่!',
'Special promotion for our grand opening! Get up to 20% off on all PP Plus branded products. Free spray gun cleaning kit with every purchase over ฿5,000. Limited time offer!',
'โปรโมชั่นพิเศษเปิดร้านใหม่! ลดสูงสุด 20% สินค้าแบรนด์ PP Plus ทุกชิ้น ซื้อครบ 5,000 บาท รับชุดทำความสะอาดปืนฟรี! จำนวนจำกัด!',
NULL,
'🔥 HOT DEAL',
'promotion,discount,grand-opening',
'โปรโมชั่น,ส่วนลด,เปิดร้านใหม่',
'Up to 20% off PP Plus products\nFree gun cleaning kit (min ฿5,000)\nFree delivery in Bangkok area\nValid until end of this month',
'ลดสูงสุด 20% สินค้า PP Plus\nรับชุดล้างปืนฟรี (ซื้อขั้นต่ำ 5,000 บาท)\nส่งฟรีในกรุงเทพและปริมณฑล\nถึงสิ้นเดือนนี้เท่านั้น',
'Shop Now', 'ช้อปเลย', 1),

('🎨 Clear Coat Combo Deal', '🎨 โปรแลคเกอร์คุ้มค่า!',
'Buy Clear Coat HS 2:1 (1L) + Hardener (500ml) together and save 15%! Professional grade quality at workshop-friendly prices.',
'ซื้อแลคเกอร์ HS 2:1 (1L) + ฮาร์ดเดนเนอร์ (500ml) คู่กัน ลดทันที 15%! คุณภาพระดับมืออาชีพ ในราคาที่อู่ไว้ใจ',
NULL,
'💰 COMBO',
'combo,clear-coat,promotion',
'คอมโบ,แลคเกอร์,โปรโมชั่น',
'Clear Coat HS 1L + Hardener 500ml\nSave 15% when bought together\nProfessional HS formula\nMirror-like deep gloss finish',
'แลคเกอร์ HS 1L + ฮาร์ดเดนเนอร์ 500ml\nซื้อคู่ลด 15%\nสูตร HS ระดับมืออาชีพ\nเงาลึกเหมือนกระจก',
'Get Combo', 'รับโปรคอมโบ', 1),

('🚗 Free Color Matching!', '🚗 ผสมสีฟรี!',
'Bring your car panel or color code — we will match and mix your exact color for FREE! Only pay for the paint. Available for all car brands.',
'นำชิ้นส่วนรถหรือรหัสสีมาที่ร้าน เราผสมสีให้ตรงโทน ฟรี! จ่ายแค่ค่าสี บริการทุกยี่ห้อรถ ทุกรุ่น',
NULL,
'✨ FREE',
'service,color-matching,free',
'บริการ,ผสมสี,ฟรี',
'Free color matching service\nAll car brands supported\nColor spectrophotometer accuracy\nReady while you wait',
'บริการผสมสีฟรี\nรองรับทุกยี่ห้อรถ\nใช้เครื่องวัดสี Spectrophotometer\nรอรับได้เลย',
'Learn More', 'ดูรายละเอียด', 1);

-- ============================================
-- 5. BLOG POSTS (บทความ)
-- ============================================
INSERT INTO blog_posts (titleTh, titleEn, contentTh, contentEn, excerptTh, excerptEn, slug, tags, isPublished, publishedAt) VALUES
('วิธีพ่นสีรถยนต์ด้วยตัวเอง - คู่มือสำหรับมือใหม่',
'How to Paint Your Car Yourself - A Beginner''s Guide',
'<h2>ขั้นตอนการพ่นสีรถยนต์สำหรับมือใหม่</h2>
<p>การพ่นสีรถยนต์ไม่ใช่เรื่องยากอย่างที่คิด หากคุณมีอุปกรณ์ที่ถูกต้องและทำตามขั้นตอนอย่างเป็นระบบ บทความนี้จะพาคุณผ่านทุกขั้นตอนตั้งแต่การเตรียมผิวจนถึงการขัดเงา</p>
<h3>1. เตรียมพื้นผิว (Surface Preparation)</h3>
<p>ขั้นตอนที่สำคัญที่สุด! ขัดสีเก่าด้วยกระดาษทราย P320-P400 ทำความสะอาดด้วยน้ำยาล้างไขมัน (Degreaser) จนผิวสะอาดหมดจด</p>
<h3>2. พ่นไพรเมอร์/เซอร์เฟเซอร์</h3>
<p>พ่นอีพ็อกซี่ไพรเมอร์ 1-2 เที่ยว ตามด้วยเซอร์เฟเซอร์ 2-3 เที่ยว รอแห้ง แล้วขัดด้วย P400-P600</p>
<h3>3. พ่นสีทับหน้า</h3>
<p>สำหรับสีโซลิด: พ่นสี 2K 2-3 เที่ยว / สำหรับสีเมทัลลิก: พ่นเบสโค้ท 3-4 เที่ยว แล้วพ่นเคลียร์โค้ททับ</p>
<h3>4. พ่นเคลียร์โค้ท</h3>
<p>พ่นแลคเกอร์ 2 เที่ยว ฟูลโค้ท ให้ทั่วและสม่ำเสมอ</p>
<h3>5. ขัดเงา</h3>
<p>รอ 24-48 ชม. ขัดลำด้วยกระดาษทราย P1500-P2000 แล้วขัดเงาด้วย Compound</p>',
'<h2>Car Painting Steps for Beginners</h2>
<p>Painting a car isn''t as difficult as you think. With the right equipment and systematic steps, this guide will take you through every stage from surface preparation to polishing.</p>
<h3>1. Surface Preparation</h3>
<p>The most important step! Sand old paint with P320-P400, clean with degreaser until surface is perfectly clean.</p>
<h3>2. Primer/Surfacer Application</h3>
<p>Apply epoxy primer 1-2 coats, followed by surfacer 2-3 coats. Dry, then sand with P400-P600.</p>
<h3>3. Topcoat Application</h3>
<p>For solid colors: apply 2K paint 2-3 coats / For metallic: apply basecoat 3-4 coats then clear coat on top.</p>
<h3>4. Clear Coat Application</h3>
<p>Apply 2 full coats of clear coat, even and uniform.</p>
<h3>5. Polishing</h3>
<p>Wait 24-48 hrs, color sand with P1500-P2000, then polish with compound.</p>',
'คู่มือพ่นสีรถยนต์ฉบับสมบูรณ์ สำหรับมือใหม่ที่อยากเรียนรู้การพ่นสีด้วยตัวเอง ตั้งแต่เตรียมผิว พ่นไพรเมอร์ พ่นสี ไปจนถึงขัดเงา',
'Complete car painting guide for beginners who want to learn DIY painting, from surface prep, primer, painting to polishing.',
'how-to-paint-car-beginners-guide', 'การพ่นสี,มือใหม่,DIY,คู่มือ', 1, NOW()),

('เปรียบเทียบแลคเกอร์ HS 2:1 vs MS 4:1 ต่างกันยังไง?',
'HS 2:1 vs MS 4:1 Clear Coat - What''s the Difference?',
'<h2>แลคเกอร์ HS กับ MS ต่างกันอย่างไร?</h2>
<p>เมื่อเลือกซื้อแลคเกอร์ (เคลียร์โค้ท) สำหรับพ่นรถยนต์ คุณจะเจอ 2 ประเภทหลักคือ HS (High Solid) และ MS (Medium Solid) ทั้งสองมีข้อดีข้อเสียต่างกัน</p>
<h3>HS 2:1 (High Solid)</h3>
<ul><li>ฟิล์มหนากว่า เงาลึกกว่า</li><li>ทนรอยขีดข่วนดีกว่า</li><li>พ่นแค่ 2 เที่ยว</li><li>ราคาสูงกว่า</li><li>เหมาะสำหรับงานคุณภาพสูง</li></ul>
<h3>MS 4:1 (Medium Solid)</h3>
<ul><li>ราคาประหยัดกว่า</li><li>พ่นง่ายกว่าสำหรับมือใหม่</li><li>ฟิล์มบางกว่า ต้องพ่น 2-3 เที่ยว</li><li>เหมาะสำหรับงานซ่อมทั่วไป</li></ul>
<h3>สรุป</h3>
<p>ถ้าต้องการคุณภาพเงาสูงสุด เลือก HS 2:1 / ถ้าต้องการประหยัดหรือเป็นมือใหม่ เลือก MS 4:1</p>',
'<h2>What''s the difference between HS and MS clear coat?</h2>
<p>When buying clear coat for automotive refinish, you''ll find 2 main types: HS (High Solid) and MS (Medium Solid). Each has its pros and cons.</p>
<h3>HS 2:1 (High Solid)</h3>
<ul><li>Thicker film, deeper gloss</li><li>Better scratch resistance</li><li>Only 2 coats needed</li><li>Higher price point</li><li>Best for premium quality work</li></ul>
<h3>MS 4:1 (Medium Solid)</h3>
<ul><li>More economical</li><li>Easier to spray for beginners</li><li>Thinner film, needs 2-3 coats</li><li>Good for general repair work</li></ul>
<h3>Summary</h3>
<p>For maximum gloss quality, choose HS 2:1 / For budget or beginner work, choose MS 4:1.</p>',
'เปรียบเทียบแลคเกอร์ 2 ประเภท HS (High Solid) กับ MS (Medium Solid) ต่างกันอย่างไร เลือกแบบไหนดี?',
'Comparing 2 types of clear coat: HS (High Solid) vs MS (Medium Solid). What''s the difference and which to choose?',
'hs-vs-ms-clear-coat-comparison', 'แลคเกอร์,เคลียร์โค้ท,เปรียบเทียบ,HS,MS', 1, NOW()),

('5 สาเหตุที่ทำให้พ่นสีไม่สวย และวิธีแก้ไข',
'5 Common Paint Defects and How to Fix Them',
'<h2>ปัญหาที่พบบ่อยในงานพ่นสีรถยนต์</h2>
<h3>1. ผิวส้ม (Orange Peel)</h3>
<p><strong>สาเหตุ:</strong> ทินเนอร์น้อยเกินไป, แรงดันลมต่ำ, ระยะพ่นไกลเกินไป</p>
<p><strong>แก้ไข:</strong> เพิ่มทินเนอร์ 5-10%, เพิ่มแรงดันลม, ลดระยะพ่นให้ใกล้ขึ้น หรือเติมสาร Anti-Orange Peel</p>
<h3>2. สีไหล (Paint Run)</h3>
<p><strong>สาเหตุ:</strong> พ่นหนาเกินไป, ทินเนอร์มากเกินไป, ระยะพ่นใกล้เกินไป</p>
<p><strong>แก้ไข:</strong> พ่นบางๆ หลายเที่ยว, ลดทินเนอร์, เพิ่มระยะพ่น</p>
<h3>3. สีด่าง/เมทัลลิกไม่สม่ำเสมอ (Mottling)</h3>
<p><strong>สาเหตุ:</strong> ทินเนอร์ไม่เหมาะ, ไม่พ่นมิสต์โค้ทเที่ยวสุดท้าย</p>
<p><strong>แก้ไข:</strong> ใช้ทินเนอร์เบสโค้ท, พ่นมิสต์โค้ทเที่ยวสุดท้ายเบาๆ</p>
<h3>4. รูเข็ม (Pinhole)</h3>
<p><strong>สาเหตุ:</strong> ฟองอากาศในสีโป๊ว, เนื้อสีหนาเกินไป</p>
<p><strong>แก้ไข:</strong> ผสมสีโป๊วให้ดี ไล่ฟอง, พ่นบางๆ ทีละเที่ยว</p>
<h3>5. Dry Spray (ผิวหยาบ แห้ง)</h3>
<p><strong>สาเหตุ:</strong> อากาศร้อน สีแห้งกลางอากาศก่อนถึงผิวชิ้นงาน</p>
<p><strong>แก้ไข:</strong> ใช้ทินเนอร์สูตรช้า, เติม Retarder 5-10%, ลดระยะพ่น</p>',
'<h2>Common Paint Defects in Automotive Refinish</h2>
<h3>1. Orange Peel</h3>
<p><strong>Cause:</strong> Too little thinner, low air pressure, spraying too far</p>
<p><strong>Fix:</strong> Add 5-10% thinner, increase air pressure, reduce spray distance, or add Anti-Orange Peel additive</p>
<h3>2. Paint Run/Sag</h3>
<p><strong>Cause:</strong> Spraying too heavy, too much thinner, spraying too close</p>
<p><strong>Fix:</strong> Apply thin multiple coats, reduce thinner, increase spray distance</p>
<h3>3. Mottling (Uneven Metallic)</h3>
<p><strong>Cause:</strong> Wrong thinner, no mist coat on final pass</p>
<p><strong>Fix:</strong> Use basecoat thinner, apply light mist coat on final pass</p>
<h3>4. Pinhole</h3>
<p><strong>Cause:</strong> Air bubbles in filler, applying too thick</p>
<p><strong>Fix:</strong> Mix filler properly to remove air, apply thin coats</p>
<h3>5. Dry Spray</h3>
<p><strong>Cause:</strong> Hot weather causes paint to dry mid-air before reaching surface</p>
<p><strong>Fix:</strong> Use slow thinner, add 5-10% Retarder, reduce spray distance</p>',
'5 ปัญหาที่พบบ่อยในงานพ่นสีรถยนต์ ผิวส้ม สีไหล สีด่าง รูเข็ม Dry Spray พร้อมวิธีแก้ไข',
'5 common automotive paint defects: orange peel, runs, mottling, pinholes, dry spray - with solutions.',
'5-common-paint-defects-fixes', 'ปัญหาพ่นสี,ผิวส้ม,สีไหล,แก้ไข,tips', 1, NOW()),

('ทำไมต้องเลือกสี PP Plus? คุณภาพระดับ OEM ราคาช่าง',
'Why Choose PP Plus Paint? OEM Quality at Workshop Price',
'<h2>PP Plus - สีพ่นรถยนต์คุณภาพสูง ในราคาที่อู่ไว้ใจ</h2>
<p>PP Plus เป็นแบรนด์สีพ่นรถยนต์ที่พัฒนาขึ้นโดยคนไทย เพื่อตอบโจทย์ช่างสีและอู่รถยนต์ที่ต้องการสีคุณภาพดีในราคาสมเหตุสมผล</p>
<h3>จุดเด่นของ PP Plus</h3>
<ul>
<li><strong>เทียบเท่า OEM:</strong> สูตรสีเทียบตรงจากโรงงานรถยนต์ ผสมด้วยเครื่อง Spectrophotometer</li>
<li><strong>ราคายุติธรรม:</strong> ตัดพ่อค้าคนกลาง ขายตรงจากโรงงาน</li>
<li><strong>คุณภาพสม่ำเสมอ:</strong> ควบคุมคุณภาพทุกล็อตการผลิต</li>
<li><strong>สูตรสีครบ:</strong> มีสูตรสีรถยนต์มากกว่า 10,000 สี ครบทุกยี่ห้อ</li>
<li><strong>บริการหลังการขาย:</strong> ปรึกษาปัญหาพ่นสีได้ตลอด</li>
</ul>',
'<h2>PP Plus - High Quality Automotive Paint at Workshop-Friendly Prices</h2>
<p>PP Plus is a Thai-developed automotive paint brand designed to meet the needs of professional painters and workshops who want quality paint at reasonable prices.</p>
<h3>PP Plus Advantages</h3>
<ul>
<li><strong>OEM Equivalent:</strong> Color formulas matched from factory using Spectrophotometer</li>
<li><strong>Fair Pricing:</strong> Factory-direct sales, no middleman markup</li>
<li><strong>Consistent Quality:</strong> Quality controlled in every production batch</li>
<li><strong>Complete Color Library:</strong> Over 10,000 automotive color formulas covering all brands</li>
<li><strong>After-sales Support:</strong> Paint troubleshooting consultation available anytime</li>
</ul>',
'ทำไมช่างสีและอู่รถยนต์ทั่วประเทศเลือกใช้สี PP Plus? เพราะคุณภาพเทียบเท่า OEM ในราคาที่ยุติธรรม',
'Why do professional painters and workshops across Thailand choose PP Plus? OEM-equivalent quality at fair prices.',
'why-choose-pp-plus-paint', 'PP Plus,คุณภาพ,OEM,แบรนด์', 1, NOW());

-- ============================================
-- 6. COLOR FORMULAS (สูตรสีรถยนต์)
-- ============================================
INSERT INTO color_formulas (carBrand, colorCode, colorNameTh, colorNameEn, yearRange, formulaType, deltaE) VALUES
('TOYOTA', '040', 'ซุปเปอร์ไวท์', 'Super White', '2015-2026', 'solid', 0.35),
('TOYOTA', '070', 'แพลทินัม ไวท์ เพิร์ล', 'Platinum White Pearl', '2019-2026', 'pearl', 0.28),
('TOYOTA', '1G3', 'เกร์ เมทัลลิก', 'Grey Metallic', '2018-2026', 'metallic', 0.42),
('TOYOTA', '202', 'แบล็ค', 'Black', '2015-2026', 'solid', 0.20),
('TOYOTA', '1D4', 'ซิลเวอร์ เมทัลลิก', 'Silver Metallic', '2017-2026', 'metallic', 0.38),
('TOYOTA', '3R3', 'เรด ไมก้า เมทัลลิก', 'Red Mica Metallic', '2017-2025', 'metallic', 0.38),
('TOYOTA', '3P0', 'ซุปเปอร์ เรด', 'Super Red', '2018-2026', 'solid', 0.30),
('TOYOTA', '8X8', 'บรอนซ์ ไมก้า เมทัลลิก', 'Bronze Mica Metallic', '2020-2026', 'metallic', 0.45),
('HONDA', 'NH-731P', 'คริสตัล แบล็ค เพิร์ล', 'Crystal Black Pearl', '2016-2026', 'pearl', 0.28),
('HONDA', 'NH-883P', 'พลาทินัม ไวท์ เพิร์ล', 'Platinum White Pearl', '2019-2026', 'pearl', 0.31),
('HONDA', 'R-81', 'มิลาโน เรด', 'Milano Red', '2017-2026', 'solid', 0.25),
('HONDA', 'NH-830M', 'ลูนาร์ ซิลเวอร์ เมทัลลิก', 'Lunar Silver Metallic', '2019-2026', 'metallic', 0.35),
('NISSAN', 'KH3', 'ซุปเปอร์ แบล็ค', 'Super Black', '2015-2026', 'solid', 0.25),
('NISSAN', 'QAB', 'บริลเลียนท์ ซิลเวอร์', 'Brilliant Silver', '2018-2026', 'metallic', 0.40),
('ISUZU', '527', 'ซิลเวอร์ เมทัลลิก', 'Silver Metallic', '2020-2026', 'metallic', 0.40),
('ISUZU', '568', 'ออนิกซ์ แบล็ค', 'Onyx Black', '2021-2026', 'metallic', 0.32),
('MAZDA', '46V', 'โซล เรด คริสตัล เมทัลลิก', 'Soul Red Crystal Metallic', '2019-2026', 'pearl', 0.33),
('MAZDA', '25D', 'โซนิค ซิลเวอร์ เมทัลลิก', 'Sonic Silver Metallic', '2019-2026', 'metallic', 0.37),
('FORD', 'PN4GE', 'เมทิโอ เกร์ เมทัลลิก', 'Meteor Grey Metallic', '2020-2025', 'metallic', 0.37),
('FORD', 'YZ', 'อาร์คติก ไวท์', 'Arctic White', '2020-2026', 'solid', 0.22),
('MITSUBISHI', 'W13', 'ไวท์ เพิร์ล', 'White Pearl', '2018-2026', 'pearl', 0.30),
('MITSUBISHI', 'X42', 'แบล็ค ไมก้า', 'Black Mica', '2019-2026', 'metallic', 0.28),
('MG', 'PNL', 'โดเวอร์ ไวท์', 'Dover White', '2020-2026', 'solid', 0.32),
('MG', 'MXK', 'แบล็ค เพิร์ล', 'Black Pearl', '2020-2026', 'pearl', 0.35),
('SUZUKI', 'Z7T', 'ซุปเปอร์ แบล็ค เพิร์ล', 'Super Black Pearl', '2019-2026', 'pearl', 0.30);

-- ============================================
-- 7. HERO SLIDES
-- ============================================
INSERT INTO hero_slides (type, titleTh, titleEn, isActive, sortOrder) VALUES
('image', 'สีพ่นรถยนต์คุณภาพสูง PP Plus', 'PP Plus Premium Automotive Paint', 1, 1),
('image', 'บริการผสมสีตรงโทน ทุกยี่ห้อรถ', 'Color Matching Service for All Car Brands', 1, 2),
('image', 'อุปกรณ์พ่นสีครบวงจร', 'Complete Spray Equipment Solutions', 1, 3);

-- ============================================
-- 8. GALLERY IMAGES
-- ============================================
INSERT INTO gallery_images (image, category, labelTh, labelEn, sortOrder, isActive) VALUES
('https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&h=600&fit=crop', 'workshop', 'บรรยากาศร้าน PP Plus', 'PP Plus Workshop', 1, 1),
('https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=600&fit=crop', 'product', 'สีพ่นรถยนต์ PP Plus', 'PP Plus Automotive Paint', 2, 1),
('https://images.unsplash.com/photo-1610397962076-02407a169a5b?w=800&h=600&fit=crop', 'work', 'งานพ่นสีรถยนต์', 'Car Painting Work', 3, 1),
('https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&h=600&fit=crop', 'work', 'งานขัดเงารถยนต์', 'Car Polishing', 4, 1),
('https://images.unsplash.com/photo-1507136566006-cfc505b114fc?w=800&h=600&fit=crop', 'product', 'ปืนพ่นสี HVLP', 'HVLP Spray Gun', 5, 1),
('https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=800&h=600&fit=crop', 'work', 'งานเตรียมผิวก่อนพ่นสี', 'Surface Preparation', 6, 1);

-- ============================================
-- สร้างตาราง b2b_documents ถ้ายังไม่มี
-- ============================================
CREATE TABLE IF NOT EXISTS b2b_documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nameTh VARCHAR(255) NOT NULL,
  nameEn VARCHAR(255) NOT NULL,
  filePath VARCHAR(500) NOT NULL,
  fileSize VARCHAR(50) NOT NULL,
  fileType VARCHAR(50) NOT NULL,
  sortOrder INT NOT NULL DEFAULT 0,
  isActive TINYINT(1) NOT NULL DEFAULT 1,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- เสร็จสิ้น! ข้อมูล Seed ทั้งหมด
-- ============================================
-- สรุปข้อมูลที่สร้าง:
-- ✅ สินค้าจริง 28 รายการ (ครบ 12 หมวดหมู่)
-- ✅ โปรโมชั่น Popup 3 รายการ
-- ✅ บทความ Blog 4 เรื่อง
-- ✅ สูตรสีรถยนต์ 25 สูตร (Toyota, Honda, Nissan, Isuzu, Mazda, Ford, Mitsubishi, MG, Suzuki)
-- ✅ Hero Slides 3 รายการ
-- ✅ Gallery 6 รูป
-- ✅ ข้อมูลร้าน Site Contents
-- ============================================
