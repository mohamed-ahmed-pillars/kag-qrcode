# Cityfirstfoods QR Code App

A modern QR code and link management system built with Next.js 16, featuring employee cards, product showcases, social links, and analytics tracking.

## Features

- 🔗 **Social Link Management** - Linktree-style landing page
- 👥 **Employee Cards** - Digital business cards with QR codes
- 📦 **Product Showcase** - Product pages with tracking
- 📊 **Analytics Dashboard** - View tracking and click analytics
- 🔐 **Role-Based Access Control** - Super Admin, Admin, Editor, Viewer roles
- 🎨 **Instagram-Style QR Codes** - Branded QR codes with rounded corners
- 📱 **Responsive Design** - Mobile-first UI with Tailwind CSS v4
- 🐳 **Docker Ready** - Production deployment with Docker Compose + Traefik

## Quick Start (Development)

```bash
# Start database
docker compose -f docker-compose.dev.yml up -d

# Install dependencies
bun install

# Set up database
bun run db:push
bun run db:seed

# Start development server
bun run dev
```

Visit http://localhost:3000

**Default admin login:**
- Email: `admin@cityfirstfoods.com`
- Password: `Admin@123!`

## Production Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete deployment instructions.

Quick deploy:
```bash
# Create .env from example
cp .env.production.example .env

# Edit .env with your domain and secrets
nano .env

# Start services
docker compose up -d

# Initialize database
docker compose exec app bun run db:push
docker compose exec app bun run db:seed
```

## Tech Stack

- **Runtime**: Bun 1.2
- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL 16
- **ORM**: Drizzle
- **Auth**: NextAuth v5
- **UI**: shadcn/ui + Tailwind CSS v4
- **Deployment**: Docker + Traefik

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Main social links page
│   ├── e/[id]/page.tsx       # Employee card page
│   ├── p/[id]/page.tsx       # Product page
│   ├── a/[id]/page.tsx       # Ad/promotion page
│   ├── dashboard/            # Admin dashboard
│   └── api/                  # API routes
├── components/
│   ├── public/               # Public-facing components
│   └── dashboard/            # Dashboard components
├── lib/
│   ├── schema.ts             # Database schema
│   ├── auth.ts               # Authentication config
│   ├── rbac.ts               # Role-based access control
│   └── qrcode-branded.ts     # QR code generator
└── proxy.ts                  # Middleware (Next.js 16)
```

## Features Overview

### Public Pages

- **`/`** - Social links carousel (Linktree-style)
- **`/e/[id]`** - Employee card with contact info
- **`/p/[id]`** - Product detail page
- **`/a/[id]`** - Ad/promotion banner

### Dashboard (Protected)

- **`/dashboard`** - Overview and analytics
- **`/dashboard/social-links`** - Manage social links
- **`/dashboard/employees`** - Manage employee cards
- **`/dashboard/products`** - Manage products
- **`/dashboard/ads`** - Manage promotions
- **`/dashboard/users`** - User management (Super Admin only)
- **`/dashboard/analytics`** - View tracking data

### User Roles

| Role | Permissions |
|------|-------------|
| **Viewer** | View dashboard and analytics |
| **Editor** | Create, edit, and delete content |
| **Admin** | All editor permissions + user management (non-super-admin) |
| **Super Admin** | Full system access |

## API Endpoints

### QR Code Generation

```
GET /api/qrcode?url=https://example.com&format=branded&size=1024
```

Formats: `png`, `svg`, `branded` (Instagram-style)

### Analytics Tracking

```
POST /api/track/social_link/[id]
POST /api/track/employee/[id]
POST /api/track/product/[id]
POST /api/track/ad/[id]
```

## Environment Variables

Development (`.env`):
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/cityfirstfoods
AUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000
```

Production (`.env`):
```env
DOMAIN=yourdomain.com
ACME_EMAIL=admin@yourdomain.com
POSTGRES_PASSWORD=strong-password
AUTH_SECRET=generated-secret
```

## Development Commands

```bash
bun run dev          # Start dev server
bun run build        # Build for production
bun run start        # Start production server
bun run db:push      # Push schema to database
bun run db:seed      # Seed initial data
bun run db:studio    # Open Drizzle Studio
```

## License

Private - All rights reserved
