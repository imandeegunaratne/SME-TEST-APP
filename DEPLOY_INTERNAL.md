# Internal Docker Deployment

This project is ready to run behind the included Nginx reverse proxy on an internal server.

## 1. Set internal server host values

Edit `backend/.env.docker` on the server before starting the stack.

For an internal IP such as `192.168.1.50`, use:

```env
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,db,backend,192.168.1.50
DJANGO_CSRF_TRUSTED_ORIGINS=http://localhost,http://127.0.0.1,http://192.168.1.50
DJANGO_CORS_ALLOWED_ORIGINS=http://localhost,http://127.0.0.1,http://192.168.1.50
```

For an internal DNS name such as `sme-scoring.internal`, use:

```env
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,db,backend,sme-scoring.internal
DJANGO_CSRF_TRUSTED_ORIGINS=http://localhost,http://127.0.0.1,http://sme-scoring.internal
DJANGO_CORS_ALLOWED_ORIGINS=http://localhost,http://127.0.0.1,http://sme-scoring.internal
```

If the internal server uses HTTPS, switch those origins to `https://...` and set:

```env
DJANGO_SECURE_SSL_REDIRECT=1
```

## 2. Build frontend assets

Run this before starting Docker because Nginx serves `frontend/dist`.

```powershell
cd frontend
npm install
npm run build
cd ..
```

## 3. Start the stack

```powershell
docker compose up -d --build
```

## 4. Verify services

```powershell
docker compose ps
docker compose logs backend
docker compose logs nginx
```

Open:

```text
http://<internal-server-ip>/
http://<internal-server-ip>/api/health/
```

## 5. Backups

Back up the `postgres_data` Docker volume regularly. This repo includes a helper script:

```powershell
.\scripts\backup-postgres.ps1
```

The backup is written to `.\backups` by default.

Keep the generated `.env.docker` values private.

## 6. Security checks after deployment

Run these after every deploy:

```powershell
docker compose ps
docker compose logs backend --tail 100
docker compose logs nginx --tail 100
```

Then verify:

```text
http://<internal-server-ip>/api/health/
```

If the app is exposed outside a trusted internal network, put HTTPS in front of Nginx and set `DJANGO_SECURE_SSL_REDIRECT=1`.

For public-domain HTTPS deployment, use `DEPLOY_HTTPS.md`.
