# 🐳 Self-Hosting MSTREAM with Docker

This guide explains how to self-host **MSTREAM** using Docker and Docker Compose on any operating system (Linux VPS, macOS, Windows WSL2, or a local server).

---

## 🏗️ Architecture Overview

The MSTREAM Docker implementation is designed for production efficiency, extreme portability, and security:

1. **Multi-Stage Build (`Dockerfile`)**:
   - **Build Stage**: Uses `node:20-alpine` and `pnpm` to compile the optimized React 19 production bundle.
   - **Runtime Stage**: Copies the pre-built static assets into an ultra-lean `nginx:alpine` image (~30 MB).
2. **Server-Side API Reverse Proxy**:
   - The browser makes requests to `/api/*`.
   - Nginx intercepts `/api/*` and proxies directly to `https://api.themoviedb.org/3/` using SNI (`proxy_ssl_server_name on;`).
   - Your secret TMDB Read Access Token is injected on the server side via Nginx headers and is **never** leaked to the client bundle.
3. **HTML5 History API Routing**:
   - Nginx handles client-side routing (`/movies`, `/tv-shows`, `/library`, `/watch`) seamlessly using `try_files $uri $uri/ /index.html;`.
4. **PWA & Asset Caching**:
   - Static assets (`/assets/*`) are cached with immutable 6-month headers.
   - Service workers (`sw.js`) and manifests are served with `no-store` headers to ensure instant updates.

---

## 🚀 Quick Start (Docker Compose — Recommended)

### 1. Clone the Repository

```bash
git clone https://github.com/cd-Crypton/mstream.git
cd mstream
```

### 2. Configure Your Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Open `.env` and set your TMDB API Read Access Token (free from [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)):

```ini
TMDB_READ_ACCESS_TOKEN=your_actual_tmdb_read_access_token_here
HOST_PORT=8080
```

> **Note**: Both `TMDB_READ_ACCESS_TOKEN` and `VITE_TMDB_READ_ACCESS_TOKEN` are supported interchangeably.

### 3. Start the Container

```bash
docker compose up -d
```

That's it! MSTREAM is now running at:
👉 **`http://localhost:8080`** (or your server's IP: `http://YOUR_SERVER_IP:8080`)

To view live container logs:
```bash
docker compose logs -f
```

To stop the container:
```bash
docker compose down
```

---

## 📦 Running with Standalone Docker CLI

If you prefer not using Docker Compose, you can build and run the image directly:

### 1. Build the Docker Image

```bash
docker build -t mstream:latest .
```

### 2. Run the Container

```bash
docker run -d \
  --name mstream \
  -p 8080:80 \
  -e TMDB_READ_ACCESS_TOKEN="your_actual_tmdb_read_access_token_here" \
  --restart unless-stopped \
  mstream:latest
```

---

## 🌐 Deploying on a VPS with Custom Domain & SSL

When deploying to a public VPS (e.g. DigitalOcean, Hetzner, Linode, AWS), it is best practice to place MSTREAM behind an SSL reverse proxy.

### Option A: Caddy (Simplest with Automatic HTTPS)

Create a `Caddyfile`:

```caddyfile
mstream.yourdomain.com {
    reverse_proxy localhost:8080
}
```

Start Caddy:
```bash
caddy run
```
Caddy will automatically provision and renew a free Let's Encrypt SSL certificate.

---

### Option B: Nginx Proxy Manager (GUI)

1. Open your Nginx Proxy Manager web interface.
2. Click **Add Proxy Host**.
3. **Domain Names**: `mstream.yourdomain.com`
4. **Forward Hostname / IP**: `127.0.0.1` (or container name if on the same Docker network)
5. **Forward Port**: `8080`
6. Enable **Block Common Exploits** and **Websockets Support**.
7. Under **SSL**, choose **Request a new SSL Certificate** and check **Force SSL**.

---

### Option C: Cloudflare Tunnel (Zero Open Firewall Ports)

A Cloudflare Tunnel connects your server securely to Cloudflare's edge network via an outbound connection. **No port forwarding or open inbound ports (80, 443, 8080) are required** on your router or VPS firewall (`ufw default deny incoming`).

#### Method 1: Cloudflare Zero Trust Dashboard (Recommended - 2 Minutes)

1. Open the [Cloudflare Zero Trust Dashboard](https://one.dash.cloudflare.com/).
2. Navigate to **Networks** ➔ **Tunnels** ➔ click **Create a tunnel**.
3. Choose **Cloudflared** as the connector type and click **Next**.
4. Name your tunnel (e.g., `mstream`) and click **Save tunnel**.
5. Choose your environment (Docker, Linux, Windows, macOS) and copy the provided command containing your `TUNNEL_TOKEN`.
   - **Docker CLI**:
     ```bash
     docker run -d --name cloudflared --restart unless-stopped \
       cloudflare/cloudflared:latest tunnel --no-autoupdate run --token <YOUR_TUNNEL_TOKEN>
     ```
6. In the dashboard, click **Next** to configure the **Public Hostnames**:
   - **Subdomain**: `mstream` (or leave empty for root)
   - **Domain**: Select your domain (e.g., `yourdomain.com`)
   - **Path**: (leave empty)
   - **Service Type**: `HTTP`
   - **URL**: `localhost:8080` (or `mstream:80` if using the Docker Compose network below)
7. Click **Save hostname**. Cloudflare will automatically configure the DNS CNAME record and issue an edge SSL certificate!

---

#### Method 2: All-in-One Docker Compose (Container-to-Container)

To keep MSTREAM completely isolated without exposing port 8080 on the host machine at all:

1. Obtain your `TUNNEL_TOKEN` from the Cloudflare Dashboard (as shown above).
2. Add `TUNNEL_TOKEN` to your `.env` file:
   ```env
   TMDB_READ_ACCESS_TOKEN=your_tmdb_token_here
   TUNNEL_TOKEN=eyJhIjoi...
   ```
3. Add the `cloudflared` service directly to `docker-compose.yml`:
   ```yaml
   services:
     mstream:
       build:
         context: .
         dockerfile: Dockerfile
       container_name: mstream
       restart: unless-stopped
       environment:
         - TMDB_READ_ACCESS_TOKEN=${TMDB_READ_ACCESS_TOKEN}
       # Notice: No 'ports' section needed! Cloudflared accesses mstream via the internal network.
       networks:
         - mstream-net

     cloudflared:
       image: cloudflare/cloudflared:latest
       container_name: cloudflared
       restart: unless-stopped
       command: tunnel --no-autoupdate run --token ${TUNNEL_TOKEN}
       depends_on:
         - mstream
       networks:
         - mstream-net

   networks:
     mstream-net:
       driver: bridge
   ```
4. In Cloudflare Dashboard under Public Hostname:
   - Service Type: `HTTP`
   - URL: `mstream:80` (uses Docker's internal DNS!)

---

#### Method 3: Cloudflare CLI (`cloudflared` Config File)

For headless VPS setups using a local configuration file:

1. Install `cloudflared`:
   ```bash
   # Debian / Ubuntu
   curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg | sudo tee /usr/share/keyrings/cloudflare-main.gpg >/dev/null
   echo 'deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared jammy main' | sudo tee /etc/apt/sources.list.d/cloudflared.list
   sudo apt-get update && sudo apt-get install -y cloudflared
   ```
2. Authenticate:
   ```bash
   cloudflared tunnel login
   ```
3. Create your tunnel:
   ```bash
   cloudflared tunnel create mstream
   ```
   *(Save the Tunnel ID printed in the output)*
4. Create `~/.cloudflared/config.yml`:
   ```yaml
   tunnel: <YOUR-TUNNEL-UUID>
   credentials-file: /root/.cloudflared/<YOUR-TUNNEL-UUID>.json

   ingress:
     - hostname: mstream.yourdomain.com
       service: http://localhost:8080
     - service: http_status:404
   ```
5. Route DNS to your tunnel:
   ```bash
   cloudflared tunnel route dns mstream mstream.yourdomain.com
   ```
6. Install and run `cloudflared` as a system service:
   ```bash
   sudo cloudflared service install
   sudo systemctl start cloudflared
   sudo systemctl enable cloudflared
   ```

---

## ⚙️ Environment Variables Reference

| Variable | Description | Default | Required |
| :--- | :--- | :--- | :--- |
| `TMDB_READ_ACCESS_TOKEN` | TMDB API v3 Read Access Token | `""` | **Yes** (for catalog & details) |
| `VITE_TMDB_READ_ACCESS_TOKEN` | Supported fallback alias for token | `""` | Optional |
| `HOST_PORT` | Host port mapped by `docker-compose.yml` | `8080` | Optional |
| `PORT` | Internal port Nginx listens on inside container | `80` | Optional |

---

## 🔄 Updating MSTREAM

To pull the latest changes and rebuild:

```bash
git pull origin main
docker compose build --no-cache
docker compose up -d
```

---

## 🛠️ Troubleshooting & FAQs

### 1. "Content Not Found" or Catalog won't load
- Make sure `TMDB_READ_ACCESS_TOKEN` is set in your `.env` or passed via `-e`.
- Check container logs to verify token detection:
  ```bash
  docker logs mstream
  ```
  You should see: `✓ TMDB Read Access Token detected. Setting up API reverse proxy.`

### 2. Port conflict (`address already in use: 8080`)
- Change `HOST_PORT=8080` in `.env` to any free port, e.g. `HOST_PORT=3000` or `HOST_PORT=9090`.

### 3. Container health check fails
- Verify that Nginx is running inside the container:
  ```bash
  docker compose ps
  ```
- Test internal health manually:
  ```bash
  docker exec -it mstream curl -I http://localhost/
  ```
