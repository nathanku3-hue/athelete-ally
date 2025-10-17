# seed-to-dsn.ps1
# One-shot seed to any Postgres DSN
#
# Usage:
#   .\scripts\seed-to-dsn.ps1 -Dsn "postgresql://user:pass@host:port/db"
#   .\scripts\seed-to-dsn.ps1 -Dsn "postgresql://user:pass@host:port/db" -DataFile "path/to/movements.json"

param(
    [Parameter(Mandatory=$true)]
    [string]$Dsn,
    
    [Parameter(Mandatory=$false)]
    [string]$DataFile = "",
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipMigrations
)

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Seed to DSN - Stream 5 Movement Library" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Mask password in DSN for logging
$maskedDsn = $Dsn -replace ':[^:@]+@', ':****@'
Write-Host "🎯 Target:        $maskedDsn" -ForegroundColor Yellow

if ($DataFile) {
    Write-Host "📁 Data file:     $DataFile" -ForegroundColor Yellow
}

Write-Host ""

# Step 1: Apply migrations (unless skipped)
if (-not $SkipMigrations) {
    Write-Host "📦 Step 1: Applying Prisma migrations..." -ForegroundColor Green
    Write-Host ""
    
    Push-Location services\planning-engine
    $env:PLANNING_DATABASE_URL = $Dsn
    
    try {
        & npx prisma migrate deploy 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Host ""
            Write-Host "⚠️  Migration deploy failed, trying db push..." -ForegroundColor Yellow
            & npx prisma db push --skip-generate 2>&1
            if ($LASTEXITCODE -ne 0) {
                throw "Schema sync failed"
            }
        }
        Write-Host "✅ Schema applied" -ForegroundColor Green
    }
    catch {
        Write-Host ""
        Write-Host "❌ Failed to apply schema" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    finally {
        Pop-Location
    }
    
    Write-Host ""
} else {
    Write-Host "⏭️  Skipping migrations (--SkipMigrations)" -ForegroundColor Yellow
    Write-Host ""
}

# Step 2: Seed movements
Write-Host "🌱 Step 2: Seeding movements..." -ForegroundColor Green
Write-Host ""

$seedArgs = @("--dsn=$Dsn")
if ($DataFile) {
    $seedArgs += "--file=$DataFile"
}

try {
    & npm run seed:movements -- $seedArgs
    if ($LASTEXITCODE -ne 0) {
        throw "Seed failed"
    }
}
catch {
    Write-Host ""
    Write-Host "❌ Seeding failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ Seed-to-DSN Complete!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Verify:" -ForegroundColor Yellow
Write-Host "  psql `"$maskedDsn`" -c `"SELECT COUNT(*) FROM movement_library;`"" -ForegroundColor Gray
Write-Host ""
