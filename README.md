# Industry-Ready URL Shortener

A production-grade URL shortening system built with a focus on backend engineering first principles. This project is not just about functionality, but about solving real-world distributed systems problems like race conditions, database bottlenecks, and API abuse.

## Tech Stack

- **Runtime**: Node.js (TypeScript)
- **Framework**: Express
- **Database**: PostgreSQL (via Prisma ORM)
- **Cache**: Redis
- **Validation**: Zod
- **Testing**: Vitest & Supertest
- **Infrastructure**: Docker & Docker Compose

---

## Engineering Narrative (The "Why")

Instead of just adding features, this project was built by identifying and solving specific engineering challenges:

### 1. Solving Race Conditions (Atomic Increments)

**Problem**: In a high-traffic system, a "read-modify-write" cycle for counting clicks leads to "lost updates" where multiple concurrent requests overwrite each other.

**Solution**: Implemented **atomic increments** directly in the database engine, ensuring click counts remain accurate regardless of concurrency.

### 2. Optimizing Retrieval (Redis Cache-Aside)

**Problem**: Querying PostgreSQL on every single redirect creates a bottleneck during high-traffic spikes.

**Solution**: Implemented a **cache-aside pattern** with Redis. Most requests are served from memory, while the database is updated to maintain click metrics.

### 3. Performance at Scale (B-Tree Indexing)

**Problem**: Scanning millions of URLs for a short code would result in `O(N)` lookup time.

**Solution**: Leveraged PostgreSQL's `@unique` constraint to automatically create a **B-Tree index**, ensuring lookups remain `O(log N)` as the database grows.

### 4. API Robustness (Rate Limiting & Error Handling)

**Problem**: Public endpoints are vulnerable to abuse and inconsistent error responses.

**Solution**:
- Integrated `express-rate-limit` to prevent excessive requests.
- Established a standardized JSON error architecture using `{ error, message }` across the API.

---

## Getting Started

The easiest way to run this project is using Docker, which automatically sets up the Node.js application, PostgreSQL, and Redis.

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.
- [Git](https://git-scm.com/) installed.

### 1. Clone the Repository

```bash
git clone https://github.com/SnehalVairagade/url-shortener.git
cd url-shortener
```

### 2. Start the Application

```bash
docker compose up --build
```
This command builds the application image and starts the app, PostgreSQL, and Redis containers.

The API will be available at: `http://localhost:3000`

### 3. Run Database Migrations

In a new terminal window, run:

```bash
docker compose exec app npx prisma migrate deploy
```
This applies all pending Prisma migrations to the PostgreSQL database.

### 4. Test the API

**Create a Shortened URL**

On Windows:
```bash
curl.exe -X POST http://localhost:3000/shorten -H "Content-Type: application/json" -d "{\"url\":\"https://www.google.com\"}"
```

**Example response:**
```json
{
  "message": "URL shortened successfully",
  "shortCode": "cwVPcS"
}
```
*The shortCode will be different for each request.*

**Visit the Shortened URL**

Open the following in your browser:
`http://localhost:3000/<shortCode>`

For example: `http://localhost:3000/cwVPcS`

The API should return a `302 Found` response and redirect you to the original URL.

---

## Testing

To run the full test suite, including unit, controller, and integration tests:

```bash
npm test
```

If the application is running through Docker, run the tests inside the application container:

```bash
docker compose exec app npm test
```

---

## API Documentation

### `POST /shorten`
Creates a shortened URL.

**Request Body:**
```json
{
  "url": "https://example.com",
  "expiresAt": "ISO-Date (optional)"
}
```

**Response:**
```json
{
  "message": "URL shortened successfully",
  "shortCode": "abc123"
}
```

### `GET /:shortCode`
Retrieves the original URL and increments the click count.

**Response**: `302 Found` (The client is redirected to the original URL).

**Possible Errors**:
- `404 Not Found` — Short URL does not exist.
- `410 Gone` — Short URL has expired.
- `429 Too Many Requests` — Rate limit exceeded.

---

## Stopping the Application

To stop the containers:
```bash
docker compose down
```

To stop the containers and remove the associated Docker volumes:
```bash
docker compose down -v
```
**Warning**: `docker compose down -v` removes the PostgreSQL Docker volume and therefore deletes the local database data.
