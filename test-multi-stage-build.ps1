# 測試多階段構建
Write-Host "🏗️  測試多階段構建..." -ForegroundColor Green

Write-Host "📦 安裝依賴..." -ForegroundColor Yellow
npm install

Write-Host "🔨 構建 planning-engine..." -ForegroundColor Yellow
docker build -t athelete-ally-planning-engine:latest ./services/planning-engine/

Write-Host "🔨 構建 gateway-bff..." -ForegroundColor Yellow
docker build -t athelete-ally-gateway-bff:latest ./apps/gateway-bff/

Write-Host "🔨 構建 profile-onboarding..." -ForegroundColor Yellow
docker build -t athelete-ally-profile-onboarding:latest ./services/profile-onboarding/

Write-Host "📊 檢查鏡像大小..." -ForegroundColor Yellow
Write-Host "=== Docker 鏡像大小 ===" -ForegroundColor Cyan
docker images | Select-String "athelete-ally"

Write-Host "🚀 啟動所有服務..." -ForegroundColor Yellow
docker compose -f preview.compose.yaml up --build

Write-Host "✅ 多階段構建測試完成！" -ForegroundColor Green
