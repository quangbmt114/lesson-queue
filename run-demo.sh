#!/bin/bash

echo "🎯 Demo Message Queue System"
echo "============================"
echo ""

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo "✅ Loaded .env file"
else
    echo "⚠️  No .env file found, using default values"
fi

# Set default values
REDIS_HOST=${REDIS_HOST:-localhost}
REDIS_PORT=${REDIS_PORT:-6379}
REDIS_PASSWORD=${REDIS_PASSWORD:-}

echo "🔧 Environment Configuration:"
echo "- REDIS_HOST: $REDIS_HOST"
echo "- REDIS_PORT: $REDIS_PORT"
echo "- REDIS_PASSWORD: ${REDIS_PASSWORD:+***}"
echo ""

# Kiểm tra Redis bằng Node.js
echo "🔍 Kiểm tra Redis connection..."
if node test-redis-connection.js > /dev/null 2>&1; then
    echo "✅ Redis connected successfully"
else
    echo "❌ Redis connection failed"
    echo "💡 Kiểm tra REDIS_HOST, REDIS_PORT, REDIS_PASSWORD trong .env"
    exit 1
fi

# Kiểm tra database
echo "🔍 Kiểm tra database connection..."
if ! node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.\$queryRaw\`SELECT 1\`.then(() => {
    console.log('✅ Database connected');
    process.exit(0);
}).catch((err) => {
    console.log('❌ Database connection failed:', err.message);
    process.exit(1);
});
" > /dev/null 2>&1; then
    echo "❌ Không thể kết nối database"
    echo "💡 Hãy kiểm tra DATABASE_URL trong .env"
    exit 1
fi
echo "✅ Database connected"

echo ""
echo "🚀 Bắt đầu demo..."
echo ""

# Terminal 1: Chạy processor
echo "📡 Terminal 1: Chạy Queue Processor"
echo "Chạy: yarn demo:processor"
echo ""

# Terminal 2: Chạy demo
echo "📤 Terminal 2: Chạy Demo"
echo "Chạy: yarn demo:queue"
echo ""

# Terminal 3: Monitor Redis (tùy chọn)
echo "👀 Terminal 3: Monitor Redis (tùy chọn)"
if [ -n "$REDIS_PASSWORD" ]; then
    echo "Chạy: nc -zv $REDIS_HOST $REDIS_PORT"
    echo "Hoặc: node test-redis-connection.js"
else
    echo "Chạy: nc -zv $REDIS_HOST $REDIS_PORT"
    echo "Hoặc: node test-redis-connection.js"
fi
echo ""

echo "💡 Hướng dẫn:"
echo "1. Mở terminal mới và chạy: yarn demo:processor"
echo "2. Mở terminal khác và chạy: yarn demo:queue"
echo "3. Xem kết quả và monitor queue"
echo ""

echo "🎉 Demo sẵn sàng! Hãy mở các terminal và chạy theo hướng dẫn." 