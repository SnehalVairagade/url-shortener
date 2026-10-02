# Deployment Guide — URL Shortener

This document describes the production deployment strategy for the URL Shortener API.

##  Deployment Architecture
The application is designed as a **Stateless API**, allowing it to be scaled horizontally across multiple containers or serverless instances.

### Stack
- **Runtime**: Node.js 20 (Alpine)
- **Database**: PostgreSQL 16 (Persistent Storage)
- **Cache**: Redis 7 (Ephemeral Speed Layer)
- **Containerization**: Docker & Docker Compose

---

##  Deployment Steps

### 1. Infrastructure Setup
We recommend using a PaaS like **Render**, **Railway**, or **Fly.io** for a balance of simplicity and professional control.

**Required Resources:**
- One Managed PostgreSQL instance.
- One Managed Redis instance.
- One Web Service (Docker-based).

### 2. Environment Configuration
The following secrets must be configured in the production environment dashboard:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `PORT` | Port the server listens on | `3000` |
| `NODE_ENV` | Environment mode | `production` |
| `DATABASE_URL` | Connection string for Postgres | `postgresql://user:pass@host:5432/db` |
| `REDIS_URL` | Connection string for Redis | `redis://host:6379` |

### 3. The CI/CD Pipeline
The ideal deployment flow is:
`Git Push` $\rightarrow$ `GitHub Actions/Render Build` $\rightarrow$ `Prisma Migrate` $\rightarrow$ `Application Start`

#### Critical: Database Migrations
In production, **never** use `prisma migrate dev`. Instead, use:
```bash
npx prisma migrate deploy
```
**Why?** `migrate deploy` applies pending migrations without attempting to reset the database or prompt for manual intervention, making it safe for automated pipelines.

---

##  Production Hardening

### Process Management
The application is built to be run using the compiled JavaScript output:
```bash
npm run build  # Compiles TS to JS via tsc
npm start       # Runs the compiled JS via node
```

### Health Monitoring
The `/` endpoint serves as a basic heartbeat check for the load balancer to ensure the container is healthy.

### Scaling
Because we use **Redis** for caching and **PostgreSQL** for persistence, we can spin up multiple instances of the `app` container. All instances will share the same cache and database, ensuring consistent behavior across the cluster.
