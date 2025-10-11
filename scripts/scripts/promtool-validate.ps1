Param([string]$RulesPath = 'monitoring/alert_rules.yml')
try {
  $promtool = Get-Command promtool -ErrorAction Stop
  & $promtool.Source check rules $RulesPath
} catch {
  Write-Host 'promtool not found; skipping rules validation. (Install Prometheus to enable)' -ForegroundColor Yellow
}