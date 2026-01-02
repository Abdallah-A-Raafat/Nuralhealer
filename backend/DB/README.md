# 🧠 NeuralHealer Database - Deployment Guide

## 📋 Prerequisites

- PostgreSQL 14+ installed
- Superuser access to PostgreSQL
- `psql` command-line tool available

## 🚀 Quick Start Deployment

### Option 1: Single Command Deployment

```bash
# Download the schema file and execute
psql -U postgres < neuralhealer_schema.sql
```

### Option 2: Step-by-Step Deployment

```bash
# 1. Connect to PostgreSQL as superuser
psql -U postgres

# 2. Create the database
CREATE DATABASE neuralhealer
    WITH 
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    TEMPLATE = template0;

# 3. Exit and reconnect to neuralhealer
\q
psql -U postgres -d neuralhealer

# 4. Run the schema file
\i neuralhealer_schema.sql
```

### Option 3: Docker Deployment

```bash
# Start PostgreSQL container
docker run -d \
  --name neuralhealer-db \
  -e POSTGRES_PASSWORD=your_secure_password \
  -e POSTGRES_DB=neuralhealer \
  -p 5432:5432 \
  -v neuralhealer-data:/var/lib/postgresql/data \
  postgres:16-alpine

# Wait for database to be ready
sleep 10

# Deploy schema
docker exec -i neuralhealer-db psql -U postgres -d neuralhealer < neuralhealer_schema.sql
```

## 🔧 Configuration

### Create Application User

```sql
-- Connect to neuralhealer database
\c neuralhealer

-- Create application role
CREATE ROLE neuralhealer_app WITH LOGIN PASSWORD 'your_app_password';

-- Grant permissions
GRANT CONNECT ON DATABASE neuralhealer TO neuralhealer_app;
GRANT USAGE ON SCHEMA public TO neuralhealer_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO neuralhealer_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO neuralhealer_app;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO neuralhealer_app;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO neuralhealer_app;

ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT USAGE, SELECT ON SEQUENCES TO neuralhealer_app;
```

### Connection String

```bash
# Production
postgresql://neuralhealer_app:your_app_password@localhost:5432/neuralhealer

# Development
postgresql://postgres:postgres@localhost:5432/neuralhealer

# Docker
postgresql://postgres:your_secure_password@localhost:5432/neuralhealer
```

## ✅ Verification

### Check Database Creation

```sql
-- List databases
\l neuralhealer

-- Check extensions
SELECT * FROM pg_extension;

-- Should show: uuid-ossp, pgcrypto
```

### Verify Tables

```sql
-- Count tables (should be 24)
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

-- List all tables
\dt

-- Expected tables:
-- users, doctor_profiles, patient_profiles, engagements,
-- doctor_patients, engagement_access_rules, engagement_messages,
-- ai_chat_sessions, ai_chat_messages, and more...
```

### Verify Sample Data

```sql
-- Check engagement rules (should have 5 rules)
SELECT rule_name, description FROM engagement_access_rules;

-- Check system settings (should have 6 settings)
SELECT setting_key, setting_value FROM system_settings;
```

### Test Functions

```sql
-- Test access control function
SELECT * FROM get_accessible_messages(
    'some-doctor-id'::uuid,
    'some-patient-id'::uuid
);

-- Test AI session access
SELECT * FROM get_accessible_ai_chat_sessions(
    'some-doctor-id'::uuid,
    'some-patient-id'::uuid
);
```

## 🧪 Load Test Data

```sql
-- Create test doctor
INSERT INTO users (email, password_hash, first_name, last_name) 
VALUES ('dr.smith@neuralhealer.com', crypt('password123', gen_salt('bf')), 'John', 'Smith')
RETURNING id;

-- Use the returned ID to create doctor profile
INSERT INTO doctor_profiles (user_id, title, specialities, experience_years, is_verified)
VALUES (
    '<user-id-from-above>',
    'MD, Psychiatry',
    '["Mental Health", "Cognitive Therapy"]'::jsonb,
    10,
    true
);

-- Create test patient
INSERT INTO users (email, password_hash, first_name, last_name)
VALUES ('patient@example.com', crypt('password123', gen_salt('bf')), 'Jane', 'Doe')
RETURNING id;

-- Create patient profile
INSERT INTO patient_profiles (user_id, date_of_birth, gender)
VALUES (
    '<user-id-from-above>',
    '1990-01-01',
    'Female'
);
```

## 🔒 Security Hardening

### Enable Row-Level Security (Optional)

```sql
-- Enable RLS on sensitive tables
ALTER TABLE patient_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies (example)
CREATE POLICY patient_own_profile ON patient_profiles
    FOR ALL
    TO neuralhealer_app
    USING (user_id = current_setting('app.current_user_id')::uuid);
```

### Audit Configuration

```sql
-- Enable auditing for critical tables
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_log (
        user_id,
        action,
        resource_type,
        resource_id,
        change_data
    ) VALUES (
        current_setting('app.current_user_id', true)::uuid,
        TG_OP,
        TG_TABLE_NAME,
        NEW.id::text,
        row_to_json(NEW)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to critical tables
CREATE TRIGGER audit_engagements
AFTER INSERT OR UPDATE OR DELETE ON engagements
FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
```

## 📊 Monitoring Queries

```sql
-- Check database size
SELECT pg_size_pretty(pg_database_size('neuralhealer'));

-- Check table sizes
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check active connections
SELECT COUNT(*) FROM pg_stat_activity WHERE datname = 'neuralhealer';

-- Check slow queries
SELECT 
    pid,
    now() - pg_stat_activity.query_start AS duration,
    query
FROM pg_stat_activity
WHERE datname = 'neuralhealer'
    AND state = 'active'
    AND now() - pg_stat_activity.query_start > interval '5 seconds';
```

## 🔄 Backup and Restore

### Backup

```bash
# Full backup
pg_dump -U postgres neuralhealer > neuralhealer_backup_$(date +%Y%m%d).sql

# Schema only
pg_dump -U postgres -s neuralhealer > neuralhealer_schema_only.sql

# Data only
pg_dump -U postgres -a neuralhealer > neuralhealer_data_only.sql

# Compressed backup
pg_dump -U postgres -Fc neuralhealer > neuralhealer_backup.dump
```

### Restore

```bash
# From SQL file
psql -U postgres neuralhealer < neuralhealer_backup.sql

# From compressed dump
pg_restore -U postgres -d neuralhealer neuralhealer_backup.dump
```

## 🐛 Troubleshooting

### Database doesn't exist
```sql
-- Recreate database
DROP DATABASE IF EXISTS neuralhealer;
CREATE DATABASE neuralhealer;
```

### Permission denied
```bash
# Grant superuser temporarily
ALTER USER neuralhealer_app WITH SUPERUSER;
# Run migrations
# Remove superuser
ALTER USER neuralhealer_app WITH NOSUPERUSER;
```

### Extensions not loading
```sql
-- Ensure in correct database
\c neuralhealer
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

## 📝 Migration Management

### Track schema version

```sql
-- Check current version
SELECT setting_value 
FROM system_settings 
WHERE setting_key = 'database_version';

-- Update version after migration
UPDATE system_settings 
SET setting_value = '"1.1.0"', updated_at = NOW()
WHERE setting_key = 'database_version';
```

## 🎯 Next Steps

1. **Deploy to Production**: Use environment-specific connection strings
2. **Setup Monitoring**: Configure pg_stat_statements for query analysis
3. **Configure Backups**: Set up automated daily backups
4. **Load Testing**: Test with realistic data volumes
5. **Security Audit**: Review and harden security policies
6. **API Integration**: Connect your backend application

---

## 📞 Support

For issues or questions about the NeuralHealer database schema:
- Review the schema comments and documentation
- Check trigger and function definitions
- Verify indexes are being used with EXPLAIN ANALYZE

**Database Version**: 1.0.0  
**Last Updated**: 2026-01-02