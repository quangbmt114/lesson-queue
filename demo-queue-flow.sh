#!/bin/bash

echo "🚀 Demo Queue System Flow"
echo "=========================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Redis is running
echo -e "${BLUE}🔍 Checking Redis connection...${NC}"
if docker exec redis-lesson-queue redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Redis is running${NC}"
else
    echo -e "${RED}❌ Redis is not running${NC}"
    echo -e "${YELLOW}💡 Starting Redis...${NC}"
    docker run -d --name redis-lesson-queue -p 6379:6379 redis:alpine
    sleep 5
fi

# Check if PostgreSQL is running
echo -e "${BLUE}🔍 Checking PostgreSQL connection...${NC}"
if docker exec postgres-lesson-queue pg_isready -U postgres > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PostgreSQL is running${NC}"
else
    echo -e "${RED}❌ PostgreSQL is not running${NC}"
    echo -e "${YELLOW}💡 Starting PostgreSQL...${NC}"
    docker run -d \
        --name postgres-lesson-queue \
        -e POSTGRES_DB=lesson_queue \
        -e POSTGRES_USER=postgres \
        -e POSTGRES_PASSWORD=password \
        -p 5432:5432 \
        postgres:15
    sleep 10
fi

# Check if application is running
echo -e "${BLUE}🔍 Checking application...${NC}"
if curl -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✅ Application is running${NC}"
else
    echo -e "${YELLOW}⚠️  Application is not running${NC}"
    echo -e "${YELLOW}💡 Please start the application with: yarn start:dev${NC}"
    echo ""
    echo -e "${BLUE}📋 Manual Steps:${NC}"
    echo "1. Open new terminal"
    echo "2. Run: yarn start:dev"
    echo "3. Wait for application to start"
    echo "4. Come back to this terminal and press Enter to continue"
    read -p "Press Enter when application is running..."
fi

# Test database connection
echo -e "${BLUE}🔍 Testing database connection...${NC}"
if node test-database.js > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Database connection successful${NC}"
else
    echo -e "${RED}❌ Database connection failed${NC}"
    echo -e "${YELLOW}💡 Setting up database...${NC}"
    npx prisma db push
fi

# Test queue system
echo -e "${BLUE}🔍 Testing queue system...${NC}"
if node test-queue.js > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Queue system working${NC}"
else
    echo -e "${RED}❌ Queue system failed${NC}"
    echo -e "${YELLOW}💡 Please check Redis connection${NC}"
fi

echo ""
echo -e "${GREEN}🎉 System is ready for demo!${NC}"
echo ""
echo -e "${BLUE}📋 Demo Flow:${NC}"
echo "1. Open GraphQL Playground: http://localhost:3000/graphql"
echo "2. Follow the steps in QUEUE_GUIDE.md"
echo "3. Watch the logs in your application terminal"
echo "4. Monitor Redis queue with: docker exec redis-lesson-queue redis-cli"
echo ""
echo -e "${YELLOW}🚀 Quick Test Commands:${NC}"
echo "• Test database: node test-database.js"
echo "• Test queue: node test-queue.js"
echo "• Monitor Redis: docker exec redis-lesson-queue redis-cli"
echo "• View logs: docker logs redis-lesson-queue"
echo ""
echo -e "${GREEN}Happy Demo! 🎯${NC}" 