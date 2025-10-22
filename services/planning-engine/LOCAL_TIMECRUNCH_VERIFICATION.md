# Local Time-Crunch Verification Guide

## Overview
Since there is no staging environment with URL/JWT available, this guide provides a complete local verification workflow for the Time-Crunch feature.

## Prerequisites
✅ Planning-engine running on `http://localhost:4102`
✅ Postgres running on port `55432`
✅ Redis running on port `6379`
✅ SKIP_EVENTS=true (to bypass NATS dependency)

---

## Step 1: Generate Test JWT Token

Use the built-in JWT test utilities to generate a valid token:

```javascript
// Create test-jwt-generator.js in services/planning-engine/scripts/
import { JWTTestUtils } from '@athlete-ally/shared';

const userId = 'test-user-timecrunch-001';
const token = JWTTestUtils.generateTestToken(userId, 'user', 'test@example.com');

console.log('JWT Token:', token);
console.log('Authorization Header:', `Bearer ${token}`);
console.log('User ID:', userId);
```

Run it:
```powershell
cd E:\vibe\athlete-ally-original\services\planning-engine
node --import tsx scripts/test-jwt-generator.js
```

**Output example:**
```
JWT Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Authorization Header: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
User ID: test-user-timecrunch-001
```

---

## Step 2: Create Test Training Plan

You need a planId to test the time-crunch endpoint. Create one via database seeding or the generate endpoint.

### Option A: Direct Database Insert (Quick)

```sql
-- Connect to postgres on port 55432
psql postgresql://athlete:athlete_pass@localhost:55432/athlete_planning

-- Insert test plan
INSERT INTO "Plan" (id, "userId", status, name, description, content, "createdAt", "updatedAt")
VALUES (
  'plan-timecrunch-test-001',
  'test-user-timecrunch-001',
  'completed',
  'Test Training Plan',
  'Plan for time-crunch verification',
  '{"name": "Test Plan", "microcycles": [{"weekNumber": 1, "name": "Week 1", "phase": "base", "sessions": [{"dayOfWeek": 1, "name": "Upper Body", "duration": 60, "exercises": [{"name": "Bench Press", "category": "strength", "sets": 3, "reps": 10}]}]}]}',
  NOW(),
  NOW()
);
```

### Option B: Use Planning-Engine Generate Endpoint

```powershell
# Generate a plan via API
$token = "<paste JWT token here>"
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}
$body = @{
    userId = "test-user-timecrunch-001"
    targetMinutes = 45
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:4102/generate" `
    -Method POST `
    -Headers $headers `
    -Body $body
```

---

## Step 3: Verify Time-Crunch Preview Endpoint

Now test the time-crunch feature:

```powershell
# Set variables
$planId = "plan-timecrunch-test-001"
$token = "<paste JWT token here>"

# Call time-crunch preview endpoint
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}
$body = @{
    planId = $planId
    targetMinutes = 30
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:4102/api/v1/time-crunch/preview" `
    -Method POST `
    -Headers $headers `
    -Body $body

# Display results
$response | ConvertTo-Json -Depth 10
```

**Expected Success Response:**
```json
{
  "planId": "plan-timecrunch-test-001",
  "targetMinutes": 30,
  "originalDurationSeconds": 3600,
  "compressedDurationSeconds": 1800,
  "meetsTimeConstraint": true,
  "sessions": [...]
}
```

---

## Step 4: Automated Verification Script

Create a complete verification script:

```powershell
# services/planning-engine/scripts/verify-timecrunch-local.ps1

param(
    [string]$BaseUrl = "http://localhost:4102",
    [int]$TargetMinutes = 30
)

Write-Host "🚀 Time-Crunch Local Verification" -ForegroundColor Cyan

# Step 1: Generate JWT
Write-Host "`n📝 Step 1: Generating JWT token..."
$userId = "test-user-$(Get-Random -Maximum 9999)"
node --import tsx scripts/test-jwt-generator.js > token.tmp
$token = (Get-Content token.tmp | Select-String "JWT Token:").ToString().Replace("JWT Token:", "").Trim()
Remove-Item token.tmp

Write-Host "✅ Token generated for user: $userId" -ForegroundColor Green

# Step 2: Create test plan
Write-Host "`n📝 Step 2: Creating test training plan..."
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}
$generateBody = @{
    userId = $userId
    targetMinutes = 60
} | ConvertTo-Json

try {
    $planResponse = Invoke-RestMethod -Uri "$BaseUrl/generate" `
        -Method POST `
        -Headers $headers `
        -Body $generateBody
    
    $jobId = $planResponse.jobId
    Write-Host "✅ Plan generation queued: $jobId" -ForegroundColor Green
    
    # Poll for completion
    Write-Host "⏳ Waiting for plan generation..."
    $maxAttempts = 30
    $attempt = 0
    $planId = $null
    
    while ($attempt -lt $maxAttempts) {
        Start-Sleep -Seconds 2
        $statusResponse = Invoke-RestMethod -Uri "$BaseUrl/status/$jobId" `
            -Method GET `
            -Headers $headers
        
        if ($statusResponse.status -eq "completed") {
            $planId = $statusResponse.resultData.planId
            Write-Host "✅ Plan created: $planId" -ForegroundColor Green
            break
        } elseif ($statusResponse.status -eq "failed") {
            throw "Plan generation failed: $($statusResponse.errorData)"
        }
        $attempt++
    }
    
    if (-not $planId) {
        throw "Plan generation timeout"
    }
    
} catch {
    Write-Host "❌ Plan generation failed: $_" -ForegroundColor Red
    exit 1
}

# Step 3: Test time-crunch endpoint
Write-Host "`n📝 Step 3: Testing time-crunch preview..."
$timeCrunchBody = @{
    planId = $planId
    targetMinutes = $TargetMinutes
} | ConvertTo-Json

try {
    $timeCrunchResponse = Invoke-RestMethod -Uri "$BaseUrl/api/v1/time-crunch/preview" `
        -Method POST `
        -Headers $headers `
        -Body $timeCrunchBody
    
    Write-Host "✅ Time-crunch preview successful!" -ForegroundColor Green
    Write-Host "`n📊 Results:" -ForegroundColor Cyan
    Write-Host "  Plan ID: $($timeCrunchResponse.planId)"
    Write-Host "  Target Minutes: $($timeCrunchResponse.targetMinutes)"
    Write-Host "  Original Duration: $($timeCrunchResponse.originalDurationSeconds)s"
    Write-Host "  Compressed Duration: $($timeCrunchResponse.compressedDurationSeconds)s"
    Write-Host "  Meets Constraint: $($timeCrunchResponse.meetsTimeConstraint)"
    Write-Host "  Sessions: $($timeCrunchResponse.sessions.Count)"
    
    Write-Host "`n✅ All verification tests passed!" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Time-crunch verification failed: $_" -ForegroundColor Red
    Write-Host $_.Exception.Response
    exit 1
}
```

Run it:
```powershell
.\scripts\verify-timecrunch-local.ps1
```

---

## Step 5: Feature Flag Check

Ensure the time-crunch feature flag is enabled locally:

```javascript
// Check in planning-engine/.env or set environment variable
LAUNCHDARKLY_SDK_KEY=<optional - skipped in local dev>
FEATURE_DISABLE_EVENTS=false
```

If LaunchDarkly is not configured, the time-crunch endpoint will return 404 with `feature_not_available`. To bypass:

1. Modify `src/routes/time-crunch.ts`:
```typescript
// Comment out or set to true for local testing
const isTimeCrunchEnabled = true; // await isFeatureEnabled('feature.stream5_time_crunch_mode', false);
```

2. Or set a local override in feature flags initialization.

---

## Step 6: 48-Hour Monitoring Simulation

Since there's no real staging to monitor, simulate locally:

```powershell
# scripts/monitor-timecrunch-local.ps1
param(
    [int]$DurationHours = 48,
    [int]$IntervalMinutes = 15
)

$endTime = (Get-Date).AddHours($DurationHours)
$testCount = 0
$successCount = 0
$failureCount = 0

Write-Host "🔍 Starting 48-hour monitoring simulation..." -ForegroundColor Cyan
Write-Host "   Duration: $DurationHours hours"
Write-Host "   Interval: $IntervalMinutes minutes"
Write-Host "   End time: $endTime"

while ((Get-Date) -lt $endTime) {
    $testCount++
    Write-Host "`n[Test $testCount] $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Yellow
    
    try {
        .\scripts\verify-timecrunch-local.ps1 -TargetMinutes (Get-Random -Minimum 15 -Maximum 90)
        $successCount++
        Write-Host "✅ Test $testCount passed" -ForegroundColor Green
    } catch {
        $failureCount++
        Write-Host "❌ Test $testCount failed: $_" -ForegroundColor Red
    }
    
    Write-Host "`n📊 Progress: $successCount passed, $failureCount failed ($(($successCount / $testCount * 100).ToString('F2'))% success rate)"
    
    Start-Sleep -Seconds ($IntervalMinutes * 60)
}

Write-Host "`n🎉 Monitoring complete!" -ForegroundColor Cyan
Write-Host "   Total tests: $testCount"
Write-Host "   Successful: $successCount"
Write-Host "   Failed: $failureCount"
Write-Host "   Success rate: $(($successCount / $testCount * 100).ToString('F2'))%"
```

---

## Alternative: When Staging Becomes Available

Once platform provides staging credentials, update verification script:

1. **Get staging URL** from platform team (e.g., `https://staging.athleteally.com`)
2. **Get JWT token** from platform team or authentication service
3. **Get test planId** from existing staging data

Then run:
```powershell
.\scripts\verify-timecrunch-staging.ps1 `
    -BaseUrl "https://staging.athleteally.com" `
    -Token "<real_staging_jwt>" `
    -PlanId "<real_staging_plan_id>"
```

---

## Summary

**Local Verification Workflow:**
1. ✅ Generate JWT using `JWTTestUtils`
2. ✅ Create test plan via API or database insert
3. ✅ Call `/api/v1/time-crunch/preview` endpoint
4. ✅ Verify response structure and compression logic
5. ✅ Run automated verification script
6. ✅ Optional: 48-hour soak test simulation

**When to request staging:**
- After local verification passes ✅
- When ready for production-like environment testing
- For integration with other services (auth, frontend)
- For load/performance testing with realistic data

**Blocked items removed:**
- No longer waiting for platform staging URL
- No longer waiting for JWT token generation process
- Can proceed with full local testing immediately
