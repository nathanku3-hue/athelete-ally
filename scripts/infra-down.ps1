# ?????????? (PowerShell??)
# ??Windows??????
#
# ??:
# - ????? PostgreSQL, Redis, NATS ??
# - ???????????
#
# ????:
#   npm run infra:down
#   ?
#   powershell -ExecutionPolicy Bypass -File ./scripts/infra-down.ps1

Write-Host "?? Stopping infrastructure services..." -ForegroundColor Yellow

try {
    docker compose -f ./preview.compose.yaml down -v --remove-orphans
    if ($LASTEXITCODE -eq 0) {
        Write-Host "? Infrastructure services stopped" -ForegroundColor Green
    } else {
        Write-Host "? Failed to stop services" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "? Error stopping services: $_" -ForegroundColor Red
    exit 1
}

