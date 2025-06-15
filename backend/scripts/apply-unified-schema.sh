#!/bin/bash

# Script to apply unified schema to database
# WARNING: This will DELETE ALL DATA

echo "=== Apply Unified Schema to Database ==="
echo "WARNING: This will DELETE ALL EXISTING DATA!"
echo ""

# Load environment variables
if [ -f ../../.env ]; then
    export $(cat ../../.env | grep -v '^#' | xargs)
else
    echo "Error: .env file not found"
    exit 1
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "Error: DATABASE_URL not set in .env"
    exit 1
fi

echo "Using database: $DATABASE_URL" | sed 's/:[^:]*@/:***@/'
echo ""
echo "This will:"
echo "1. Drop all existing tables (users, sessions, flavors, etc.)"
echo "2. Apply the unified schema with flavor_order column"
echo ""
read -p "Are you sure you want to continue? (yes/no): " -n 3 -r
echo ""

if [[ ! $REPLY =~ ^yes$ ]]; then
    echo "Operation cancelled"
    exit 1
fi

echo ""
echo "Applying schema..."

# Create combined SQL file
cat > /tmp/apply_unified_schema.sql << 'EOF'
-- Drop all existing tables
DROP TABLE IF EXISTS public.session_flavors CASCADE;
DROP TABLE IF EXISTS public.shisha_sessions CASCADE;
DROP TABLE IF EXISTS public.password_reset_tokens CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.cleanup_expired_tokens() CASCADE;

EOF

# Append the unified schema
cat ../migrations/20250615_unified_schema.sql >> /tmp/apply_unified_schema.sql

# Execute the migration
psql "$DATABASE_URL" -f /tmp/apply_unified_schema.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ Schema applied successfully!"
    echo ""
    echo "Database has been reset with the new schema including:"
    echo "- flavor_order column in session_flavors table"
    echo "- All other schema updates"
else
    echo ""
    echo "✗ Error applying schema"
    exit 1
fi

# Clean up
rm -f /tmp/apply_unified_schema.sql

echo ""
echo "=== Schema application complete! ==="