# ELK Stack 配置

## 概述
ELK Stack (Elasticsearch, Logstash, Kibana, Filebeat) 提供完整的日志聚合、处理、存储和可视化解决方案。

## 快速启动

```bash
# 启动ELK Stack
docker compose up -d

# 检查服务状态
docker compose ps

# 查看日志
docker compose logs
```

## 服务访问
- **Elasticsearch**: http://localhost:9200
- **Kibana**: http://localhost:5601

## 配置说明

### Elasticsearch
- 版本: 8.11.0
- 模式: 单节点
- 内存: 2GB
- 安全: 已禁用 (开发环境)

### Kibana
- 版本: 8.11.0
- 数据源: Elasticsearch
- 仪表板: 预配置监控面板

### Logstash
- 版本: 8.11.0
- 端口: 5044 (Beats输入)
- 管道: 处理planning-engine和monitoring日志

### Filebeat
- 版本: 8.11.0
- 收集路径:
  - `/var/log/planning-engine/*.log`
  - `/var/log/monitoring/*.log`

## 日志索引
- `planning-engine-*`: 训练计划相关日志
- `monitoring-*`: 系统监控日志

## 故障排除
```bash
# 重启服务
docker compose restart

# 清理数据
docker compose down -v

# 查看特定服务日志
docker compose logs elasticsearch
```
