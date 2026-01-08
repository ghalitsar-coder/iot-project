-- =====================================================
-- Database Performance Optimization - Add Indexes
-- Run this in Railway PostgreSQL Console
-- =====================================================

-- 1. Index for action_histories lookup (Most Critical!)
-- This query is called EVERY MINUTE by scheduler
CREATE INDEX IF NOT EXISTS idx_action_histories_device_trigger_status 
ON action_histories(device_type, trigger_source, status, start_time DESC)
WHERE deleted_at IS NULL;

-- 2. Index for device_statuses lookup
CREATE INDEX IF NOT EXISTS idx_device_statuses_type 
ON device_statuses(device_type);

-- 3. Index for pakan_schedules lookup (scheduler checks)
CREATE INDEX IF NOT EXISTS idx_pakan_schedules_day_time 
ON pakan_schedules(day_name, time, is_active);

-- 4. Index for uv_schedules lookup (scheduler checks)
CREATE INDEX IF NOT EXISTS idx_uv_schedules_day_active 
ON uv_schedules(day_name, is_active);

-- 5. Index for action_histories pagination/filtering (API queries)
CREATE INDEX IF NOT EXISTS idx_action_histories_filters 
ON action_histories(device_type, trigger_source, status, created_at DESC)
WHERE deleted_at IS NULL;

-- =====================================================
-- Verify Indexes Created
-- =====================================================
-- Run this to check if indexes were created successfully:
-- SELECT indexname, tablename FROM pg_indexes WHERE tablename IN ('action_histories', 'device_statuses', 'pakan_schedules', 'uv_schedules');

-- =====================================================
-- Expected Result After Running:
-- =====================================================
-- Before: SELECT FROM action_histories = 134,858ms (SLOW)
-- After:  SELECT FROM action_histories = 1-5ms (FAST!)
-- 
-- This will fix the 2-minute timeout issue on API endpoints.
