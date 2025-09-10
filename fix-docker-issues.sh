#!/bin/bash

echo "🔧 修復 Docker 啟動問題..."

echo "📦 安裝 tsx 依賴到根目錄..."
npm install tsx --save-dev

echo "📦 安裝所有工作區依賴..."
npm install

echo "🐳 重新建置並啟動 Docker 容器..."
docker compose -f preview.compose.yaml up --build

echo "✅ 修復完成！"
