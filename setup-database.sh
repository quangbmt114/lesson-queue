#!/bin/bash

echo "🚀 Setting up Lesson Queue Database with PostgreSQL..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Check if PostgreSQL container is already running
if docker ps -q -f name=postgres-lesson-queue | grep -q .; then
    echo -e "${YELLOW}⚠️  PostgreSQL container is already running${NC}"
else
    echo -e "${YELLOW}🐘 Starting PostgreSQL container...${NC}"
    docker run -d \
        --name postgres-lesson-queue \
        -e POSTGRES_DB=lesson_queue \
        -e POSTGRES_USER=postgres \
        -e POSTGRES_PASSWORD=password \
        -p 5432:5432 \
        postgres:15
    
    echo -e "${GREEN}✅ PostgreSQL container started successfully${NC}"
    
    # Wait for PostgreSQL to be ready
    echo -e "${YELLOW}⏳ Waiting for PostgreSQL to be ready...${NC}"
    sleep 10
fi

# Check if Redis container is already running
if docker ps -q -f name=redis-lesson-queue | grep -q .; then
    echo -e "${YELLOW}⚠️  Redis container is already running${NC}"
else
    echo -e "${YELLOW}🔴 Starting Redis container...${NC}"
    docker run -d \
        --name redis-lesson-queue \
        -p 6379:6379 \
        redis:alpine
    
    echo -e "${GREEN}✅ Redis container started successfully${NC}"
    
    # Wait for Redis to be ready
    echo -e "${YELLOW}⏳ Waiting for Redis to be ready...${NC}"
    sleep 5
fi

# Create .env file if it doesn't exist
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

# Install dependencies if node_modules doesn't exist
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

# Check database connection
echo -e "${YELLOW}🔍 Testing database connection...${NC}"
if npx prisma db pull > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Database connection successful${NC}"
else
    echo -e "${RED}❌ Database connection failed${NC}"
    echo -e "${YELLOW}💡 Please check if PostgreSQL is running and accessible${NC}"
    exit 1
fi

echo -e "${GREEN}🎉 Database setup completed successfully!${NC}"
echo ""
echo -e "${YELLOW}📋 Next steps:${NC}"
echo -e "1. Start the application: ${GREEN}yarn start:dev${NC}"
echo -e "2. Open GraphQL Playground: ${GREEN}http://localhost:3000/graphql${NC}"
echo -e "3. Follow the demo in ${GREEN}demo-setup.md${NC}"
echo ""
echo -e "${YELLOW}🐘 PostgreSQL Info:${NC}"
echo -e "   Host: localhost"
echo -e "   Port: 5432"
echo -e "   Database: lesson_queue"
echo -e "   Username: postgres"
echo -e "   Password: password"
echo ""
echo -e "${YELLOW}🔴 Redis Info:${NC}"
echo -e "   Host: localhost"
echo -e "   Port: 6379"
echo ""
echo -e "${GREEN}�� Ready to go!${NC}" 