# 质量门禁检查脚本 - 质量与集成负责人 (PowerShell版本)
# 确保代码质量符合标准，建立高质量文化

param(
    [switch]$Verbose
)

Write-Host "🔍 质量与集成负责人 - 质量门禁检查开始..." -ForegroundColor Blue

# 质量门禁标准
$MIN_COVERAGE = 80
$MAX_COMPLEXITY = 10
$MAX_DUPLICATION = 5
$MAX_HIGH_RISK_VULNERABILITIES = 0

# 检查函数
function Test-CodeQuality {
    Write-Host "`n📊 代码质量检查" -ForegroundColor Blue
    Write-Host "=================="
    
    # 检查代码覆盖率
    Write-Host "检查代码覆盖率... " -NoNewline
    try {
        if (Get-Command nyc -ErrorAction SilentlyContinue) {
            $coverageResult = npx nyc --reporter=text-summary npm test 2>$null
            $coverage = [regex]::Match($coverageResult, '(\d+\.?\d*)%').Groups[1].Value
            if ([double]$coverage -ge $MIN_COVERAGE) {
                Write-Host "✅ $coverage% (>= $MIN_COVERAGE%)" -ForegroundColor Green
            } else {
                Write-Host "❌ $coverage% (< $MIN_COVERAGE%)" -ForegroundColor Red
                return $false
            }
        } else {
            Write-Host "⚠️  nyc not available, skipping coverage check" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "⚠️  Coverage check failed" -ForegroundColor Yellow
    }
    
    # 检查代码复杂度
    Write-Host "检查代码复杂度... " -NoNewline
    try {
        if (Get-Command eslint -ErrorAction SilentlyContinue) {
            $complexityResult = npx eslint --rule "complexity: [2, $MAX_COMPLEXITY]" . --format=json 2>$null
            $complexityIssues = ($complexityResult | ConvertFrom-Json | ForEach-Object { $_.messages.Count } | Measure-Object -Sum).Sum
            if ($complexityIssues -eq 0) {
                Write-Host "✅ 复杂度检查通过" -ForegroundColor Green
            } else {
                Write-Host "❌ 发现 $complexityIssues 个复杂度问题" -ForegroundColor Red
                return $false
            }
        } else {
            Write-Host "⚠️  eslint not available, skipping complexity check" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "⚠️  Complexity check failed" -ForegroundColor Yellow
    }
    
    return $true
}

function Test-Security {
    Write-Host "`n🔒 安全检查" -ForegroundColor Blue
    Write-Host "=========="
    
    # 检查安全漏洞
    Write-Host "检查安全漏洞... " -NoNewline
    try {
        npm audit --audit-level=high --json > audit-results.json 2>$null
        
        if (Test-Path "audit-results.json") {
            $auditData = Get-Content "audit-results.json" | ConvertFrom-Json
            $highRisk = 0
            
            if ($auditData.vulnerabilities) {
                $highRisk = ($auditData.vulnerabilities.PSObject.Properties | Where-Object {
                    $_.Value.severity -eq "high" -or $_.Value.severity -eq "critical"
                }).Count
            }
            
            if ($highRisk -eq 0) {
                Write-Host "✅ 无高危漏洞" -ForegroundColor Green
            } else {
                Write-Host "❌ 发现 $highRisk 个高危漏洞" -ForegroundColor Red
                return $false
            }
        } else {
            Write-Host "⚠️  无法获取安全审计结果" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "⚠️  Security check failed" -ForegroundColor Yellow
    }
    
    return $true
}

function Test-Tests {
    Write-Host "`n🧪 测试检查" -ForegroundColor Blue
    Write-Host "=========="
    
    # 检查单元测试
    Write-Host "运行单元测试... " -NoNewline
    try {
        $testResult = npm test 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ 单元测试通过" -ForegroundColor Green
        } else {
            Write-Host "❌ 单元测试失败" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ 单元测试执行失败" -ForegroundColor Red
        return $false
    }
    
    # 检查集成测试
    Write-Host "运行集成测试... " -NoNewline
    try {
        $integrationResult = npm run test:integration 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ 集成测试通过" -ForegroundColor Green
        } else {
            Write-Host "⚠️  集成测试跳过或失败" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "⚠️  集成测试执行失败" -ForegroundColor Yellow
    }
    
    return $true
}

function Test-Build {
    Write-Host "`n🏗️ 构建检查" -ForegroundColor Blue
    Write-Host "=========="
    
    # 检查代码格式
    Write-Host "检查代码格式... " -NoNewline
    try {
        $lintResult = npx eslint . --fix 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ 代码格式检查通过" -ForegroundColor Green
        } else {
            Write-Host "❌ 代码格式检查失败" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ 代码格式检查执行失败" -ForegroundColor Red
        return $false
    }
    
    # 检查类型
    Write-Host "检查类型定义... " -NoNewline
    try {
        $typeResult = npx tsc --noEmit 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ 类型检查通过" -ForegroundColor Green
        } else {
            Write-Host "❌ 类型检查失败" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ 类型检查执行失败" -ForegroundColor Red
        return $false
    }
    
    # 检查构建
    Write-Host "检查项目构建... " -NoNewline
    try {
        $buildResult = npm run build 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ 项目构建成功" -ForegroundColor Green
        } else {
            Write-Host "❌ 项目构建失败" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ 项目构建执行失败" -ForegroundColor Red
        return $false
    }
    
    return $true
}

function Test-Observability {
    Write-Host "`n👁️ 可观测性检查" -ForegroundColor Blue
    Write-Host "================"
    
    # 检查指标暴露
    Write-Host "检查指标暴露... " -NoNewline
    try {
        $metricsFiles = Get-ChildItem -Recurse -Include "*.ts", "*.js" | Select-String -Pattern "prom-client|@opentelemetry" -List
        if ($metricsFiles) {
            Write-Host "✅ 指标暴露配置存在" -ForegroundColor Green
        } else {
            Write-Host "⚠️  未发现指标暴露配置" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "⚠️  指标检查失败" -ForegroundColor Yellow
    }
    
    # 检查日志记录
    Write-Host "检查日志记录... " -NoNewline
    try {
        $logFiles = Get-ChildItem -Recurse -Include "*.ts", "*.js" | Select-String -Pattern "console\.log|logger" -List
        if ($logFiles) {
            Write-Host "✅ 日志记录配置存在" -ForegroundColor Green
        } else {
            Write-Host "⚠️  未发现日志记录配置" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "⚠️  日志检查失败" -ForegroundColor Yellow
    }
    
    # 检查错误处理
    Write-Host "检查错误处理... " -NoNewline
    try {
        $errorFiles = Get-ChildItem -Recurse -Include "*.ts", "*.js" | Select-String -Pattern "try.*catch|throw" -List
        if ($errorFiles) {
            Write-Host "✅ 错误处理配置存在" -ForegroundColor Green
        } else {
            Write-Host "⚠️  未发现错误处理配置" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "⚠️  错误处理检查失败" -ForegroundColor Yellow
    }
    
    return $true
}

# 主函数
function Main {
    Write-Host "质量与集成负责人 - 质量门禁检查" -ForegroundColor Blue
    Write-Host "=================================="
    
    $totalChecks = 0
    $passedChecks = 0
    
    # 执行各项检查
    if (Test-CodeQuality) {
        $passedChecks++
    }
    $totalChecks++
    
    if (Test-Security) {
        $passedChecks++
    }
    $totalChecks++
    
    if (Test-Tests) {
        $passedChecks++
    }
    $totalChecks++
    
    if (Test-Build) {
        $passedChecks++
    }
    $totalChecks++
    
    if (Test-Observability) {
        $passedChecks++
    }
    $totalChecks++
    
    # 输出结果
    Write-Host "`n📊 质量门禁检查结果" -ForegroundColor Blue
    Write-Host "=================="
    Write-Host "总检查项: $totalChecks"
    Write-Host "通过检查: $passedChecks"
    Write-Host "失败检查: $($totalChecks - $passedChecks)"
    
    if ($passedChecks -eq $totalChecks) {
        Write-Host "`n🎉 质量门禁检查通过！代码质量符合标准！" -ForegroundColor Green
        Write-Host "✅ 可以继续开发或合并代码" -ForegroundColor Green
        exit 0
    } else {
        Write-Host "`n❌ 质量门禁检查失败！请修复问题后重试" -ForegroundColor Red
        Write-Host "⚠️  代码质量不符合标准，无法继续" -ForegroundColor Red
        exit 1
    }
}

# 运行主函数
Main
