param(
    [string]$OutputDirectory = ".\backups"
)

$ErrorActionPreference = "Stop"

if (!(Test-Path -LiteralPath $OutputDirectory)) {
    New-Item -ItemType Directory -Path $OutputDirectory | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupPath = Join-Path $OutputDirectory "sme_scoring_$timestamp.sql"

docker compose --env-file backend/.env.docker exec -T db sh -c 'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' | Out-File -LiteralPath $backupPath -Encoding utf8

Write-Host "Backup written to $backupPath"
