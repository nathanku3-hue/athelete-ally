-- 数据库优化配置
-- PostgreSQL 性能优化脚本

-- 1. 连接池优化
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;

-- 2. 查询优化
ALTER SYSTEM SET random_page_cost = 1.1;
ALTER SYSTEM SET effective_io_concurrency = 200;
ALTER SYSTEM SET work_mem = '4MB';

-- 3. 创建索引优化
-- 训练计划表索引
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_plans_user_id ON plans(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_plans_created_at ON plans(created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_plans_status ON plans(status);

-- 微周期表索引
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_microcycles_plan_id ON microcycles(plan_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_microcycles_week_number ON microcycles(week_number);

-- 训练会话表索引
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sessions_microcycle_id ON sessions(microcycle_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sessions_day_of_week ON sessions(day_of_week);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sessions_session_type ON sessions(session_type);

-- 练习表索引
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_exercises_session_id ON exercises(session_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_exercises_exercise_name ON exercises(exercise_name);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_exercises_category ON exercises(category);

-- RPE反馈表索引
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_rpe_feedback_user_id ON rpe_feedback(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_rpe_feedback_session_id ON rpe_feedback(session_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_rpe_feedback_submitted_at ON rpe_feedback(submitted_at);

-- 性能指标表索引
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_performance_metrics_user_id ON performance_metrics(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_performance_metrics_metric_type ON performance_metrics(metric_type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_performance_metrics_recorded_at ON performance_metrics(recorded_at);

-- 4. 分区表优化（如果数据量大）
-- 按月份分区RPE反馈表
-- CREATE TABLE rpe_feedback_y2024m01 PARTITION OF rpe_feedback
-- FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- 5. 统计信息更新
ANALYZE plans;
ANALYZE microcycles;
ANALYZE sessions;
ANALYZE exercises;
ANALYZE rpe_feedback;
ANALYZE performance_metrics;

-- 6. 创建性能监控视图
CREATE OR REPLACE VIEW performance_summary AS
SELECT 
    p.user_id,
    COUNT(p.id) as total_plans,
    COUNT(CASE WHEN p.status = 'active' THEN 1 END) as active_plans,
    AVG(EXTRACT(EPOCH FROM (p.updated_at - p.created_at))/86400) as avg_plan_duration_days,
    COUNT(rf.id) as total_rpe_feedbacks,
    AVG(rf.rpe_score) as avg_rpe_score,
    COUNT(pm.id) as total_performance_metrics
FROM plans p
LEFT JOIN rpe_feedback rf ON p.user_id = rf.user_id
LEFT JOIN performance_metrics pm ON p.user_id = pm.user_id
GROUP BY p.user_id;

-- 7. 创建慢查询监控
CREATE OR REPLACE VIEW slow_queries AS
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows,
    100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
FROM pg_stat_statements
WHERE mean_time > 1000  -- 查询时间超过1秒
ORDER BY mean_time DESC;

-- 8. 创建数据库健康检查函数
CREATE OR REPLACE FUNCTION check_database_health()
RETURNS TABLE(
    metric_name text,
    metric_value numeric,
    status text
) AS $$
BEGIN
    -- 检查连接数
    RETURN QUERY
    SELECT 
        'active_connections'::text,
        (SELECT count(*) FROM pg_stat_activity)::numeric,
        CASE 
            WHEN (SELECT count(*) FROM pg_stat_activity) > 150 THEN 'warning'
            WHEN (SELECT count(*) FROM pg_stat_activity) > 180 THEN 'critical'
            ELSE 'ok'
        END::text;
    
    -- 检查缓存命中率
    RETURN QUERY
    SELECT 
        'cache_hit_ratio'::text,
        (SELECT round(100.0 * sum(blks_hit) / (sum(blks_hit) + sum(blks_read)), 2) 
         FROM pg_stat_database)::numeric,
        CASE 
            WHEN (SELECT round(100.0 * sum(blks_hit) / (sum(blks_hit) + sum(blks_read)), 2) 
                 FROM pg_stat_database) < 90 THEN 'warning'
            WHEN (SELECT round(100.0 * sum(blks_hit) / (sum(blks_hit) + sum(blks_read)), 2) 
                 FROM pg_stat_database) < 80 THEN 'critical'
            ELSE 'ok'
        END::text;
    
    -- 检查死锁数
    RETURN QUERY
    SELECT 
        'deadlocks'::text,
        (SELECT deadlocks FROM pg_stat_database WHERE datname = current_database())::numeric,
        CASE 
            WHEN (SELECT deadlocks FROM pg_stat_database WHERE datname = current_database()) > 10 THEN 'warning'
            WHEN (SELECT deadlocks FROM pg_stat_database WHERE datname = current_database()) > 50 THEN 'critical'
            ELSE 'ok'
        END::text;
END;
$$ LANGUAGE plpgsql;

-- 9. 创建自动清理任务
-- 删除30天前的旧RPE反馈数据
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
    DELETE FROM rpe_feedback 
    WHERE submitted_at < NOW() - INTERVAL '30 days';
    
    DELETE FROM performance_metrics 
    WHERE recorded_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- 10. 创建性能监控触发器
CREATE OR REPLACE FUNCTION log_slow_queries()
RETURNS trigger AS $$
BEGIN
    -- 记录慢查询到日志表
    INSERT INTO query_performance_log (query_text, execution_time, created_at)
    VALUES (current_query(), clock_timestamp() - statement_timestamp(), NOW());
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 创建查询性能日志表
CREATE TABLE IF NOT EXISTS query_performance_log (
    id SERIAL PRIMARY KEY,
    query_text TEXT,
    execution_time INTERVAL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 应用所有配置
SELECT pg_reload_conf();

-- 显示优化结果
SELECT 'Database optimization completed successfully' as status;

