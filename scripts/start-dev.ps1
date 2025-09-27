# ?? Athlete Ally ???????? (PowerShell??)
# ??: ????
# ??: 1.0.0

param(
    [switch]$SkipChecks,
    [switch]$BuildOnly
)

# ??????
$ErrorActionPreference = "Stop"

Write-Host "????? ?? Athlete Ally ????..." -ForegroundColor Blue
Write-Host "==================================" -ForegroundColor Blue

# ??Node??
Write-Host "?? ??????..." -ForegroundColor Blue
try {
    $nodeVersion = node --version
    Write-Host "? Node.js ??: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "? Node.js ???" -ForegroundColor Red
    exit 1
}

# ??Docker
try {
    docker --version | Out-Null
    docker-compose --version | Out-Null
    Write-Host "? Docker ????" -ForegroundColor Green
} catch {
    Write-Host "? Docker ? Docker Compose ???" -ForegroundColor Red
    exit 1
}

# 1. ??????
if (-not $SkipChecks) {
    Write-Host "?? ??????..." -ForegroundColor Blue
    try {
        npm run check-ports
    } catch {
        Write-Host "??  ???????????..." -ForegroundColor Yellow
    }
}

# 2. ????
Write-Host "?? ??????..." -ForegroundColor Blue
npm install

# 3. ????????
Write-Host "?? ????????..." -ForegroundColor Blue
docker-compose -f docker-compose/preview.yml up -d postgres redis nats

# 4. ????????
Write-Host "? ????????..." -ForegroundColor Blue
Start-Sleep -Seconds 15

# ??PostgreSQL??
Write-Host "?? ???????..." -ForegroundColor Blue
$maxRetries = 30
$retryCount = 0
do {
    try {
        docker-compose -f docker-compose/preview.yml exec postgres pg_isready -U athlete -d athlete | Out-Null
        Write-Host "? PostgreSQL ??" -ForegroundColor Green
        break
    } catch {
        $retryCount++
        if ($retryCount -ge $maxRetries) {
            Write-Host "? PostgreSQL ????" -ForegroundColor Red
            exit 1
        }
        Write-Host "? ??PostgreSQL??... ($retryCount/$maxRetries)" -ForegroundColor Yellow
        Start-Sleep -Seconds 2
    }
} while ($retryCount -lt $maxRetries)

# ??Redis??
Write-Host "?? ??Redis??..." -ForegroundColor Blue
$retryCount = 0
do {
    try {
        docker-compose -f docker-compose/preview.yml exec redis redis-cli ping | Out-Null
        Write-Host "? Redis ??" -ForegroundColor Green
        break
    } catch {
        $retryCount++
        if ($retryCount -ge $maxRetries) {
            Write-Host "? Redis ????" -ForegroundColor Red
            exit 1
        }
        Write-Host "? ??Redis??... ($retryCount/$maxRetries)" -ForegroundColor Yellow
        Start-Sleep -Seconds 2
    }
} while ($retryCount -lt $maxRetries)

# 5. ??Prisma???
Write-Host "?? ??Prisma???..." -ForegroundColor Blue
try {
    npm run db:generate
} catch {
    Write-Host "??  Prisma????????????..." -ForegroundColor Yellow
}

# 6. ?????
if ($BuildOnly) {
    Write-Host "?? ?????..." -ForegroundColor Blue
    docker-compose -f docker-compose/preview.yml build
} else {
    Write-Host "?? ?????..." -ForegroundColor Blue
    Write-Host "? ???????" -ForegroundColor Green
    Write-Host "?? ??: http://localhost:3000" -ForegroundColor Blue
    Write-Host "?? ??: http://localhost:4000" -ForegroundColor Blue
    Write-Host "?? ??: http://localhost:9090 (Prometheus)" -ForegroundColor Blue
    Write-Host "?? ???: http://localhost:3001 (Grafana)" -ForegroundColor Blue
    
    # ??????
    docker-compose -f docker-compose/preview.yml up --build
}

