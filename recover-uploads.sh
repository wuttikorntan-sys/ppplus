#!/bin/bash
# Recovery script for PP Plus upload issues on Hostinger

set -e

echo "======================================"
echo "PP Plus Upload Recovery Script"
echo "======================================"
echo ""

# Detect frontend path - more robust
FRONTEND_PATH=""

# Try common paths first
POSSIBLE_PATHS=(
    "/home/u626866170/public_html/ppplus/frontend"
    "$HOME/public_html/ppplus/frontend"
    "$HOME/ppplus/frontend"
    "/var/www/html/ppplus/frontend"
)

for path in "${POSSIBLE_PATHS[@]}"; do
    if [ -d "$path" ] && [ -f "$path/package.json" ]; then
        FRONTEND_PATH="$path"
        break
    fi
done

# If still not found, search
if [ -z "$FRONTEND_PATH" ]; then
    echo "Searching for frontend directory..."
    FOUND=$(find $HOME -maxdepth 5 -name "package.json" -path "*/frontend/*" 2>/dev/null | head -1)
    if [ -n "$FOUND" ]; then
        FRONTEND_PATH=$(dirname "$FOUND")
    fi
fi

if [ -z "$FRONTEND_PATH" ] || [ ! -d "$FRONTEND_PATH" ]; then
    echo "ERROR: Could not find frontend directory"
    echo "Tried:"
    for path in "${POSSIBLE_PATHS[@]}"; do
        echo "  - $path"
    done
    echo ""
    echo "Manual fix:"
    echo "1. SSH to Hostinger"
    echo "2. Find your app: find ~ -name 'server.js' 2>/dev/null"
    echo "3. Note the path"
    echo "4. Run: bash recover-uploads.sh /your/path/to/frontend"
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
    echo "  Create it first with required values"
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
    echo "" >> "$FRONTEND_PATH/.env.local"
    echo "UPLOADS_DIR=$UPLOADS_DIR" >> "$FRONTEND_PATH/.env.local"
fi

# Verify credentials
echo "  Database credentials:"
grep -E "^MYSQL_" "$FRONTEND_PATH/.env.local" | head -3 || echo "    WARNING: MySQL config check failed"
echo ""

# ============ STEP 3: Stop old Node process ============
echo "[3/5] Stopping existing Node process..."
if pgrep -f "node.*server.js" > /dev/null 2>&1; then
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

echo "  Pulling latest code..."
git pull origin main 2>&1 | head -5

echo "  Installing dependencies..."
npm install > /dev/null 2>&1
echo "  ✓ Dependencies installed"

echo "  Building..."
npm run build > build.log 2>&1
if grep -q "✓ Compiled successfully" build.log; then
    echo "  ✓ Build successful"
else
    echo "  ERROR: Build failed"
    tail -20 build.log
    exit 1
fi

if [ ! -f ".next/standalone/server.js" ]; then
    echo "  ERROR: Build failed - server.js not created"
    tail -20 build.log
    exit 1
fi
echo ""

# ============ STEP 5: Start server ============
echo "[5/5] Starting Node.js server..."
cd "$FRONTEND_PATH"

nohup node server.js > app.log 2>&1 &
SERVER_PID=$!
sleep 3

if ps -p $SERVER_PID > /dev/null 2>&1; then
    echo "  ✓ Server started (PID: $SERVER_PID)"
else
    echo "  WARNING: Server may not have started"
    echo "  Checking logs..."
    tail -20 app.log
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
echo "  Database:      mysql -u u626866170_ppplus u626866170_ppplus -e 'SELECT COUNT(*) FROM hero_slides;'"
echo ""
