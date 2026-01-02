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

2. Create a `.env` file in the backend root directory:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sports_platform
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
```

3. Create the PostgreSQL database:
```sql
CREATE DATABASE sports_platform;
```

4. Initialize the database tables:
```bash
node scripts/initDb.js
```

5. Seed the database with sample data:
```bash
npm run seed
```

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

