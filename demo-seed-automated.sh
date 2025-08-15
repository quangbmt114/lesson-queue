#!/bin/bash

echo "🚀 Automated Demo với Seed Data"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "${BLUE}🔍 Checking prerequisites...${NC}"

if ! command_exists docker; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    exit 1
fi

if ! command_exists node; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi

if ! command_exists yarn; then
    echo -e "${RED}❌ Yarn is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"

# Start services
echo -e "${BLUE}🐳 Starting services...${NC}"

# Check if containers are already running
if ! docker ps -q -f name=postgres-lesson-queue | grep -q .; then
    echo -e "${YELLOW}🐘 Starting PostgreSQL...${NC}"
    docker run -d \
        --name postgres-lesson-queue \
        -e POSTGRES_DB=lesson_queue \
        -e POSTGRES_USER=postgres \
        -e POSTGRES_PASSWORD=password \
        -p 5432:5432 \
        postgres:15
    
    echo -e "${GREEN}✅ PostgreSQL started${NC}"
    
    # Wait for PostgreSQL to be ready
    echo -e "${YELLOW}⏳ Waiting for PostgreSQL to be ready...${NC}"
    sleep 15
else
    echo -e "${YELLOW}⚠️  PostgreSQL is already running${NC}"
fi

if ! docker ps -q -f name=redis-lesson-queue | grep -q .; then
    echo -e "${YELLOW}🔴 Starting Redis...${NC}"
    docker run -d \
        --name redis-lesson-queue \
        -p 6379:6379 \
        redis:alpine
    
    echo -e "${GREEN}✅ Redis started${NC}"
    
    # Wait for Redis to be ready
    echo -e "${YELLOW}⏳ Waiting for Redis to be ready...${NC}"
    sleep 5
else
    echo -e "${YELLOW}⚠️  Redis is already running${NC}"
fi

# Setup database
echo -e "${BLUE}🗄️  Setting up database...${NC}"

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}📝 Creating .env file...${NC}"
    cat > .env << EOF
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/lesson_queue?schema=public"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# App
PORT=3000
NODE_ENV=development
EOF
    echo -e "${GREEN}✅ .env file created${NC}"
else
    echo -e "${YELLOW}⚠️  .env file already exists${NC}"
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    yarn install
    echo -e "${GREEN}✅ Dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠️  Dependencies already installed${NC}"
fi

# Generate Prisma client
echo -e "${YELLOW}🔧 Generating Prisma client...${NC}"
npx prisma generate

# Push database schema
echo -e "${YELLOW}🗄️  Pushing database schema...${NC}"
npx prisma db push

# Test database connection
echo -e "${YELLOW}🔍 Testing database connection...${NC}"
if node test-database.js > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Database connection successful${NC}"
else
    echo -e "${RED}❌ Database connection failed${NC}"
    echo -e "${YELLOW}💡 Please check if PostgreSQL is running and accessible${NC}"
    exit 1
fi

# Run seed data
echo -e "${BLUE}🌱 Running seed data...${NC}"
if yarn seed > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Seed data created successfully${NC}"
else
    echo -e "${RED}❌ Seed data creation failed${NC}"
    exit 1
fi

# Test queue system
echo -e "${BLUE}🔍 Testing queue system...${NC}"
if node test-queue.js > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Queue system working${NC}"
else
    echo -e "${RED}❌ Queue system failed${NC}"
    echo -e "${YELLOW}💡 Please check if Redis is running and accessible${NC}"
    exit 1
fi

# Display seed data summary
echo -e "${BLUE}📊 Seed Data Summary:${NC}"
echo "========================"
echo -e "${GREEN}👥 Users: 6${NC}"
echo "   - 2 Shop Owners"
echo "   - 3 Customers"
echo "   - 1 Admin"
echo -e "${GREEN}🏪 Shops: 2${NC}"
echo "   - Tech Store"
echo "   - Fashion Store"
echo -e "${GREEN}📦 Products: 5${NC}"
echo "   - 3 Tech products"
echo "   - 2 Fashion products"
echo -e "${GREEN}🔔 Subscriptions: 5${NC}"
echo -e "${GREEN}📧 Notifications: 5 (sample)${NC}"

echo ""
echo -e "${GREEN}🎉 System is ready for demo!${NC}"
echo ""

# Check if application is running
echo -e "${BLUE}🔍 Checking application status...${NC}"
if curl -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✅ Application is already running${NC}"
else
    echo -e "${YELLOW}⚠️  Application is not running${NC}"
    echo -e "${YELLOW}💡 Please start the application in a new terminal:${NC}"
    echo -e "${GREEN}   yarn start:dev${NC}"
fi

echo ""
echo -e "${BLUE}📋 Demo Instructions:${NC}"
echo "========================"
echo "1. Open GraphQL Playground: http://localhost:3000/graphql"
echo "2. Use the queries from demo-with-seed.md"
echo "3. Test creating new products to trigger notifications"
echo "4. Watch the logs in your application terminal"
echo "5. Monitor Redis queue with: docker exec redis-lesson-queue redis-cli"
echo ""

echo -e "${BLUE}🚀 Quick Test Commands:${NC}"
echo "========================"
echo -e "• Test database: ${GREEN}node test-database.js${NC}"
echo -e "• Test queue: ${GREEN}node test-queue.js${NC}"
echo -e "• Monitor Redis: ${GREEN}docker exec redis-lesson-queue redis-cli${NC}"
echo -e "• View logs: ${GREEN}docker logs redis-lesson-queue${NC}"
echo -e "• Open Prisma Studio: ${GREEN}yarn db:studio${NC}"
echo ""

echo -e "${BLUE}🎯 Demo Scenarios:${NC}"
echo "========================"
echo "1. Add new product to Tech Store → 3 notifications sent"
echo "2. Add new product to Fashion Store → 2 notifications sent"
echo "3. Create new shop and owner"
echo "4. Subscribe customer to new shop"
echo "5. Monitor queue activity and logs"
echo ""

echo -e "${BLUE}📚 Documentation:${NC}"
echo "========================"
echo -e "• ${GREEN}demo-with-seed.md${NC} - Demo instructions with seed data"
echo -e "• ${GREEN}QUEUE_QUICK_START.md${NC} - Quick start guide"
echo -e "• ${GREEN}QUEUE_GUIDE.md${NC} - Detailed queue guide"
echo -e "• ${GREEN}README.md${NC} - Project overview"
echo ""

echo -e "${GREEN}🎉 Happy Demo! 🚀${NC}"
echo ""
echo -e "${YELLOW}💡 Tip: Keep this terminal open to monitor system status${NC}"
echo -e "${YELLOW}💡 Tip: Use 'docker-compose logs -f' to monitor all services${NC}" 