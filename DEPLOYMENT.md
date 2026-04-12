# KAG QR Code App - Deployment Guide

## Prerequisites

- Docker and Docker Compose installed
- Domain name pointing to your server (A records for domain and traefik subdomain)
- Ports 80 and 443 available

## Production Deployment with Docker Compose

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/kag-qrcode.git
cd kag-qrcode
```

### 2. Create Production Environment File

```bash
cp .env.production.example .env
```

### 3. Edit `.env` File

```bash
nano .env  # or use your preferred editor
```

Update these critical values:

```env
# Your actual domain
DOMAIN=connect.kagegypt.com
ACME_EMAIL=admin@kagegypt.com
APP_NAME=KAG

# Database credentials
POSTGRES_DB=kag
POSTGRES_USER=postgres
POSTGRES_PASSWORD=YOUR_STRONG_PASSWORD_HERE

# Generate with: openssl rand -base64 32
AUTH_SECRET=YOUR_GENERATED_SECRET_HERE
```

### 4. Generate AUTH_SECRET

```bash
openssl rand -base64 32
```

Copy the output and paste it as `AUTH_SECRET` in your `.env` file.

### 5. Start the Application

```bash
# Pull images and start services
docker compose up -d

# Check if services are running
docker compose ps

# View logs
docker compose logs -f app
```

### 6. Initialize Database

Wait for the database to be healthy, then run migrations and seed:

```bash
# Push database schema
docker compose exec app npm run db:push

# Seed initial data (creates super admin user)
docker compose exec app npm run db:seed
```

### 7. Access the Application

- **Main app**: https://connect.kagegypt.com
- **Traefik dashboard**: https://traefik.connect.kagegypt.com

**Default super admin credentials** (created by seed):
- Email: `admin@kagegypt.com`
- Password: `Admin@123!`

⚠️ **IMPORTANT**: Change the admin password immediately after first login!

## SSL Certificates

Traefik automatically obtains Let's Encrypt SSL certificates. Certificates are stored in the `letsencrypt` volume and will auto-renew.

## Backup and Maintenance

### Backup Database

```bash
docker compose exec db pg_dump -U postgres kag > backup_$(date +%Y%m%d).sql
```

### Restore Database

```bash
cat backup_20240101.sql | docker compose exec -T db psql -U postgres kag
```

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f app
docker compose logs -f db
docker compose logs -f traefik
```

### Restart Services

```bash
# Restart all
docker compose restart

# Restart specific service
docker compose restart app
```

### Update Application

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker compose up -d --build
```

## Troubleshooting

### App won't start

Check logs:
```bash
docker compose logs app
```

### Database connection errors

Verify database is healthy:
```bash
docker compose ps db
```

### SSL certificate issues

Check Traefik logs:
```bash
docker compose logs traefik
```

Verify DNS:
```bash
nslookup connect.kagegypt.com
nslookup traefik.connect.kagegypt.com
```

### Port already in use

Check if ports 80/443 are available:
```bash
sudo lsof -i :80
sudo lsof -i :443
```

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DOMAIN` | Your domain name | `connect.kagegypt.com` |
| `ACME_EMAIL` | Email for Let's Encrypt | `admin@kagegypt.com` |
| `APP_NAME` | Application name | `KAG` |
| `POSTGRES_DB` | Database name | `kag` |
| `POSTGRES_USER` | Database user | `postgres` |
| `POSTGRES_PASSWORD` | Database password | (strong password) |
| `AUTH_SECRET` | NextAuth secret | (generated with openssl) |

## Security Checklist

- [ ] Change default admin password
- [ ] Use strong database password
- [ ] Keep AUTH_SECRET secure
- [ ] Enable firewall (allow only 80, 443, and SSH)
- [ ] Regular backups
- [ ] Monitor logs
- [ ] Keep Docker images updated

## Stack

- **Runtime**: Bun 1.2
- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL 16
- **ORM**: Drizzle
- **Auth**: NextAuth v5
- **Reverse Proxy**: Traefik v3
- **SSL**: Let's Encrypt (automatic)

## Support

For issues, check logs first:
```bash
docker compose logs -f
```
