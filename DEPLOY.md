# Deploying Vital to a VPS

This guide deploys Vital to a Linux VPS at `vital.rahulaswin.dev` using Docker + Caddy (automatic HTTPS).

---

## Part 1 — Point your subdomain to the VPS

1. Log in to [Namecheap](https://namecheap.com) → **Domain List** → click **Manage** next to `rahulaswin.dev`
2. Go to **Advanced DNS**
3. Add a new record:

   | Type | Host | Value | TTL |
   |---|---|---|---|
   | A Record | `vital` | `<your VPS IP>` | Automatic |

4. Save. DNS propagates in 1–10 minutes (check with `ping vital.rahulaswin.dev`).

---

## Part 2 — Prepare the VPS

SSH into your server:

```bash
ssh root@<your-vps-ip>
```

### Install Docker

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker
```

Verify: `docker --version`

### Install Caddy

```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' \
  | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' \
  | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install caddy
sudo systemctl enable caddy
```

---

## Part 3 — Deploy the app

### Clone the repo

```bash
git clone https://github.com/your-username/vital.git /opt/vital
cd /opt/vital
```

### Create the production env file

```bash
cp .env.production.example .env.production
nano .env.production
```

Fill it in — here's what it should look like:

```env
NEXTAUTH_SECRET="paste-output-of-openssl-rand-base64-32-here"
NEXTAUTH_URL="https://vital.rahulaswin.dev"
AI_PROVIDER="gemini"
GEMINI_API_KEY="AIzaSy..."
```

Generate the secret with:
```bash
openssl rand -base64 32
```

> `DATABASE_URL` is injected by `docker-compose.yml` — do not add it to this file.

### Build and start

```bash
docker compose up -d --build
```

This will:
- Build the Docker image (takes 3–5 min on first run)
- Run `prisma migrate deploy` automatically on container start
- Start the app on port 3000 (internal only)

Check it started cleanly:
```bash
docker compose logs -f
```

You should see `✓ Ready` with no errors. Press `Ctrl+C` to stop tailing logs.

### Seed initial users (first deploy only)

```bash
docker compose exec vital sh -c "npx tsx prisma/seed.ts"
```

This creates:

| Email | Password |
|---|---|
| `admin@vital.app` | `Admin@123` |
| `user1@vital.app` | `User@123` |
| `user2@vital.app` | `User@123` |

---

## Part 4 — Configure Caddy (HTTPS)

```bash
sudo nano /etc/caddy/Caddyfile
```

Replace the entire file content with:

```
vital.rahulaswin.dev {
    reverse_proxy localhost:3000
}
```

Save (`Ctrl+X → Y → Enter`), then reload:

```bash
sudo systemctl reload caddy
```

Caddy automatically obtains a Let's Encrypt certificate for `vital.rahulaswin.dev`.

Visit **https://vital.rahulaswin.dev** — you should see the login page.

---

## Part 5 — Verify everything works

- [ ] `https://vital.rahulaswin.dev` loads (padlock in browser = HTTPS working)
- [ ] Login with `admin@vital.app` / `Admin@123`
- [ ] Add a scan manually
- [ ] Generate a meal plan

---

## Updating the app

Every time you push new code:

```bash
cd /opt/vital
git pull
docker compose up -d --build
```

The container re-runs `prisma migrate deploy` on start, so any new migrations apply automatically.

---

## Backups

The SQLite database lives in a named Docker volume. Set up a daily cron backup:

```bash
mkdir -p /opt/vital-backups
crontab -e
```

Add this line:
```
0 3 * * * cp /var/lib/docker/volumes/vital_data/_data/vital.db /opt/vital-backups/vital-$(date +\%Y\%m\%d).db
```

---

## Troubleshooting

**App not loading after deploy**
```bash
docker compose logs -f        # check for startup errors
docker compose ps             # check container is running (Up)
```

**502 Bad Gateway from Caddy**
The app container probably failed to start. Check:
```bash
docker compose logs vital
```

**Certificate not provisioning**
Make sure port 80 is open on the VPS firewall — Caddy needs it for the ACME challenge:
```bash
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 22
sudo ufw enable
```

**Database migration errors**
```bash
docker compose exec vital sh
npx prisma migrate status
```

---

## Useful commands

| Command | What it does |
|---|---|
| `docker compose ps` | Check container status |
| `docker compose logs -f` | Stream live logs |
| `docker compose down` | Stop the app |
| `docker compose up -d --build` | Rebuild and restart |
| `docker compose exec vital sh` | Open shell inside container |
| `sudo systemctl status caddy` | Check Caddy status |
| `sudo journalctl -u caddy -f` | Stream Caddy logs |
