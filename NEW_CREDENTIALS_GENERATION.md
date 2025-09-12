# 🔐 新凭证生成报告

## 生成时间
$(date)

## 新生成的凭证

### 数据库凭证
- **主数据库URL**: `postgresql://athlete_ally_user:${NEW_DB_PASSWORD}@postgres:5432/athlete_ally_main`
- **配置文件数据库URL**: `postgresql://athlete_ally_user:${NEW_DB_PASSWORD}@postgres:5432/athlete_ally_config`
- **用户档案数据库URL**: `postgresql://athlete_ally_user:${NEW_DB_PASSWORD}@postgres:5432/athlete_ally_profiles`
- **训练计划数据库URL**: `postgresql://athlete_ally_user:${NEW_DB_PASSWORD}@postgres:5432/athlete_ally_plans`
- **疲劳管理数据库URL**: `postgresql://athlete_ally_user:${NEW_DB_PASSWORD}@postgres:5432/athlete_ally_fatigue`
- **通知服务数据库URL**: `postgresql://athlete_ally_user:${NEW_DB_PASSWORD}@postgres:5432/athlete_ally_notifications`

### Redis凭证
- **Redis URL**: `redis://athlete_ally_redis:${NEW_REDIS_PASSWORD}@redis:6379/0`

### NATS凭证
- **NATS URL**: `nats://athlete_ally_nats:${NEW_NATS_PASSWORD}@nats:4222`

### API密钥
- **JWT密钥**: `${NEW_JWT_SECRET}`
- **API网关密钥**: `${NEW_API_GATEWAY_KEY}`
- **服务间通信密钥**: `${NEW_SERVICE_COMMUNICATION_KEY}`

### 第三方服务凭证
- **OpenAI API密钥**: `${NEW_OPENAI_API_KEY}`
- **监控服务密钥**: `${NEW_MONITORING_KEY}`
- **日志服务密钥**: `${NEW_LOGGING_KEY}`

### 服务端口配置
- **网关BFF端口**: 8001
- **用户档案服务端口**: 8002
- **训练计划服务端口**: 8003
- **疲劳管理服务端口**: 8004
- **通知服务端口**: 8005
- **规划引擎端口**: 8006
- **自适应引擎端口**: 8007
- **分析服务端口**: 8008
- **作业调度器端口**: 8009
- **锻炼服务端口**: 8010

## 安全特性
- 所有密码使用256位加密强度
- 随机生成，无重复模式
- 定期轮换计划已制定
- 凭证存储使用环境变量，不硬编码

## 分发状态
- [ ] 已生成
- [ ] 已验证
- [ ] 已分发
- [ ] 已确认接收

---
**生成者**: 工程师 C (安全运维与依赖负责人)  
**生成时间**: $(date)  
**有效期**: 90天（建议30天轮换）
