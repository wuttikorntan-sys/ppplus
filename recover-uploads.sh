#!/bin/bash
# Recovery script for PP Plus upload issues on Hostinger

set -e

echo "======================================"
echo "PP Plus Upload Recovery Script"
echo "======================================"
echo ""

# Detect frontend path
FRONTEND_PATH=""
if [ -d "/home/u626866170/public_html/ppplus/frontend" ]; then
    FRONTEND_PATH="/home/u626866170/public_html/ppplus/frontend"
elif [ -d "$HOME/public_html/ppplus/frontend" ]; then
    FRONTEND_PATH="$HOME/public_html/ppplus/frontend"
else
    FRONTEND_PATH=$(find ~ -name "server.js" -path "*/frontend/*" 2>/dev/null | head -1 | xargs dirname)
fi

if [ -z "$FRONTEND_PATH" ] || [ ! -d "$FRONTEND_PATH" ]; then
    echo "ERROR: Could not find frontend directory"
    echo "Tried:"
    echo "  - /home/u626866170/public_html/ppplus/frontend"
    echo "  - ~/public_html/ppplus/frontend"
    exit 1
fi

echo "✓ Frontend path: $FRONTEND_PATH"
echo ""

# ============ STEP 1: Fix uploads directory ============
echo "[1/5] Fixing uploads directory..."
UPLOADS_DIR="/home/u626866170/uploads"

if [ ! -d "$UPLOADS_DIR" ]; then
    echo "  Creating $UPLOADS_DIR..."
    mkdir -p "$UPLOADS_DIR"
fi

chmod 755 "$UPLOADS_DIR"
echo "  ✓ Permissions set: 755"
echo "  ✓ Directory: $UPLOADS_DIR"
ls -la "$UPLOADS_DIR" | head -5
echo ""

# ============ STEP 2: Fix .env.local ============
echo "[2/5] Checking .env.local..."
if [ ! -f "$FRONTEND_PATH/.env.local" ]; then
    echo "  ERROR: .env.local not found!"
    exit 1
fi

# Backup original
cp "$FRONTEND_PATH/.env.local" "$FRONTEND_PATH/.env.local.backup"
echo "  ✓ Backed up to .env.local.backup"

# Ensure UPLOADS_DIR is set
if grep -q "^UPLOADS_DIR=" "$FRONTEND_PATH/.env.local"; then
    echo "  ✓ UPLOADS_DIR already set"
    grep "^UPLOADS_DIR=" "$FRONTEND_PATH/.env.local"
else
    echo "  Adding UPLOADS_DIR..."
    echo "UPLOADS_DIR=$UPLOADS_DIR" >> "$FRONTEND_PATH/.env.local"
fi

# Verify credentials
echo "  Database credentials:"
grep -E "^MYSQL_" "$FRONTEND_PATH/.env.local" || echo "    ERROR: MySQL config missing"
echo ""

# ============ STEP 3: Stop old Node process ============
echo "[3/5] Stopping existing Node process..."
if pgrep -f "node.*server.js" > /dev/null; then
    pkill -f "node.*server.js" || true
    sleep 2
    echo "  ✓ Stopped"
else
    echo "  (No process running)"
fi
echo ""

# ============ STEP 4: Rebuild ============
echo "[4/5] Rebuilding application..."
cd "$FRONTEND_PATH"

echo "  Installing dependencies..."
npm install --silent 2>&1 | tail -3

echo "  Building..."
npm run build 2>&1 | grep -E "✓|✗|error|ERROR" | tail -5

if [ ! -f ".next/standalone/server.js" ]; then
    echo "  ERROR: Build failed - server.js not created"
    exit 1
fi
echo "  ✓ Build successful"
echo ""

# ============ STEP 5: Start server ============
echo "[5/5] Starting Node.js server..."
cd "$FRONTEND_PATH"

nohup node server.js > app.log 2>&1 &
SERVER_PID=$!
sleep 2

if ps -p $SERVER_PID > /dev/null 2>&1; then
    echo "  ✓ Server started (PID: $SERVER_PID)"
else
    echo "  ERROR: Server failed to start"
    echo "  Last 20 lines of log:"
    tail -20 app.log
    exit 1
fi
echo ""

# ============ Verification ============
echo "======================================"
echo "✓ Recovery Complete!"
echo "======================================"
echo ""
echo "Next steps:"
echo "1. Clear browser cache: Ctrl+Shift+Delete"
echo "2. Refresh: https://pcolour.com"
echo "3. Test upload in admin panel"
echo ""
echo "Troubleshooting:"
echo "  View logs:     tail -f $FRONTEND_PATH/app.log"
echo "  Check process: ps aux | grep node"
echo "  Check files:   ls -la $UPLOADS_DIR"
echo ""
