# Deployment Guide — URL Shortener

This document describes the production deployment strategy for the URL Shortener API.

## Deployment Architecture

The application is designed as a **stateless API**, allowing it to be scaled horizontally across multiple containers or serverless instances.

### Stack

- **Runtime**: Node.js 20 (Alpine)
- **Database**: PostgreSQL 16 (Persistent Storage)
- **Cache**: Redis 7 (Ephemeral Speed Layer)
- **Containerization**: Docker & Docker Compose

---

## Deployment Steps

### 1. Infrastructure Setup

The application can be deployed using a PaaS such as **Render**, **Railway**, or **Fly.io**, or using another Docker-compatible hosting platform.

**Required Resources:**

- One managed PostgreSQL instance
- One managed Redis instance
- One web service running the Docker image

### 2. Environment Configuration

The following environment variables must be configured in the production environment:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `PORT` | Port the server listens on | `3000` |
| `NODE_ENV` | Environment mode | `production` |
| `DATABASE_URL` | Connection string for PostgreSQL | `postgresql://user:password@host:5432/db` |
| `REDIS_URL` | Connection string for Redis | `redis://host:6379` |

> **Security**: Never commit production credentials or secrets to Git. Configure them through the hosting provider's environment-variable settings.

### 3. Build and Start

The production container should build the application and run the compiled JavaScript output.

```bash
npm run build
npm start
```

The Docker image can be used directly by a Docker-compatible hosting provider.

### 4. Database Migrations

Before starting the application against a production database, apply all pending Prisma migrations:

```bash
npx prisma migrate deploy
```

**Important**: Do not use `prisma migrate dev` in production. `prisma migrate deploy` applies the migrations already defined in the repository without creating development migrations or resetting the database.

---

## CI/CD Pipeline

A typical deployment flow is:

`Git Push` $\rightarrow$ `Build Docker Image` $\rightarrow$ `Run Database Migrations` $\rightarrow$ `Start Application` $\rightarrow$ `Health Check`

This process can be automated using GitHub Actions or the CI/CD functionality provided by the hosting platform.

---

## Production Hardening

### Process Management
The application is designed to run using the compiled JavaScript output:
```bash
npm run build
npm start
```

### Health Monitoring
The `/` endpoint can be used as a basic health/heartbeat endpoint by the hosting platform or load balancer.

### Scaling
The API is designed to be stateless, so multiple application instances can run simultaneously. All instances can share:
- **PostgreSQL** for persistent application data.
- **Redis** for shared caching.

This allows the application layer to scale horizontally without requiring local application state.

---

## Important Production Considerations
- Use managed PostgreSQL with persistent storage.
- Use a managed Redis instance.
- Store credentials only in environment variables.
- Use `prisma migrate deploy` for production migrations.
- Do not commit `.env` files or production secrets.
- Configure the hosting platform to use the application's health endpoint.
