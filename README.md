#  Industry-Ready URL Shortener

A production-grade URL shortening system built with a focus on backend engineering first principles. This project is not just about functionality, but about solving real-world distributed systems problems like race conditions, database bottlenecks, and API abuse.

##  Tech Stack
- **Runtime**: Node.js (TypeScript)
- **Framework**: Express
- **Database**: PostgreSQL (via Prisma ORM)
- **Cache**: Redis
- **Validation**: Zod
- **Testing**: Vitest & Supertest
- **Infrastructure**: Docker & Docker Compose

---

##  Engineering Narrative (The "Why")

Instead of just adding features, this project was built by identifying and solving specific engineering challenges:

### 1. Solving Race Conditions (Atomic Increments)
**Problem**: In a high-traffic system, a "read-modify-write" cycle for counting clicks leads to "lost updates" where multiple concurrent requests overwrite each other.
**Solution**: Implemented **Atomic Increments** directly in the database engine, ensuring click counts remain accurate regardless of concurrency.

### 2. Optimizing Retrieval (Redis Cache-Aside)
**Problem**: Querying PostgreSQL on every single redirect creates a massive bottleneck during viral traffic spikes.
**Solution**: Implemented a **Cache-Aside pattern** with Redis. Most requests are now served in microseconds from memory, with a background update to the DB to maintain metrics.

### 3. Performance at Scale (B-Tree Indexing)
**Problem**: Scanning millions of URLs for a short code would result in $O(N)$ time complexity.
**Solution**: Leveraged PostgreSQL's `@unique` constraint to automatically create a **B-Tree Index**, ensuring lookups remain $O(\log N)$ even as the database grows.

### 4. API Robustness (Rate Limiting & Error Handling)
**Problem**: Public endpoints are vulnerable to DoS attacks and inconsistent error responses.
**Solution**: 
- Integrated `express-rate-limit` to prevent abuse.
- Established a standardized JSON error architecture (`{ error, message }`) across the entire API.

---

##  Getting Started

### Option A: Quick Start with Docker (Recommended)
```bash
docker-compose up --build
```
The API will be available at `http://localhost:3000`.

### Option B: Local Development
1. **Clone the repo**
2. **Install dependencies**: `npm install`
3. **Setup Environment**: Copy `.env.example` to `.env` and add your database credentials.
4. **Sync Database**: `npx prisma migrate dev`
5. **Start Server**: `npm run dev`

---

##  API Documentation

### `POST /shorten`
Creates a shortened URL.
- **Body**: `{ "url": "https://example.com", "expiresAt": "ISO-Date (optional)" }`
- **Response**: `{ "shortCode": "abc123" }`

### `GET /:shortCode`
Retrieves the original URL and increments click count.
- **Response**: `302 Found` (Redirect to original URL)
- **Errors**: `404 Not Found` (Missing link), `410 Gone` (Expired link), `429 Too Many Requests`.

---

##  Testing
Run the full test suite (Unit, Controller, and Integration tests):
```bash
npm test
```
