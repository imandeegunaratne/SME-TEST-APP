# HTTPS Deployment With A Public Domain

Use this when external users access the app through a real domain such as:

```text
https://sme-scoring.example.com
```

## Requirements

- A real domain name.
- DNS `A` record pointing the domain to this server's public IP.
- Firewall allows inbound `80` and `443`.
- Docker is running on the server.

Do not expose Postgres or Django directly. Only Nginx should publish ports.

## 1. Build frontend

```powershell
cd frontend
npm install
npm run build
cd ..
```

## 2. Configure domain values

Replace the example domain/email:

```powershell
.\scripts\configure-https.ps1 -Domain "sme-scoring.example.com" -Email "admin@example.com"
```

## 3. Start HTTP stack for certificate challenge

```powershell
docker compose up -d --build
```

Check:

```powershell
docker compose ps
```

## 4. Request the Let's Encrypt certificate

```powershell
docker compose -f docker-compose.yml -f docker-compose.https.yml --profile certbot run --rm certbot certonly --webroot --webroot-path /var/www/certbot --email admin@example.com --agree-tos --no-eff-email -d sme-scoring.example.com
```

## 5. Start HTTPS stack

```powershell
docker compose -f docker-compose.yml -f docker-compose.https.yml up -d --build
```

Open:

```text
https://sme-scoring.example.com/
https://sme-scoring.example.com/admin/
https://sme-scoring.example.com/api/health/
```

## 6. Renew certificates

Run this periodically, for example monthly:

```powershell
docker compose -f docker-compose.yml -f docker-compose.https.yml --profile certbot run --rm certbot renew --webroot --webroot-path /var/www/certbot
docker compose exec nginx nginx -s reload
```

## Notes

The HTTPS config lives in `nginx/https/conf.d/default.conf`.

The normal local/internal HTTP config remains in `nginx/conf.d/default.conf`.
