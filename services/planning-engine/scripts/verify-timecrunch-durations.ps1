# Time-Crunch Multi-Duration Verification
# Tests the time-crunch endpoint with various target durations

param(
    [string]$BaseUrl = "http://localhost:4102",
    [string]$PlanId = "plan-timecrunch-test-001",
    [string]$Token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0LXVzZXItdGltZWNydW5jaCIsInJvbGUiOiJ1c2VyIiwiZW1haWwiOiJ0ZXN0LXVzZXItdGltZWNydW5jaEB0ZXN0LmV4YW1wbGUuY29tIiwiaWF0IjoxNzYxMTE5MjY3LCJleHAiOjE3NjEyMDU2NjcsImF1ZCI6ImF0aGxldGUtYWxseS11c2VycyIsImlzcyI6ImF0aGxldGUtYWxseSJ9.nbBjWcSwR1SWWR6YMsbligy59xJiEwvRPGtkaB7q1ns"
)

Write-Host "🚀 Time-Crunch Multi-Duration Verification" -ForegroundColor Cyan
Write-Host "Testing multiple target durations to validate compression logic`n"

$durations = @(15, 20, 30, 45, 60, 75, 90, 120, 180)
$results = @()

$headers = @{
    "Authorization" = "Bearer $Token"
    "Content-Type" = "application/json"
}

foreach ($targetMinutes in $durations) {
    Write-Host "Testing target duration: $targetMinutes minutes..." -ForegroundColor Yellow
    
    $body = @{
        planId = $PlanId
        targetMinutes = $targetMinutes
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$BaseUrl/api/v1/time-crunch/preview" `
            -Method POST `
            -Headers $headers `
            -Body $body `
            -ErrorAction Stop
        
        $result = [PSCustomObject]@{
            TargetMinutes = $targetMinutes
            TargetSeconds = $targetMinutes * 60
            CompressedSeconds = $response.compressedDurationSeconds
            CompressedMinutes = [math]::Round($response.compressedDurationSeconds / 60, 2)
            MeetsConstraint = $response.meetsTimeConstraint
            SessionCount = $response.sessions.Count
            Status = "✅ SUCCESS"
        }
        
        Write-Host "  ✅ Compressed to $($result.CompressedMinutes) min ($($result.CompressedSeconds)s)" -ForegroundColor Green
        Write-Host "  Meets constraint: $($result.MeetsConstraint)" -ForegroundColor Green
        
    } catch {
        $result = [PSCustomObject]@{
            TargetMinutes = $targetMinutes
            TargetSeconds = $targetMinutes * 60
            CompressedSeconds = 0
            CompressedMinutes = 0
            MeetsConstraint = $false
            SessionCount = 0
            Status = "❌ FAILED: $($_.Exception.Message)"
        }
        
        Write-Host "  ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    $results += $result
    Start-Sleep -Milliseconds 500
}

Write-Host "`n📊 Test Summary" -ForegroundColor Cyan
Write-Host "=" * 80

$results | Format-Table -AutoSize

$successCount = ($results | Where-Object { $_.Status -like "*SUCCESS*" }).Count
$failureCount = $results.Count - $successCount

Write-Host "`n✅ Successful tests: $successCount / $($results.Count)" -ForegroundColor Green
if ($failureCount -gt 0) {
    Write-Host "❌ Failed tests: $failureCount / $($results.Count)" -ForegroundColor Red
}

# Save results to file
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$outputFile = "test-results-timecrunch-$timestamp.json"
$results | ConvertTo-Json -Depth 10 | Out-File $outputFile
Write-Host "`n💾 Results saved to: $outputFile" -ForegroundColor Cyan

# Analyze compression ratios
Write-Host "`n📈 Compression Analysis" -ForegroundColor Cyan
$successfulResults = $results | Where-Object { $_.Status -like "*SUCCESS*" }
if ($successfulResults.Count -gt 0) {
    $avgCompression = ($successfulResults | Measure-Object -Property CompressedMinutes -Average).Average
    $minCompression = ($successfulResults | Measure-Object -Property CompressedMinutes -Minimum).Minimum
    $maxCompression = ($successfulResults | Measure-Object -Property CompressedMinutes -Maximum).Maximum
    
    Write-Host "  Average compressed duration: $([math]::Round($avgCompression, 2)) minutes"
    Write-Host "  Min compressed duration: $minCompression minutes"
    Write-Host "  Max compressed duration: $maxCompression minutes"
}

Write-Host "`n🎯 Verification Complete!" -ForegroundColor Green
