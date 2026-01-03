# Sports Mini Platform - Backend

Backend API for the Sports/Casino Games Platform built with Node.js, Express, and PostgreSQL.

## Tech Stack

- Node.js
- Express.js
- PostgreSQL
- JWT (JSON Web Tokens) for authentication
- bcryptjs for password hashing

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the backend root directory (or copy `.env.example` and set values):
```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sports_platform
DB_USER=postgres
DB_PASSWORD=your_password_here # required for DB connection (SCRAM/MD5 auth)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
```

Note: If `DB_PASSWORD` is not set, the server will start but database-related endpoints will fail. For local development, set `DB_PASSWORD` to your Postgres password, then run `node scripts/initDb.js` and `npm run seed` to initialize and seed the DB.

3. Create the PostgreSQL database:
```sql
CREATE DATABASE sports_platform;
```

4. Initialize the database tables (after running Postgres):
```bash
# Option A: Local Postgres (make sure DB_PASSWORD is set in .env)
node scripts/initDb.js

# Option B: Use Docker (recommended for easy setup)
# 1) Ensure you have Docker installed
# 2) From this folder run: `npm run docker:up` (will start Postgres using your `.env` values)
# 3) Wait until the DB container healthcheck is healthy, then run:
node scripts/initDb.js
```

5. Seed the database with sample data:
```bash
npm run seed
```

### Deployment & One-time DB Initialization
For hosting providers that do not allow shell access (e.g., Render free tier), the app can optionally perform an idempotent init and seed on startup.

Environment variables:
- `RUN_INIT_ON_DEPLOY=true` — If set, the service will attempt to run the DB initialization and seed after a successful DB connection on startup.
- `FORCE_SEED=true` — When set, the seed script will clear `favorites` and `games` tables and re-insert sample data (use with caution).

Recommended workflow when you cannot access a shell:
1. Set `DB_*` env vars or `DATABASE_URL` in your hosting provider and set `JWT_SECRET`.
2. Set `RUN_INIT_ON_DEPLOY=true` and deploy the service.
3. After deploy succeeds and logs indicate `Auto init/seed completed`, remove `RUN_INIT_ON_DEPLOY` or set it to `false` to avoid re-running on every restart.

Notes:
- The default seed behavior is non-destructive and will only insert sample data when the `games` table is empty. Use `FORCE_SEED=true` only when you want to reset seeded data.

Docker notes:
- The Docker Compose file (`docker-compose.yml`) in the `backend/` folder uses the environment values in `.env` (copy `.env.example`).
- Start/stop Docker container:
  - `npm run docker:up`  # start Postgres container
  - `npm run docker:down`  # stop and remove container
- After starting Docker, run `npm run init-db` and `npm run seed` to prepare the DB for the app.

6. Start the server:
```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

The server will run on `http://localhost:5000`

## API Endpoints

### Authentication

- `POST /auth/register` - Register a new user
  - Body: `{ "name": "string", "email": "string", "password": "string" }`
  - Returns: `{ "token": "string", "user": {...} }`

- `POST /auth/login` - Login user
  - Body: `{ "email": "string", "password": "string" }`
  - Returns: `{ "token": "string", "user": {...} }`

### Games

- `GET /games` - Get all games/matches (Protected)
  - Query params: `?filter=sport_name&type=sport` or `?filter=provider_name&type=provider`
  - Headers: `Authorization: Bearer <token>`
  - Returns: Array of games with `is_favorite` field

- `GET /games/sports` - Get all unique sports (Protected)
  - Returns: Array of sport names

- `GET /games/providers` - Get all unique providers (Protected)
  - Returns: Array of provider names

### Favorites

- `GET /favorites` - Get all favorite games (Protected)
  - Headers: `Authorization: Bearer <token>`
  - Returns: Array of favorite games

- `POST /favorites/:gameId` - Add game to favorites (Protected)
  - Headers: `Authorization: Bearer <token>`
  - Returns: Success message

- `DELETE /favorites/:gameId` - Remove game from favorites (Protected)
  - Headers: `Authorization: Bearer <token>`
  - Returns: Success message

### Health Check

- `GET /health` - Check server status
  - Returns: `{ "status": "OK", "message": "Server is running" }`

## Database Schema

### Users Table
- `id` (SERIAL PRIMARY KEY)
- `name` (VARCHAR)
- `email` (VARCHAR UNIQUE)
- `password` (VARCHAR - hashed)
- `created_at` (TIMESTAMP)

### Games Table
- `id` (SERIAL PRIMARY KEY)
- `game_name` (VARCHAR)
- `sport` (VARCHAR) - for sports matches
- `provider` (VARCHAR) - for casino games
- `league` (VARCHAR) - for sports matches
- `category` (VARCHAR) - for casino games
- `team_a` (VARCHAR) - for sports matches
- `team_b` (VARCHAR) - for sports matches
- `start_time` (TIMESTAMP) - for sports matches
- `game_type` (VARCHAR) - 'sports' or 'casino'
- `created_at` (TIMESTAMP)

### Favorites Table
- `id` (SERIAL PRIMARY KEY)
- `user_id` (INTEGER REFERENCES users(id))
- `game_id` (INTEGER REFERENCES games(id))
- `created_at` (TIMESTAMP)
- UNIQUE constraint on (user_id, game_id)

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

Error responses follow the format:
```json
{
  "error": "Error message"
}
```

