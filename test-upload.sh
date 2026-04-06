#!/bin/bash
# Test script สำหรับเช็ค upload API และ file system บน Hostinger

echo "=== PP Plus Upload Test Script ==="
echo ""

# 1. ตรวจสอบ uploads directory
echo "1. Checking uploads directory..."
if [ -d "/home/u626866170/uploads" ]; then
    echo "   ✓ Directory exists"
    ls -la /home/u626866170/uploads/
    df -h /home/u626866170/uploads/
else
    echo "   ✗ Directory NOT found"
    echo "   Creating..."
    mkdir -p /home/u626866170/uploads
    chmod 755 /home/u626866170/uploads
fi

echo ""

# 2. ตรวจสอบ .env.local
echo "2. Checking .env.local..."
FRONTEND_PATH=$(find ~ -name "server.js" -path "*/frontend/*" 2>/dev/null | head -1 | xargs dirname)
if [ -z "$FRONTEND_PATH" ]; then
    FRONTEND_PATH="/home/u626866170/public_html/ppplus/frontend"
fi

if [ -f "$FRONTEND_PATH/.env.local" ]; then
    echo "   ✓ .env.local found at: $FRONTEND_PATH"
    grep -E "UPLOADS_DIR|MYSQL_HOST|MYSQL_USER|MYSQL_DATABASE" "$FRONTEND_PATH/.env.local"
else
    echo "   ✗ .env.local NOT found"
fi

echo ""

# 3. ตรวจสอบ MySQL connection
echo "3. Testing MySQL connection..."
MYSQL_USER=$(grep "MYSQL_USER=" "$FRONTEND_PATH/.env.local" 2>/dev/null | cut -d= -f2)
MYSQL_DB=$(grep "MYSQL_DATABASE=" "$FRONTEND_PATH/.env.local" 2>/dev/null | cut -d= -f2)

if mysql -u "$MYSQL_USER" "$MYSQL_DB" -e "SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema='$MYSQL_DB';" 2>/dev/null; then
    echo "   ✓ MySQL connected"
    # Check hero_slides table
    echo ""
    echo "   Hero Slides count:"
    mysql -u "$MYSQL_USER" "$MYSQL_DB" -e "SELECT COUNT(*) FROM hero_slides;" 2>/dev/null
    
    echo ""
    echo "   Hero Slides data (image field):"
    mysql -u "$MYSQL_USER" "$MYSQL_DB" -e "SELECT id, type, image, isActive FROM hero_slides LIMIT 5;" 2>/dev/null
else
    echo "   ✗ MySQL connection failed"
fi

echo ""

# 4. ตรวจสอบ Node.js process
echo "4. Checking Node.js process..."
if pgrep -f "node.*server.js" > /dev/null; then
    echo "   ✓ Node.js server is running"
    ps aux | grep "node.*server.js" | grep -v grep
else
    echo "   ✗ Node.js server NOT running"
fi

echo ""

# 5. ทดสอบ API endpoints
echo "5. Testing API endpoints..."

# Health check
echo "   Testing /api/health..."
HEALTH=$(curl -s https://pcolour.com/api/health)
if echo "$HEALTH" | grep -q "success"; then
    echo "   ✓ API responsive: $HEALTH"
else
    echo "   ✗ API not responsive"
fi

echo ""

# 6. ตรวจสอบ directory structure
echo "6. Checking .next/standalone structure..."
STANDALONE_PATH="$FRONTEND_PATH/.next/standalone"
if [ -d "$STANDALONE_PATH" ]; then
    echo "   ✓ Standalone build exists"
    echo "   Files:"
    ls -la "$STANDALONE_PATH/" | head -10
    
    if [ -f "$STANDALONE_PATH/server.js" ]; then
        echo "   ✓ server.js exists"
    else
        echo "   ✗ server.js missing - rebuild needed"
    fi
    
    if [ -d "$STANDALONE_PATH/.next/static" ]; then
        echo "   ✓ .next/static exists"
    else  
        echo "   ✗ .next/static missing - rebuild needed"
    fi
else
    echo "   ✗ .next/standalone NOT found - needs npm run build"
fi

echo ""
echo "=== End of Test ==="
echo ""
echo "RECOMMENDED ACTIONS:"
echo "1. If uploads dir missing: mkdir -p /home/u626866170/uploads && chmod 755 /home/u626866170/uploads"
echo "2. If Node not running: cd $FRONTEND_PATH && nohup node server.js > app.log 2>&1 &"
echo "3. If build missing: cd $FRONTEND_PATH && npm install && npm run build"
echo "4. If MySQL failed: check .env.local credentials and database exists"
