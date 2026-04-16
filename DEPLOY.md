# Deploying Vital

Self-hosted on any Linux VPS (Ubuntu 22.04+ recommended). Uses Docker + Caddy for HTTPS.

---

## Prerequisites

- VPS with at least 1 GB RAM
- A domain pointed at the server's IP (`vital.yourdomain.com`)
- SSH access as root or a sudo user

---

## 1. Install Docker

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker
```

Verify: `docker --version`

---

## 2. Install Caddy

```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' \
  | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' \
  | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install caddy
```

---

## 3. Clone the repo

```bash
git clone https://github.com/your-username/vital.git /opt/vital
cd /opt/vital
```

---

## 4. Create `.env.production`

```bash
cp .env.production.example .env.production
nano .env.production
```

Fill in:
- `NEXTAUTH_SECRET` — run `openssl rand -base64 32` to generate
- `NEXTAUTH_URL` — your full domain e.g. `https://vital.yourdomain.com`
- `AI_PROVIDER` + the matching API key

---

## 5. Seed the database (first deploy only)

The container runs `prisma migrate deploy` on startup automatically.
To seed initial users after the first run:

```bash
docker compose run --rm vital sh -c "npx tsx prisma/seed.ts"
```

---

## 6. Start the app

```bash
docker compose up -d
```

Check logs: `docker compose logs -f`

The app is now running on port 3000 (HTTP only, Caddy will handle HTTPS).

---

## 7. Configure Caddy for HTTPS

Edit `/etc/caddy/Caddyfile`:

```
vital.yourdomain.com {
    reverse_proxy localhost:3000
}
```

Reload Caddy:

```bash
sudo systemctl reload caddy
```

Caddy automatically provisions a Let's Encrypt certificate. Visit `https://vital.yourdomain.com` — done.

---

## Updates

```bash
cd /opt/vital
git pull
docker compose up -d --build
```

The container runs `prisma migrate deploy` on start, so migrations apply automatically.

---

## SQLite backups

The database lives in the `vital_data` Docker volume at `/var/lib/docker/volumes/vital_data/_data/vital.db`.

Simple daily backup with cron:

```bash
# crontab -e
0 3 * * * cp /var/lib/docker/volumes/vital_data/_data/vital.db \
  /opt/vital-backups/vital-$(date +\%Y\%m\%d).db
```

---

## Useful commands

| Command | Purpose |
|---|---|
| `docker compose ps` | Check container status |
| `docker compose logs -f` | Stream logs |
| `docker compose down` | Stop |
| `docker compose up -d --build` | Rebuild and restart |
| `docker compose exec vital sh` | Shell into container |
