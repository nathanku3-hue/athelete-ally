#!/bin/bash

# Vault 部署脚本
# 用于部署生产级密钥管理基础设施

set -e

echo "🔐 开始部署 Vault 密钥管理系统..."

# 检查 Docker 是否运行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker 未运行，请先启动 Docker"
    exit 1
fi

# 创建必要的目录
echo "📁 创建 Vault 数据目录..."
mkdir -p ./data/vault
mkdir -p ./config/vault

# 设置权限
chmod 755 ./data/vault
chmod 755 ./config/vault

# 生成 Vault 根令牌
if [ -z "$VAULT_TOKEN" ]; then
    VAULT_TOKEN=$(openssl rand -base64 32)
    echo "🔑 生成 Vault 根令牌: $VAULT_TOKEN"
    echo "VAULT_TOKEN=$VAULT_TOKEN" > .env.vault
fi

# 更新配置文件中的令牌
sed -i "s/athlete-ally-root-token/$VAULT_TOKEN/g" docker-compose.vault.yml

# 停止现有容器
echo "🛑 停止现有 Vault 容器..."
docker-compose -f docker-compose.vault.yml down || true

# 启动 Vault 服务
echo "🐳 启动 Vault 服务..."
docker-compose -f docker-compose.vault.yml up -d

# 等待 Vault 启动
echo "⏳ 等待 Vault 启动..."
sleep 15

# 检查 Vault 健康状态
echo "🔍 检查 Vault 健康状态..."
if docker exec athlete-ally-vault vault status | grep -q "Sealed.*false"; then
    echo "✅ Vault 启动成功！"
else
    echo "❌ Vault 启动失败！"
    exit 1
fi

# 初始化 Vault（如果需要）
echo "🔧 初始化 Vault..."
docker exec athlete-ally-vault vault status | grep -q "Initialized.*true" || {
    echo "初始化 Vault..."
    docker exec athlete-ally-vault vault operator init -key-shares=5 -key-threshold=3 > vault-init.txt
    echo "Vault 初始化完成，请保存解封密钥"
}

# 显示连接信息
echo ""
echo "📋 Vault 连接信息："
echo "   URL: http://localhost:8200"
echo "   Token: $VAULT_TOKEN"
echo "   UI: http://localhost:8080"
echo ""

# 显示 Vault 状态
echo "📊 Vault 状态："
docker exec athlete-ally-vault vault status

echo ""
echo "🎉 Vault 部署完成！"
echo "💡 提示：请将 Vault 连接信息提供给工程师 A"
