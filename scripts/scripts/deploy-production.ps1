# Phase 2 ?????? (Windows PowerShell)
# ???????????

param(
    [switch]$SkipTests,
    [switch]$SkipBuild,
    [switch]$Help
)

if ($Help) {
    Write-Host "Phase 2 ??????" -ForegroundColor Green
    Write-Host "??: .\deploy-production.ps1 [-SkipTests] [-SkipBuild] [-Help]" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "??:" -ForegroundColor Cyan
    Write-Host "  -SkipTests    ??????" -ForegroundColor White
    Write-Host "  -SkipBuild    ??Docker??" -ForegroundColor White
    Write-Host "  -Help         ???????" -ForegroundColor White
    exit 0
}

# ??????
$ErrorActionPreference = "Stop"

# ????
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"
$Cyan = "Cyan"

# ????
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor $Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Red
}

# ??Docker????
function Test-Docker {
    Write-Info "??Docker??..."
    try {
        docker info | Out-Null
        Write-Success "Docker????"
    }
    catch {
        Write-Error "Docker???????Docker Desktop"
        exit 1
    }
}

# ????????
function Test-Ports {
    Write-Info "???????..."
    
    # ??????3000
    $port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
    if ($port3000) {
        Write-Warning "??3000?????????????..."
        try {
            docker stop frontend 2>$null
            docker rm frontend 2>$null
        }
        catch {
            Write-Warning "????????????????"
        }
    }
    
    # ??????4102
    $port4102 = Get-NetTCPConnection -LocalPort 4102 -ErrorAction SilentlyContinue
    if ($port4102) {
        Write-Warning "??4102?????????????..."
        try {
            docker stop planning-engine 2>$null
            docker rm planning-engine 2>$null
        }
        catch {
            Write-Warning "????????????????"
        }
    }
    
    Write-Success "??????"
}

# ??????
function Build-Frontend {
    if ($SkipBuild) {
        Write-Info "??Docker??..."
        return
    }
    
    Write-Info "????Docker??..."
    try {
        docker build -t athlete-ally/frontend:latest -f Dockerfile .
        Write-Success "????????"
    }
    catch {
        Write-Error "????????: $_"
        exit 1
    }
}

# ??????
function Start-Frontend {
    Write-Info "??????..."
    try {
        docker run -d -p 3000:3000 --name frontend --restart unless-stopped athlete-ally/frontend:latest
        Write-Success "????????"
    }
    catch {
        Write-Error "????????: $_"
        exit 1
    }
}

# ??????
function Start-Backend {
    Write-Info "??????..."
    try {
        docker run -d -p 4102:4102 --name planning-engine --restart unless-stopped athlete-ally/planning-engine:simple
        Write-Success "????????"
    }
    catch {
        Write-Warning "?????????????..."
    }
}

# ??????
function Start-Monitoring {
    Write-Info "??????..."
    try {
        docker compose -f docker-compose/preview.yml up -d prometheus grafana postgres redis nats
        Write-Success "????????"
    }
    catch {
        Write-Warning "?????????????..."
    }
}

# ????
function Test-Health {
    Write-Info "??????..."
    
    # ??????
    Start-Sleep -Seconds 10
    
    # ??????
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Success "??????????"
        }
    }
    catch {
        Write-Error "??????????: $_"
        return $false
    }
    
    # ??????
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:4102/health" -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Success "??????????"
        }
    }
    catch {
        Write-Error "??????????: $_"
        return $false
    }
    
    # ??????
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:9090/-/healthy" -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Success "??????????"
        }
    }
    catch {
        Write-Warning "???????????????????"
    }
    
    return $true
}

# ??????
function Show-Status {
    Write-Info "??????..."
    
    Write-Host ""
    Write-Host "?? ????:" -ForegroundColor $Cyan
    Write-Host "==================" -ForegroundColor $Cyan
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
    Write-Host ""
    Write-Host "?? ????:" -ForegroundColor $Cyan
    Write-Host "==================" -ForegroundColor $Cyan
    Write-Host "????: http://localhost:3000" -ForegroundColor $Green
    Write-Host "??API: http://localhost:4102" -ForegroundColor $Green
    Write-Host "API??: http://localhost:4102/docs" -ForegroundColor $Green
    Write-Host "????: http://localhost:9090" -ForegroundColor $Green
    Write-Host "Grafana: http://localhost:3001" -ForegroundColor $Green
    
    Write-Host ""
    Write-Host "?? ????:" -ForegroundColor $Cyan
    Write-Host "==================" -ForegroundColor $Cyan
    Write-Host "????: docker logs frontend" -ForegroundColor $Yellow
    Write-Host "????: docker stop frontend planning-engine" -ForegroundColor $Yellow
    Write-Host "????: docker restart frontend planning-engine" -ForegroundColor $Yellow
    Write-Host "????: docker ps" -ForegroundColor $Yellow
}

# ????
function Invoke-Tests {
    if ($SkipTests) {
        Write-Info "??????..."
        return
    }
    
    Write-Info "????????..."
    
    try {
        npm run test:api
        Write-Success "API????"
    }
    catch {
        Write-Warning "API??????????????"
    }
    
    try {
        npm run test:frontend
        Write-Success "??????"
    }
    catch {
        Write-Warning "????????????????"
    }
}

# ???
function Main {
    Write-Host "?? Phase 2 ??????" -ForegroundColor $Green
    Write-Host "========================" -ForegroundColor $Green
    
    Test-Docker
    Test-Ports
    Build-Frontend
    Start-Frontend
    Start-Backend
    Start-Monitoring
    
    if (Test-Health) {
        Write-Success "??????????"
    }
    else {
        Write-Warning "????????????????"
    }
    
    Invoke-Tests
    Show-Status
    
    Write-Host ""
    Write-Success "?? Phase 2 ???????"
    Write-Host ""
    Write-Host "?????????????" -ForegroundColor $Green
    Write-Host "??????????????????" -ForegroundColor $Yellow
}

# ?????
Main









