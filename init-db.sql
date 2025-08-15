-- Initialize Lesson Queue Database
-- This file will be executed when PostgreSQL container starts

-- Create database if not exists (this will be done by environment variable)
-- CREATE DATABASE lesson_queue;

-- Connect to the lesson_queue database
\c lesson_queue;

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types and enums (Prisma will handle this)
-- UserRole enum will be created by Prisma

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE lesson_queue TO postgres;

-- Create a read-only user for monitoring (optional)
-- CREATE USER monitor_user WITH PASSWORD 'monitor_password';
-- GRANT CONNECT ON DATABASE lesson_queue TO monitor_user;
-- GRANT USAGE ON SCHEMA public TO monitor_user;

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE 'Lesson Queue Database initialized successfully!';
    RAISE NOTICE 'Database: %', current_database();
    RAISE NOTICE 'User: %', current_user;
    RAISE NOTICE 'Schema: %', current_schema();
END $$; 