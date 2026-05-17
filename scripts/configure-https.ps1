param(
    [Parameter(Mandatory = $true)]
    [string]$Domain,

    [Parameter(Mandatory = $true)]
    [string]$Email
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$httpsConfig = Join-Path $root "nginx\https\conf.d\default.conf"
$envFile = Join-Path $root "backend\.env.docker"

if (!(Test-Path -LiteralPath $httpsConfig)) {
    throw "HTTPS Nginx config was not found at $httpsConfig"
}

(Get-Content -LiteralPath $httpsConfig -Raw).Replace("DOMAIN_NAME", $Domain) |
    Set-Content -LiteralPath $httpsConfig -NoNewline

$envLines = Get-Content -LiteralPath $envFile
$envLines = $envLines | ForEach-Object {
    if ($_ -like "DJANGO_ALLOWED_HOSTS=*") {
        "DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,db,backend,$Domain"
    } elseif ($_ -like "DJANGO_CSRF_TRUSTED_ORIGINS=*") {
        "DJANGO_CSRF_TRUSTED_ORIGINS=https://$Domain"
    } elseif ($_ -like "DJANGO_CORS_ALLOWED_ORIGINS=*") {
        "DJANGO_CORS_ALLOWED_ORIGINS=https://$Domain"
    } elseif ($_ -like "DJANGO_SECURE_SSL_REDIRECT=*") {
        "DJANGO_SECURE_SSL_REDIRECT=1"
    } else {
        $_
    }
}
$envLines | Set-Content -LiteralPath $envFile

Write-Host "Configured HTTPS settings for $Domain"
Write-Host "Make sure DNS points $Domain to this server before requesting the certificate."
Write-Host "After DNS is ready, run:"
Write-Host "docker compose -f docker-compose.yml -f docker-compose.https.yml --profile certbot run --rm certbot certonly --webroot --webroot-path /var/www/certbot --email $Email --agree-tos --no-eff-email -d $Domain"
Write-Host "Then start HTTPS:"
Write-Host "docker compose -f docker-compose.yml -f docker-compose.https.yml up -d --build"
