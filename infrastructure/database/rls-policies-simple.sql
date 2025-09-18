-- 简化的 RLS 策略配置
-- 用于 Athlete Ally 平台数据隔离和权限控制

-- 启用 RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocol_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE block_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE microcycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 创建辅助函数
CREATE OR REPLACE FUNCTION current_user_id() RETURNS UUID AS $$
BEGIN
  RETURN COALESCE(
    current_setting('app.current_user_id', true)::UUID,
    '00000000-0000-0000-0000-000000000000'::UUID
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建权限检查函数
CREATE OR REPLACE FUNCTION has_permission(
  resource_type TEXT,
  resource_id UUID,
  permission TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  user_id UUID;
  is_owner BOOLEAN := FALSE;
  has_share_permission BOOLEAN := FALSE;
BEGIN
  user_id := current_user_id();
  
  -- 检查所有权
  CASE resource_type
    WHEN 'protocol' THEN
      SELECT EXISTS(
        SELECT 1 FROM protocols 
        WHERE id = resource_id AND user_id = user_id
      ) INTO is_owner;
    WHEN 'plan' THEN
      SELECT EXISTS(
        SELECT 1 FROM plans 
        WHERE id = resource_id AND user_id = user_id
      ) INTO is_owner;
    WHEN 'workout' THEN
      SELECT EXISTS(
        SELECT 1 FROM workout_sessions 
        WHERE id = resource_id AND user_id = user_id
      ) INTO is_owner;
    ELSE
      is_owner := FALSE;
  END CASE;
  
  -- 如果用户是所有者，拥有所有权限
  IF is_owner THEN
    RETURN TRUE;
  END IF;
  
  -- 检查分享权限
  SELECT EXISTS(
    SELECT 1 FROM protocol_shares 
    WHERE protocol_id = resource_id 
    AND shared_with = user_id 
    AND is_active = TRUE
    AND permission = ANY(permissions)
  ) INTO has_share_permission;
  
  RETURN has_share_permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 用户表策略
CREATE POLICY users_own_data ON users
  FOR ALL TO PUBLIC
  USING (id = current_user_id());

-- 用户档案策略
CREATE POLICY profiles_own_data ON profiles
  FOR ALL TO PUBLIC
  USING (user_id = current_user_id());

-- 协议表策略
CREATE POLICY protocols_own_data ON protocols
  FOR ALL TO PUBLIC
  USING (user_id = current_user_id());

-- 协议分享策略
CREATE POLICY protocol_shares_own_data ON protocol_shares
  FOR ALL TO PUBLIC
  USING (
    shared_by = current_user_id() OR 
    shared_with = current_user_id()
  );

-- 块表策略
CREATE POLICY blocks_own_data ON blocks
  FOR ALL TO PUBLIC
  USING (
    EXISTS (
      SELECT 1 FROM protocols 
      WHERE protocols.id = blocks.protocol_id 
      AND protocols.user_id = current_user_id()
    ) OR
    has_permission('protocol', protocol_id, 'read')
  );

-- 块会话策略
CREATE POLICY block_sessions_own_data ON block_sessions
  FOR ALL TO PUBLIC
  USING (
    EXISTS (
      SELECT 1 FROM blocks 
      JOIN protocols ON protocols.id = blocks.protocol_id
      WHERE blocks.id = block_sessions.block_id 
      AND protocols.user_id = current_user_id()
    ) OR
    has_permission('protocol', 
      (SELECT protocol_id FROM blocks WHERE id = block_sessions.block_id), 
      'read'
    )
  );

-- 训练计划策略
CREATE POLICY plans_own_data ON plans
  FOR ALL TO PUBLIC
  USING (user_id = current_user_id());

-- 微周期策略
CREATE POLICY microcycles_own_data ON microcycles
  FOR ALL TO PUBLIC
  USING (
    EXISTS (
      SELECT 1 FROM plans 
      WHERE plans.id = microcycles.plan_id 
      AND plans.user_id = current_user_id()
    )
  );

-- 训练会话策略
CREATE POLICY sessions_own_data ON sessions
  FOR ALL TO PUBLIC
  USING (
    EXISTS (
      SELECT 1 FROM microcycles 
      JOIN plans ON plans.id = microcycles.plan_id
      WHERE microcycles.id = sessions.microcycle_id 
      AND plans.user_id = current_user_id()
    )
  );

-- 训练记录策略
CREATE POLICY workout_sessions_own_data ON workout_sessions
  FOR ALL TO PUBLIC
  USING (user_id = current_user_id());

-- 训练动作策略
CREATE POLICY workout_exercises_own_data ON workout_exercises
  FOR ALL TO PUBLIC
  USING (
    EXISTS (
      SELECT 1 FROM workout_sessions 
      WHERE workout_sessions.id = workout_exercises.workout_session_id 
      AND workout_sessions.user_id = current_user_id()
    )
  );

-- 训练记录策略
CREATE POLICY workout_records_own_data ON workout_records
  FOR ALL TO PUBLIC
  USING (
    EXISTS (
      SELECT 1 FROM workout_exercises 
      JOIN workout_sessions ON workout_sessions.id = workout_exercises.workout_session_id
      WHERE workout_exercises.id = workout_records.workout_exercise_id 
      AND workout_sessions.user_id = current_user_id()
    )
  );

-- 个人记录策略
CREATE POLICY personal_records_own_data ON personal_records
  FOR ALL TO PUBLIC
  USING (user_id = current_user_id());

-- 用户摘要策略
CREATE POLICY user_summaries_own_data ON user_summaries
  FOR ALL TO PUBLIC
  USING (user_id = current_user_id());

-- 审计日志策略
CREATE POLICY audit_logs_own_data ON audit_logs
  FOR ALL TO PUBLIC
  USING (user_id = current_user_id());

-- 创建视图以简化权限检查
CREATE VIEW user_protocols AS
SELECT p.*, 
       CASE WHEN p.user_id = current_user_id() THEN 'owner' ELSE 'shared' END as access_type
FROM protocols p
WHERE p.user_id = current_user_id() 
   OR EXISTS (
     SELECT 1 FROM protocol_shares ps 
     WHERE ps.protocol_id = p.id 
     AND ps.shared_with = current_user_id() 
     AND ps.is_active = TRUE
   );

-- 创建公开协议视图
CREATE VIEW public_protocols AS
SELECT p.*, 
       'public' as access_type
FROM protocols p
WHERE p.is_public = TRUE;

-- 创建权限检查视图
CREATE VIEW user_permissions AS
SELECT 
  p.id as protocol_id,
  p.name as protocol_name,
  CASE 
    WHEN p.user_id = current_user_id() THEN 'owner'
    WHEN EXISTS (
      SELECT 1 FROM protocol_shares ps 
      WHERE ps.protocol_id = p.id 
      AND ps.shared_with = current_user_id() 
      AND ps.is_active = TRUE
    ) THEN 'shared'
    ELSE 'none'
  END as access_type,
  COALESCE(
    (SELECT ps.permissions FROM protocol_shares ps 
     WHERE ps.protocol_id = p.id 
     AND ps.shared_with = current_user_id() 
     AND ps.is_active = TRUE),
    CASE WHEN p.user_id = current_user_id() THEN ARRAY['read', 'write', 'execute', 'share'] ELSE ARRAY[]::TEXT[] END
  ) as permissions
FROM protocols p
WHERE p.user_id = current_user_id() 
   OR EXISTS (
     SELECT 1 FROM protocol_shares ps 
     WHERE ps.protocol_id = p.id 
     AND ps.shared_with = current_user_id() 
     AND ps.is_active = TRUE
   )
   OR p.is_public = TRUE;

-- 创建 RLS 状态检查函数
CREATE OR REPLACE FUNCTION check_rls_status()
RETURNS TABLE (
  table_name TEXT,
  rls_enabled BOOLEAN,
  policy_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.tablename::TEXT,
    t.rowsecurity,
    COUNT(p.policyname)::INTEGER
  FROM pg_tables t
  LEFT JOIN pg_policies p ON p.tablename = t.tablename AND p.schemaname = t.schemaname
  WHERE t.schemaname = 'public'
    AND t.tablename IN (
      'users', 'profiles', 'protocols', 'protocol_shares',
      'blocks', 'plans', 'workout_sessions'
    )
  GROUP BY t.tablename, t.rowsecurity
  ORDER BY t.tablename;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建测试数据
INSERT INTO users (id, email, name, created_at) VALUES 
  ('11111111-1111-1111-1111-111111111111', 'test1@example.com', 'Test User 1', NOW()),
  ('22222222-2222-2222-2222-222222222222', 'test2@example.com', 'Test User 2', NOW()),
  ('33333333-3333-3333-3333-333333333333', 'test3@example.com', 'Test User 3', NOW())
ON CONFLICT (id) DO NOTHING;

-- 创建测试协议
INSERT INTO protocols (id, user_id, name, description, is_public, created_at) VALUES 
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Test Protocol 1', 'Test protocol for user 1', FALSE, NOW()),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'Public Protocol', 'Public protocol for testing', TRUE, NOW()),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'Test Protocol 2', 'Test protocol for user 2', FALSE, NOW())
ON CONFLICT (id) DO NOTHING;

-- 创建测试分享
INSERT INTO protocol_shares (id, protocol_id, shared_by, shared_with, permissions, is_active, created_at) VALUES 
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', ARRAY['read', 'execute'], TRUE, NOW()),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', ARRAY['read'], TRUE, NOW())
ON CONFLICT (id) DO NOTHING;

-- 显示 RLS 状态
SELECT 'RLS 策略部署完成' as status;
SELECT * FROM check_rls_status();
