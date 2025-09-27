# ???????????? (PowerShell??)
# ??Windows??????
#
# ??:
# - ?? Docker Compose ????
# - ???????? (5432, 6379, 4222)
# - ?? Docker ????
#
# ????:
#   npm run infra:status
#   ?
#   powershell -ExecutionPolicy Bypass -File ./scripts/infra-status.ps1

Write-Host "?? Infrastructure Service Status:" -ForegroundColor Yellow
docker compose -f ./preview.compose.yaml ps

Write-Host "`n?? Port Usage:" -ForegroundColor Yellow
try {
    $connections = Get-NetTCPConnection -LocalPort 5432,6379,4222 -ErrorAction SilentlyContinue
    if ($connections) {
        $connections | Select-Object LocalAddress,LocalPort,State | Format-Table
    } else {
        Write-Host "No ports in use" -ForegroundColor Green
    }
} catch {
    Write-Host "Could not check port usage: $_" -ForegroundColor Red
}

Write-Host "`n?? Docker System Info:" -ForegroundColor Yellow
docker system df

