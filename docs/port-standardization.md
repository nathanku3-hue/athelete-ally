# 端口配置标准化规范

## 服务端口分配

### 前端服务
- **Frontend (Next.js)**: 3000 (Dockerfile EXPOSE 3000)

### 后端服务
- **Gateway BFF**: 4000 (配置) / 8000 (Docker EXPOSE)
- **Profile Onboarding**: 4101 (配置) / 8001 (Docker EXPOSE)  
- **Planning Engine**: 4102 (配置) / 8002 (Docker EXPOSE)

### 基础设施服务
- **Redis**: 6379
- **PostgreSQL**: 5432
- **NATS**: 4222
- **Jaeger**: 16686

### 监控端口
- **Gateway BFF Metrics**: 9464
- **Planning Engine Metrics**: 9466

## 标准化要求

1. **配置端口**: 服务内部配置使用4xxx端口范围
2. **Docker EXPOSE**: 使用8xxx端口范围，避免冲突
3. **环境变量**: 所有端口必须通过环境变量配置
4. **文档同步**: Dockerfile EXPOSE 必须与配置端口一致

## 修复计划

1. 统一所有服务的端口配置
2. 更新Dockerfile EXPOSE端口
3. 确保环境变量覆盖机制
4. 更新docker-compose配置
