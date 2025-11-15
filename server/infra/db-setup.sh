#!/bin/bash

# Database Setup Script for MH26 Services
# This script helps set up PostgreSQL database for development/production

set -e

echo "🚀 MH26 Services Database Setup"
echo "================================"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL first."
    exit 1
fi

# Database configuration
DB_NAME="${DB_NAME:-mh26_services}"
DB_USER="${DB_USER:-mh26_user}"
DB_PASSWORD="${DB_PASSWORD:-mh26_password}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

echo ""
echo "Database Configuration:"
echo "  Name: $DB_NAME"
echo "  User: $DB_USER"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo ""

# Create database and user
echo "📦 Creating database and user..."

# Connect as postgres superuser to create database
sudo -u postgres psql <<EOF
-- Create user if not exists
DO \$\$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_user WHERE usename = '$DB_USER') THEN
      CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
   END IF;
END
\$\$;

-- Create database if not exists
SELECT 'CREATE DATABASE $DB_NAME OWNER $DB_USER'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB_NAME')\gexec

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
EOF

echo "✅ Database and user created successfully"
echo ""

# Update DATABASE_URL
DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME?schema=public"

echo "📝 Add this to your .env file:"
echo "DATABASE_URL=\"$DATABASE_URL\""
echo ""

echo "🎉 Database setup complete!"
echo ""
echo "Next steps:"
echo "1. Update your .env file with the DATABASE_URL above"
echo "2. Run: npm run generate"
echo "3. Run: npm run migrate:dev"
echo "4. Run: npm run seed"

