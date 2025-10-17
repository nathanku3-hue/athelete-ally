# generate-seed-dump.ps1
# Generate portable pg_dump artifact for movement library seed data
#
# Usage:
#   .\scripts\generate-seed-dump.ps1
#   .\scripts\generate-seed-dump.ps1 -OutputDir "artifacts"

param(
    [Parameter(Mandatory=$false)]
    [string]$OutputDir = "artifacts/seed-dumps",
    
    [Parameter(Mandatory=$false)]
    [string]$Dsn = "postgresql://athlete:athlete@127.0.0.1:55432/athlete_planning"
)

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Generate Seed Dump - Movement Library" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Parse DSN components
$dsnMatch = $Dsn -match 'postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)'
if (-not $dsnMatch) {
    Write-Host "❌ Invalid DSN format" -ForegroundColor Red
    exit 1
}

$pgUser = $Matches[1]
$pgPassword = $Matches[2]
$pgHost = $Matches[3]
$pgPort = $Matches[4]
$pgDatabase = $Matches[5]

Write-Host "🗄️  Source DB:     $pgDatabase @ $pgHost:$pgPort" -ForegroundColor Yellow
Write-Host ""

# Create output directory
if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$dumpFile = Join-Path $OutputDir "movements_seed_$timestamp.sql"

Write-Host "📦 Generating dump..." -ForegroundColor Green
Write-Host "   Target: $dumpFile" -ForegroundColor Gray
Write-Host ""

# Set pg environment
$env:PGPASSWORD = $pgPassword

try {
    # Dump schema + data for movement tables only
    $tables = @(
        "movement_library",
        "movement_staging", 
        "movement_audit_log"
    )
    
    $tableArgs = $tables | ForEach-Object { "-t `"$_`"" }
    $pgDumpCmd = "pg_dump -h $pgHost -p $pgPort -U $pgUser -d $pgDatabase $($tableArgs -join ' ') --no-owner --no-privileges --clean --if-exists"
    
    Write-Host "Running: pg_dump..." -ForegroundColor Gray
    Invoke-Expression "$pgDumpCmd" | Out-File -Encoding utf8 $dumpFile
    
    if (-not $?) {
        throw "pg_dump failed"
    }
    
    $fileSize = (Get-Item $dumpFile).Length
    $fileSizeKB = [math]::Round($fileSize / 1KB, 2)
    
    Write-Host ""
    Write-Host "✅ Dump generated: $fileSizeKB KB" -ForegroundColor Green
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "Dump artifact ready!" -ForegroundColor Green
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "File:   $dumpFile" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To restore to any database:" -ForegroundColor Gray
    Write-Host "  .\scripts\restore-seed.ps1 -DumpFile `"$dumpFile`" -Dsn `"postgresql://...`"" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Or manually:" -ForegroundColor Gray
    Write-Host "  psql `"postgresql://...`" < `"$dumpFile`"" -ForegroundColor Gray
    Write-Host ""
}
catch {
    Write-Host ""
    Write-Host "❌ Dump generation failed: $_" -ForegroundColor Red
    exit 1
}
finally {
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
}
