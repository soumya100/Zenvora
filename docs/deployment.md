# Zenvora Production Deployment Guide

This guide provides step-by-step instructions for deploying **Zenvora** to any generic Linux Virtual Private Server (VPS) running **Ubuntu 24.04 LTS**.

This deployment uses:
- **Docker & Docker Compose** for container isolation.
- **Caddy Reverse Proxy** for automatic TLS certificates (HTTPS) via Let's Encrypt / ZeroSSL and HTTP/3 support.
- **SearXNG** running on an internal, unexposed network.
- **UFW (Uncomplicated Firewall)** restricting access to essential ports only (`22`, `80`, `443`).

> [!NOTE]
> This guide is cloud-provider agnostic. It works on Hetzner, DigitalOcean, AWS EC2, GCP Compute Engine, Oracle Cloud, Linode/Akamai, or any standard bare-metal server. No provider-specific tools or APIs are required.

---

## Architecture Summary

```
Public Internet (Ports 80 & 443)
       │
       ▼
   [ Caddy Reverse Proxy ] (Automatic TLS & Security Headers)
       │
       ├───► [ Zenvora Frontend ] (Static React SPA via Nginx)
       │
       └───► [ Zenvora Backend ]  (Node.js / Express API Layer)
                   │
                   ▼ (Internal Docker network only)
             [ SearXNG ]          (Metasearch Aggregator :8080)
                   │
                   ▼ (Outbound TLS Queries)
          [ Upstream Engines ]   (Google, Bing, Brave, Wikipedia)
```

---

## Prerequisites & Server Sizing

- **Operating System:** Ubuntu 24.04 LTS (x86_64 or arm64)
- **Minimum Specifications:**
  - 1 vCPU
  - 2 GB RAM (or 1 GB RAM + 2 GB Swap file)
  - 20 GB SSD storage
- **Domain Name:** A registered domain (e.g. `search.yourdomain.com`) pointing to your server's public IP.

---

## Step 1: Initial Server Hardening & User Creation

Log in as the `root` user via SSH:

```bash
ssh root@<YOUR_SERVER_IP>
```

### 1.1 Update System Packages
```bash
apt update && apt upgrade -y
```

### 1.2 Create a Dedicated Non-Root User
Never run production applications or Docker commands directly as `root`. Create a user named `deploy`:

```bash
adduser deploy
usermod -aG sudo deploy
```

### 1.3 Configure SSH Key Authentication
Copy your local SSH public key to the `deploy` user:

```bash
# On the server:
mkdir -p /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
cp /root/.ssh/authorized_keys /home/deploy/.ssh/authorized_keys
chown -R deploy:deploy /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys
```

### 1.4 Hardening SSH Daemon
Edit `/etc/ssh/sshd_config.d/hardening.conf`:

```bash
cat << 'EOF' > /etc/ssh/sshd_config.d/hardening.conf
PermitRootLogin no
PasswordAuthentication no
X11Forwarding no
MaxAuthTries 4
EOF

systemctl restart ssh
```

---

## Step 2: Configure the UFW Firewall

Lock down your server so that only essential ports are open to the world.

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing

sudo ufw allow 22/tcp comment 'SSH'
sudo ufw allow 80/tcp comment 'Caddy HTTP ACME Challenge'
sudo ufw allow 443/tcp comment 'Caddy HTTPS'
sudo ufw allow 443/udp comment 'HTTP/3 QUIC'

sudo ufw enable
sudo ufw status verbose
```

> [!IMPORTANT]
> Ports `3000` (Backend API) and `8080` (SearXNG) are intentionally **NOT** exposed in UFW or Docker. They communicate exclusively over the private internal Docker bridge network.

---

## Step 3: Install Docker and Docker Compose

```bash
sudo apt install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker deploy
```

Log out and log back in as `deploy`:

```bash
exit
ssh deploy@<YOUR_SERVER_IP>
docker --version
docker compose version
```

---

## Step 4: Configure DNS Records

Configure `A` / `AAAA` records pointing your domain to the server's public IP.

Verify DNS:
```bash
dig +short search.yourdomain.com
```

---

## Step 5: Clone Zenvora & Set Environment Variables

```bash
cd /home/deploy
git clone https://github.com/your-username/zenvora.git
cd zenvora

cp .env.example .env
```

Generate a random 32-character hexadecimal key for SearXNG:
```bash
openssl rand -hex 32
```

Edit `.env`:
```env
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
SEARXNG_URL=http://searxng:8080
SEARXNG_SECRET=<YOUR_GENERATED_HEX_KEY>
DOMAIN=search.yourdomain.com
CORS_ORIGIN=https://search.yourdomain.com
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=60
MOCK_SEARCH=false
```

---

## Step 6: Start the Application Stack

```bash
docker compose up -d --build
```

---

## Step 7: Verify the Deployment

```bash
docker compose ps
curl -I https://search.yourdomain.com/health
curl -s https://search.yourdomain.com/health
```

Expected JSON:
```json
{
  "status": "ok",
  "service": "zenvora-api",
  "uptimeSeconds": 42,
  "upstreamSearxng": {
    "reachable": true,
    "latencyMs": 18
  }
}
```

---

## Step 8: Maintenance, Logs, and Updates

```bash
# View logs
docker compose logs -f

# Update Zenvora
git pull origin main
docker compose up -d --build
docker image prune -f

# Backup configuration
tar -czvf zenvora-backup-$(date +%F).tar.gz .env searxng/settings.yml caddy/Caddyfile
```
