# PP Plus - Hostinger Deployment Guide

## Prerequisites
- Node.js v18+ installed on Hostinger
- MySQL database created on Hostinger
- SSH access to Hostinger

## Step 1: Setup Environment Variables

Create `.env.local` in the `frontend/` directory with:

```bash
# Frontend
NEXT_PUBLIC_API_URL=https://pcolour.com/api

# MySQL (Hostinger Database)
MYSQL_HOST=localhost
MYSQL_USER=u626866170_ppplus
MYSQL_PASSWORD=Thailand2022
MYSQL_DATABASE=u626866170_ppplus

# JWT Secrets
JWT_SECRET=your_random_secret_key_here_min_32_chars
JWT_REFRESH_SECRET=your_random_refresh_secret_key_min_32_chars

# Uploads Directory (persistent, outside git)
UPLOADS_DIR=/home/u626866170/uploads

# SMTP (optional, for email notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_TO=admin@ppplus.co.th
```

## Step 2: Create Uploads Directory

```bash
mkdir -p /home/u626866170/uploads
chmod 755 /home/u626866170/uploads
```

## Step 3: Install & Build

```bash
cd /home/u626866170/public_html/ppplus/frontend

# Install dependencies
npm install

# Build the project
npm run build

# This creates .next/standalone with all necessary files
```

## Step 4: Run the Server

Option A: Using built-in server.js (recommended)
```bash
# Start in background with nohup
nohup node server.js > app.log 2>&1 &

# Or use a process manager like PM2
pm2 start server.js --name "ppplus" --env production
pm2 save
pm2 startup
```

Option B: Using Next.js standalone server directly
```bash
PORT=3000 node .next/standalone/server.js
```

## Step 5: Setup Reverse Proxy (Apache)

Create `.htaccess` in `public_html/`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Don't rewrite actual files
  RewriteCond %{REQUEST_FILENAME} -f
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]
  
  # Forward to Node.js running on port 3000
  RewriteRule ^(.*)$ http://localhost:3000/$1 [P,QSA,L]
  
  ProxyPassReverse / http://localhost:3000/
</IfModule>
```

Or configure via Hostinger cPanel if available.

## Step 6: Verify Database

```bash
# Login to MySQL
mysql -u u626866170_ppplus -p u626866170_ppplus

# Check tables exist
SHOW TABLES;
```

If tables don't exist, seed the database:
```bash
# From frontend/ directory
node seed-mysql.js
```

## Troubleshooting

### 404 Errors on Manifest or Static Files
- Ensure `npm run build` completed successfully
- Check that `.next/standalone/` directory exists
- Verify `public/` folder is in the right location

### Database Connection Errors
- Check `.env.local` has correct MYSQL_HOST (usually localhost)
- Verify user/password in MySQL Databases section
- Ensure database user has proper permissions

### File Upload Fails
- Check `/home/u626866170/uploads` exists and is writable
- Verify `UPLOADS_DIR` environment variable is set

### Images Not Loading
- Check `/uploads/` path is correctly served
- Verify API route `/api/uploads/[...path]` is responding

## Admin Login

Default admin credentials (after seed):
- Email: `admin@ppplus.co.th`
- Password: `admin123`

**Change immediately in production!**

## Monitoring

Check application logs:
```bash
tail -f app.log

# Or with PM2
pm2 logs ppplus
```

Check Node.js process:
```bash
ps aux | grep node
```

## Performance Tips

1. Enable gzip compression in `.htaccess`
2. Cache static assets with long expires headers
3. Monitor MySQL slow queries
4. Use PM2 cluster mode for multiple cores: `pm2 start server.js -i max`

## Security Checklist

- [ ] Change JWT_SECRET and JWT_REFRESH_SECRET to random values
- [ ] Change admin password after first login
- [ ] Set strong SMTP_PASS if using email
- [ ] Disable directory listing in `.htaccess`
- [ ] Set proper file permissions (644 for files, 755 for directories)
- [ ] Use HTTPS (Hostinger provides SSL free)
- [ ] Keep Node.js and npm packages updated

## Update Process

```bash
cd /home/u626866170/public_html/ppplus/frontend

# Pull latest from GitHub
git pull origin main

# Reinstall if any new dependencies
npm install

# Rebuild
npm run build

# Restart application
pm2 restart ppplus
# or
# Kill old process and start new: ps aux | grep node, kill [pid], node server.js
```
