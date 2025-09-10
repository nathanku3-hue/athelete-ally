#!/bin/bash

echo "🏗️  測試多階段構建..."

echo "📦 安裝依賴..."
npm install

echo "🔨 構建 planning-engine..."
docker build -t athelete-ally-planning-engine:latest ./services/planning-engine/

echo "🔨 構建 gateway-bff..."
docker build -t athelete-ally-gateway-bff:latest ./apps/gateway-bff/

echo "🔨 構建 profile-onboarding..."
docker build -t athelete-ally-profile-onboarding:latest ./services/profile-onboarding/

echo "📊 檢查鏡像大小..."
echo "=== Docker 鏡像大小 ==="
docker images | grep athelete-ally

echo "🚀 啟動所有服務..."
docker compose -f preview.compose.yaml up --build

echo "✅ 多階段構建測試完成！"
