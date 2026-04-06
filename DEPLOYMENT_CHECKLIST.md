# Complete Deployment Checklist - Local to Hostinger

## ขั้นตอนที่ 1: LOCAL (Windows Machine)

### 1.1 ตรวจสอบ Git sync
```bash
cd C:\Users\ISABANLUE\Desktop\PPPLUS\frontend
git status
git pull origin main
```
✓ ต้องเห็น: "Already up to date" หรือ pull latest commits

### 1.2 ติดตั้ง Dependencies
```bash
npm install
```
✓ ต้องสำเร็จโดยไม่มี error

### 1.3 Build สำหรับ Production
```bash
npm run build
```
✓ ต้องเห็น: "✓ Compiled successfully"

### 1.4 ตรวจสอบ Build Artifacts
```bash
# Windows PowerShell
ls -Path .\.next\standalone\
ls -Path .\public\
```
ต้องมี:
- `.next/standalone/server.js`
- `.next/standalone/.next/static/` (folder)
- `public/manifest.json`
- `public/icons/`

---

## ขั้นตอนที่ 2: HOSTINGER - SSH เตรียมการที่ต้อง

### 2.1 SSH เข้า Hostinger
ใช้ Hostinger cPanel → Terminal หรือ external SSH client

### 2.2 หา Path จริง
```bash
# ในการเข้า SSH ของ Hostinger
echo $HOME
ls -la ~/public_html/

# ผลลัพธ์ที่คาดหวัง:
# HOME: /home/u626866170
# public_html มี: ppplus folder หรือ app files
```

### 2.3 หา Node.js และ npm
```bash
which node
which npm
node --version
npm --version
```

**หากไม่เจอ:**
- ติดต่อ Hostinger Support เพื่อให้เปิดใช้ Node.js
- หรือ ใช้ Node Version Manager

---

## ขั้นตอนที่ 3: HOSTINGER - Clone & Build

### 3.1 Clone GitHub Repo (ถ้ายังไม่มี)
```bash
cd ~/public_html
# ถ้า ppplus folder ยังไม่มี
git clone https://github.com/wuttikorntan-sys/ppplus.git

# ถ้ามี folder แล้ว ให้ update
cd ~/public_html/ppplus
git pull origin main
```

### 3.2 ไปที่ Frontend folder
```bash
cd ~/public_html/ppplus/frontend
# หรือ (ถ้า path ต่างกัน)
cd ~/your_actual_path/frontend
```

### 3.3 ตั้งค่า Environment
```bash
# สร้าง .env.local (ตัวอย่าง)
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=https://pcolour.com/api

MYSQL_HOST=localhost
MYSQL_USER=u626866170_ppplus
MYSQL_PASSWORD=Thailand2022
MYSQL_DATABASE=u626866170_ppplus

JWT_SECRET=generate-random-32-char-string-here
JWT_REFRESH_SECRET=generate-random-32-char-refresh-string

UPLOADS_DIR=/home/u626866170/uploads
EOF
```

### 3.4 สร้าง Uploads Directory
```bash
mkdir -p /home/u626866170/uploads
chmod 755 /home/u626866170/uploads
```

### 3.5 Install & Build
```bash
# ติดตั้ง dependencies
npm install

# Build
npm run build
```
✓ ต้องเห็น: "✓ Compiled successfully"

### 3.6 ตรวจสอบ Build Output
```bash
ls -la .next/standalone/
ls -la .next/standalone/.next/static/
```

---

## ขั้นตอนที่ 4: HOSTINGER - เริ่ม Server

### วิธีที่ 1: ใช้ nohup (ง่ายที่สุด)
```bash
cd ~/public_html/ppplus/frontend

# เริ่ม server ในพื้นหลัง
nohup node server.js > app.log 2>&1 &

# ตรวจสอบ process
ps aux | grep "node server.js"

# ดู logs
tail -f app.log
```

### วิธีที่ 2: ใช้ PM2 (ดีกว่าสำหรับ production)
```bash
# ติดตั้ง PM2 globally
npm install -g pm2

# เริ่ม app
pm2 start ~/public_html/ppplus/frontend/server.js --name "ppplus"

# ให้ run ตอน startup
pm2 startup
pm2 save

# ตรวจสอบ status
pm2 status
pm2 logs
```

---

## ขั้นตอนที่ 5: HOSTINGER - Apache Configuration

### 5.1 ตรวจสอบ Port
```bash
# ตรวจสอบว่า port 3000 open (ควรเปิด)
netstat -tulpn | grep 3000
```

### 5.2 สร้าง/แก้ไข `.htaccess`
ในโฟลเดอร์ `public_html/ppplus/frontend/public/` สร้างไฟล์ `.htaccess`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # Don't rewrite actual files or directories
  RewriteCond %{REQUEST_FILENAME} -f
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]

  # Forward to Node.js server on port 3000
  RewriteRule ^(.*)$ http://localhost:3000/$1 [P,QSA,L]
</IfModule>

# Compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
</IfModule>

# Cache control
<FilesMatch "\.(jpg|jpeg|png|gif|ico|css|js|svg|webp|woff|woff2)$">
  Header set Cache-Control "max-age=31536000, public"
</FilesMatch>
```

### 5.3 ถ้าใช้ cPanel
- หรือไปที่ Addon Domains / Parking Domains
- ตั้ง Document Root ให้ชี้ไปที่ `~/public_html/ppplus/frontend/public`

---

## ขั้นตอนที่ 6: ตรวจสอบ Database

### 6.1 เข้า MySQL
```bash
mysql -u u626866170_ppplus -p u626866170_ppplus
```
ใส่ password: `Thailand2022`

### 6.2 ตรวจสอบ Tables
```sql
SHOW TABLES;
DESC users;
SELECT COUNT(*) FROM users;
```

### 6.3 ถ้าไม่มี Tables ให้ Seed
```bash
# ออกจาก MySQL ก่อน
exit

# Seed database
cd ~/public_html/ppplus/frontend
node seed-mysql.js
```

---

## ขั้นตอนที่ 7: ทดสอบ & ตรวจสอบ

### 7.1 ตรวจสอบ API
```bash
# ในเครื่อง local หรือ terminal อื่น
curl https://pcolour.com/api/health
# ควรตอบ: {"success":true,"message":"Server is running"}
```

### 7.2 ตรวจสอบ Login
```bash
curl -X POST https://pcolour.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ppplus.co.th","password":"admin123"}'
```

### 7.3 ดู Console Browser
- ไป https://pcolour.com
- เปิด DevTools (F12)
- ดูที่ Console tab - ต้องไม่มี error แดง

### 7.4 ตรวจสอบ Static Files
```bash
# ค้นหาจริงใน Network tab ของ DevTools
# Manifest: https://pcolour.com/manifest.json → ต้อง 200
# Icons: https://pcolour.com/icons/(...) → ต้อง 200
# JS bundle: https://pcolour.com/_next/static/(...) → ต้อง 200
```

---

## ขั้นตอนที่ 8: ถ้ายังมี Error

### Error: 404 on manifest.json
```bash
# ตรวจสอบ path ของ public folder
ls -la ~/public_html/ppplus/frontend/public/

# ตรวจสอบ .htaccess ถูกต้อง
cat ~/public_html/ppplus/frontend/public/.htaccess
```

### Error: Cannot connect to MySQL
```bash
# ตรวจสอบ credentials ใน .env.local
cat ~/public_html/ppplus/frontend/.env.local

# ทดสอบ MySQL connection
mysql -h localhost -u u626866170_ppplus -p u626866170_ppplus
```

### Error: File upload fails
```bash
# ตรวจสอบ uploads folder
ls -la /home/u626866170/uploads/
chmod 755 /home/u626866170/uploads/

# ตรวจสอบ .env.local มี UPLOADS_DIR
grep UPLOADS_DIR ~/public_html/ppplus/frontend/.env.local
```

### Server crashes
```bash
# ดูสุดท้ายของ logs
tail -50 app.log

# ถ้าใช้ PM2
pm2 logs ppplus --lines 50
pm2 restart ppplus
```

---

## ขั้นตอนที่ 9: Update Code ในอนาคต

เวลาต้องอัปเดตโค้ด:
```bash
cd ~/public_html/ppplus/frontend

# ดึงรหัสใหม่
git pull origin main

# Install new dependencies (ถ้ามี)
npm install

# Build ใหม่
npm run build

# Restart server
pm2 restart ppplus
# หรือ
kill $(ps aux | grep "node server.js" | grep -v grep | awk '{print $2}')
nohup node server.js > app.log 2>&1 &
```

---

## Quick Reference - Commands บน Hostinger

```bash
# Start server
nohup node ~/public_html/ppplus/frontend/server.js > ~/app.log 2>&1 &

# Check if running
ps aux | grep node

# View logs
tail -f ~/app.log

# Stop server
kill $(ps aux | grep "node server.js" | grep -v grep | awk '{print $2}')

# Rebuild
cd ~/public_html/ppplus/frontend && npm run build

# Test API
curl https://pcolour.com/api/health
```

---

## Credentials untuk Testing

**Admin Login (JANGAN LUPA UBAH DI PRODUCTION)**
- Email: `admin@ppplus.co.th`
- Password: `admin123`

**Database**
- User: `u626866170_ppplus`
- Password: `Thailand2022`
- Database: `u626866170_ppplus`

---

## Support Links
- [Hostinger Help Center](https://support.hostinger.com)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Node.js on Hostinger](https://support.hostinger.com/en/articles/3000049-how-to-install-node-js-and-npm-on-our-servers)





cd ~
git clone https://github.com/wuttikorntan-sys/ppplus.git
cd ppplus/frontend