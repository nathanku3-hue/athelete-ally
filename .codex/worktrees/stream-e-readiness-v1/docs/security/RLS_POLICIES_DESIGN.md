# PostgreSQL 行级安全(RLS)策略设计

## 🎯 目标
设计并实现多租户、细粒度权限控制的PostgreSQL行级安全策略，确保数据隔离和访问控制。

## 📋 策略概览

### 核心原则
1. **多租户隔离**: 每个租户只能访问自己的数据
2. **用户权限控制**: 基于角色的细粒度权限管理
3. **数据分类保护**: 根据数据敏感级别进行访问控制
4. **审计追踪**: 所有访问操作可追踪

---

## 🔐 1. 租户隔离策略

### 1.1 启用RLS
```sql
-- 为所有表启用行级安全
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE block_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE block_progressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocol_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocol_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE block_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocol_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocol_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocol_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
```

### 1.2 租户隔离策略
```sql
-- 租户表策略：只有系统管理员可以访问
CREATE POLICY tenant_isolation ON tenants
    FOR ALL TO authenticated
    USING (
        -- 系统管理员可以访问所有租户
        current_setting('app.user_role') = 'SYSTEM_ADMIN'
        OR
        -- 租户管理员可以访问自己的租户
        (current_setting('app.user_role') = 'TENANT_ADMIN' 
         AND id = current_setting('app.current_tenant_id'))
    );

-- 用户表策略：租户内隔离
CREATE POLICY user_tenant_isolation ON users
    FOR ALL TO authenticated
    USING (
        tenant_id = current_setting('app.current_tenant_id')
    );

-- 协议表策略：租户内隔离 + 权限控制
CREATE POLICY protocol_tenant_isolation ON protocols
    FOR ALL TO authenticated
    USING (
        tenant_id = current_setting('app.current_tenant_id')
        AND (
            -- 所有者可以完全访问
            owner_id = current_setting('app.current_user_id')
            OR
            -- 有权限的用户可以访问
            EXISTS (
                SELECT 1 FROM protocol_permissions pp
                WHERE pp.protocol_id = protocols.id
                AND pp.user_id = current_setting('app.current_user_id')
                AND pp.is_active = true
                AND (pp.expires_at IS NULL OR pp.expires_at > NOW())
            )
            OR
            -- 公开协议所有租户用户都可以查看
            (visibility = 'PUBLIC' AND is_public = true)
        )
    );
```

---

## 🔑 2. 权限控制策略

### 2.1 协议权限策略
```sql
-- 协议权限表策略
CREATE POLICY protocol_permission_control ON protocol_permissions
    FOR ALL TO authenticated
    USING (
        -- 只能管理自己租户的权限
        protocol_id IN (
            SELECT id FROM protocols 
            WHERE tenant_id = current_setting('app.current_tenant_id')
        )
        AND (
            -- 协议所有者可以管理权限
            protocol_id IN (
                SELECT id FROM protocols 
                WHERE owner_id = current_setting('app.current_user_id')
            )
            OR
            -- 有管理权限的用户可以管理权限
            EXISTS (
                SELECT 1 FROM protocol_permissions pp
                WHERE pp.protocol_id = protocol_permissions.protocol_id
                AND pp.user_id = current_setting('app.current_user_id')
                AND 'SHARE' = ANY(pp.permissions)
                AND pp.is_active = true
            )
        )
    );
```

### 2.2 执行数据权限策略
```sql
-- 协议执行策略：用户只能访问自己的执行数据
CREATE POLICY protocol_execution_user_isolation ON protocol_executions
    FOR ALL TO authenticated
    USING (
        tenant_id = current_setting('app.current_tenant_id')
        AND (
            -- 用户只能访问自己的执行数据
            user_id = current_setting('app.current_user_id')
            OR
            -- 协议所有者可以查看所有执行数据
            protocol_id IN (
                SELECT id FROM protocols 
                WHERE owner_id = current_setting('app.current_user_id')
            )
            OR
            -- 有分析权限的用户可以查看执行数据
            EXISTS (
                SELECT 1 FROM protocol_permissions pp
                WHERE pp.protocol_id = protocol_executions.protocol_id
                AND pp.user_id = current_setting('app.current_user_id')
                AND 'ANALYTICS' = ANY(pp.permissions)
                AND pp.is_active = true
            )
        )
    );

-- 会话执行策略：继承协议执行权限
CREATE POLICY session_execution_inheritance ON session_executions
    FOR ALL TO authenticated
    USING (
        execution_id IN (
            SELECT id FROM protocol_executions
            WHERE tenant_id = current_setting('app.current_tenant_id')
            AND (
                user_id = current_setting('app.current_user_id')
                OR
                protocol_id IN (
                    SELECT id FROM protocols 
                    WHERE owner_id = current_setting('app.current_user_id')
                )
                OR
                EXISTS (
                    SELECT 1 FROM protocol_permissions pp
                    WHERE pp.protocol_id = protocol_executions.protocol_id
                    AND pp.user_id = current_setting('app.current_user_id')
                    AND 'ANALYTICS' = ANY(pp.permissions)
                    AND pp.is_active = true
                )
            )
        )
    );
```

---

## 🛡️ 3. 数据分类保护策略

### 3.1 敏感数据访问控制
```sql
-- 基于数据分类的访问控制
CREATE POLICY data_classification_protection ON protocol_executions
    FOR SELECT TO authenticated
    USING (
        tenant_id = current_setting('app.current_tenant_id')
        AND (
            -- 用户自己的数据
            user_id = current_setting('app.current_user_id')
            OR
            -- 根据数据分类和用户权限
            CASE data_classification
                WHEN 'PUBLIC' THEN true
                WHEN 'INTERNAL' THEN 
                    current_setting('app.user_role') IN ('TENANT_ADMIN', 'TENANT_USER')
                WHEN 'CONFIDENTIAL' THEN 
                    current_setting('app.user_role') = 'TENANT_ADMIN'
                    OR EXISTS (
                        SELECT 1 FROM protocol_permissions pp
                        WHERE pp.protocol_id = protocol_executions.protocol_id
                        AND pp.user_id = current_setting('app.current_user_id')
                        AND 'ANALYTICS' = ANY(pp.permissions)
                        AND pp.is_active = true
                    )
                WHEN 'PERSONAL' THEN 
                    user_id = current_setting('app.current_user_id')
                WHEN 'SENSITIVE' THEN 
                    user_id = current_setting('app.current_user_id')
                    AND current_setting('app.user_role') = 'TENANT_ADMIN'
                ELSE false
            END
        )
    );
```

---

## 📊 4. 审计日志策略

### 4.1 审计日志访问控制
```sql
-- 审计日志策略：只有管理员可以访问
CREATE POLICY audit_log_admin_only ON audit_logs
    FOR ALL TO authenticated
    USING (
        current_setting('app.user_role') IN ('SYSTEM_ADMIN', 'TENANT_ADMIN')
        AND (
            -- 系统管理员可以访问所有审计日志
            current_setting('app.user_role') = 'SYSTEM_ADMIN'
            OR
            -- 租户管理员只能访问自己租户的审计日志
            tenant_id = current_setting('app.current_tenant_id')
        )
    );
```

---

## 🔧 5. 辅助函数和触发器

### 5.1 权限检查函数
```sql
-- 检查用户是否有特定权限
CREATE OR REPLACE FUNCTION has_protocol_permission(
    p_protocol_id TEXT,
    p_user_id TEXT,
    p_permission TEXT
) RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM protocol_permissions pp
        WHERE pp.protocol_id = p_protocol_id
        AND pp.user_id = p_user_id
        AND p_permission = ANY(pp.permissions)
        AND pp.is_active = true
        AND (pp.expires_at IS NULL OR pp.expires_at > NOW())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 检查用户是否是协议所有者
CREATE OR REPLACE FUNCTION is_protocol_owner(
    p_protocol_id TEXT,
    p_user_id TEXT
) RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM protocols
        WHERE id = p_protocol_id
        AND owner_id = p_user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 5.2 审计日志触发器
```sql
-- 协议操作审计触发器
CREATE OR REPLACE FUNCTION audit_protocol_changes()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (
        action,
        resource_type,
        resource_id,
        user_id,
        tenant_id,
        details,
        result
    ) VALUES (
        CASE 
            WHEN TG_OP = 'INSERT' THEN 'CREATE'
            WHEN TG_OP = 'UPDATE' THEN 'UPDATE'
            WHEN TG_OP = 'DELETE' THEN 'DELETE'
        END,
        'PROTOCOL',
        COALESCE(NEW.id, OLD.id),
        current_setting('app.current_user_id'),
        current_setting('app.current_tenant_id'),
        jsonb_build_object(
            'old_data', CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
            'new_data', CASE WHEN TG_OP = 'INSERT' THEN to_jsonb(NEW) ELSE NULL END,
            'changes', CASE WHEN TG_OP = 'UPDATE' THEN to_jsonb(NEW) - to_jsonb(OLD) ELSE NULL END
        ),
        'SUCCESS'
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 为协议表创建审计触发器
CREATE TRIGGER protocol_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON protocols
    FOR EACH ROW EXECUTE FUNCTION audit_protocol_changes();
```

---

## 🚀 6. 性能优化

### 6.1 索引优化
```sql
-- 为RLS策略优化索引
CREATE INDEX CONCURRENTLY idx_protocols_tenant_owner 
ON protocols(tenant_id, owner_id) 
WHERE is_active = true;

CREATE INDEX CONCURRENTLY idx_protocol_permissions_user_active 
ON protocol_permissions(user_id, is_active, expires_at) 
WHERE is_active = true;

CREATE INDEX CONCURRENTLY idx_protocol_executions_tenant_user 
ON protocol_executions(tenant_id, user_id, status);

CREATE INDEX CONCURRENTLY idx_audit_logs_tenant_created 
ON audit_logs(tenant_id, created_at DESC);
```

### 6.2 查询优化
```sql
-- 创建物化视图用于权限检查
CREATE MATERIALIZED VIEW user_protocol_permissions AS
SELECT 
    pp.user_id,
    pp.protocol_id,
    pp.permissions,
    p.tenant_id,
    p.owner_id
FROM protocol_permissions pp
JOIN protocols p ON pp.protocol_id = p.id
WHERE pp.is_active = true
AND (pp.expires_at IS NULL OR pp.expires_at > NOW());

CREATE UNIQUE INDEX ON user_protocol_permissions(user_id, protocol_id);

-- 定期刷新物化视图
CREATE OR REPLACE FUNCTION refresh_permissions_view()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY user_protocol_permissions;
END;
$$ LANGUAGE plpgsql;
```

---

## 🔒 7. 安全配置

### 7.1 连接配置
```sql
-- 设置安全参数
ALTER DATABASE protocol_engine SET row_security = on;
ALTER DATABASE protocol_engine SET log_statement = 'all';
ALTER DATABASE protocol_engine SET log_min_duration_statement = 1000;

-- 创建安全角色
CREATE ROLE protocol_app_user;
CREATE ROLE protocol_admin;
CREATE ROLE protocol_audit;

-- 授予权限
GRANT USAGE ON SCHEMA public TO protocol_app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO protocol_app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO protocol_app_user;

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO protocol_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO protocol_admin;

GRANT SELECT ON audit_logs TO protocol_audit;
```

---

## 📋 8. 实施检查清单

### 8.1 部署前检查
- [ ] 所有表已启用RLS
- [ ] 权限策略已创建并测试
- [ ] 审计触发器已配置
- [ ] 性能索引已创建
- [ ] 安全角色已配置
- [ ] 连接参数已优化

### 8.2 测试验证
- [ ] 多租户隔离测试
- [ ] 权限控制测试
- [ ] 数据分类保护测试
- [ ] 审计日志功能测试
- [ ] 性能压力测试

---

## 🎯 总结

这套RLS策略设计提供了：

1. **完整的多租户隔离**
2. **细粒度的权限控制**
3. **数据分类保护**
4. **全面的审计追踪**
5. **性能优化支持**

通过实施这些策略，我们可以确保Protocol Engine在数据库层面具有企业级的安全性和可扩展性。
