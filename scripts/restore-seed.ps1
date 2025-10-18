# restore-seed.ps1
# Restore movement library seed data from pg_dump artifact
#
# Usage:
#   .\scripts\restore-seed.ps1 -DumpFile "artifacts/seed-dumps/movements_seed_20251015.sql" -Dsn "postgresql://user:pass@host:port/db"

param(
    [Parameter(Mandatory=$true)]
    [string]$DumpFile,
    
    [Parameter(Mandatory=$true)]
    [string]$Dsn,
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipConfirmation
)

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Restore Seed Dump - Movement Library" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Verify dump file exists
if (-not (Test-Path $DumpFile)) {
    Write-Host "❌ Dump file not found: $DumpFile" -ForegroundColor Red
    exit 1
}

$fileSize = (Get-Item $DumpFile).Length
$fileSizeKB = [math]::Round($fileSize / 1KB, 2)

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

$maskedDsn = $Dsn -replace ':[^:@]+@', ':****@'

Write-Host "📁 Dump file:     $DumpFile ($fileSizeKB KB)" -ForegroundColor Yellow
Write-Host "🎯 Target DB:     $maskedDsn" -ForegroundColor Yellow
Write-Host ""

# Confirmation (unless skipped)
if (-not $SkipConfirmation) {
    Write-Host "⚠️  This will:" -ForegroundColor Yellow
    Write-Host "   • DROP existing movement_library, movement_staging, movement_audit_log tables" -ForegroundColor Yellow
    Write-Host "   • Restore from dump file" -ForegroundColor Yellow
    Write-Host ""
    $confirmation = Read-Host "Continue? (y/N)"
    if ($confirmation -ne 'y' -and $confirmation -ne 'Y') {
        Write-Host "Cancelled." -ForegroundColor Gray
        exit 0
    }
    Write-Host ""
}

# Set pg environment
$env:PGPASSWORD = $pgPassword

try {
    Write-Host "📦 Restoring dump..." -ForegroundColor Green
    Write-Host ""
    
    # Apply dump (includes DROP IF EXISTS, so safe to rerun)
    $psqlCmd = "psql -h $pgHost -p $pgPort -U $pgUser -d $pgDatabase -f `"$DumpFile`""
    
    Invoke-Expression $psqlCmd 2>&1 | ForEach-Object {
        if ($_ -match "ERROR") {
            Write-Host $_ -ForegroundColor Red
        } else {
            Write-Host $_ -ForegroundColor Gray
        }
    }
    
    if ($LASTEXITCODE -ne 0) {
        throw "psql restore failed"
    }
    
    Write-Host ""
    Write-Host "✅ Restore complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "Verify:" -ForegroundColor Yellow
    Write-Host "  psql `"$maskedDsn`" -c `"SELECT COUNT(*) FROM movement_library;`"" -ForegroundColor Gray
    Write-Host "  psql `"$maskedDsn`" -c `"SELECT COUNT(*) FROM movement_audit_log;`"" -ForegroundColor Gray
    Write-Host ""
}
catch {
    Write-Host ""
    Write-Host "❌ Restore failed: $_" -ForegroundColor Red
    exit 1
}
finally {
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
}
