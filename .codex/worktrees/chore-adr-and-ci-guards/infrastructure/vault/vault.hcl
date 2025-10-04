# Vault 配置文件
# 用于 Athlete Ally 平台密钥管理

# 存储后端配置
storage "file" {
  path = "/vault/data"
}

# 监听器配置
listener "tcp" {
  address = "0.0.0.0:8200"
  tls_disable = true
}

# API 地址
api_addr = "http://0.0.0.0:8200"
cluster_addr = "http://0.0.0.0:8200"

# 禁用集群
disable_clustering = true

# 禁用性能监控
disable_performance_standby = true

# 禁用内存锁定
disable_mlock = true

# 日志级别
log_level = "INFO"

# 默认租约时间
default_lease_ttl = "168h"
max_lease_ttl = "720h"

# 启用 UI
ui = true

# 启用原始存储端点
raw_storage_endpoint = true
