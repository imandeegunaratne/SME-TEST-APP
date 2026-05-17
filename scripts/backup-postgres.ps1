param(
    [string]$OutputDirectory = ".\backups"
)

$ErrorActionPreference = "Stop"

if (!(Test-Path -LiteralPath $OutputDirectory)) {
    New-Item -ItemType Directory -Path $OutputDirectory | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupPath = Join-Path $OutputDirectory "sme_scoring_$timestamp.sql"

docker compose exec -T db pg_dump -U postgres sme_scoring | Out-File -LiteralPath $backupPath -Encoding utf8

Write-Host "Backup written to $backupPath"
