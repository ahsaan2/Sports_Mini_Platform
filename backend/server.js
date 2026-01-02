const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/games', require('./routes/games'));
app.use('/favorites', require('./routes/favorites'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Test DB connectivity on startup
const pool = require('./config/database');
if (pool.isConfigured) {
  pool.query('SELECT NOW()')
    .then(() => console.log('Database connection test succeeded'))
    .catch((err) => {
      console.error('Database connection test failed:', err.message);
      if (err.message && err.message.includes('SASL')) {
        console.error('Auth issue detected. Ensure DB_PASSWORD is set to a valid string in your .env and that your Postgres server accepts the provided credentials.');
      }
    });
} else {
  console.warn('Database not fully configured (DB_PASSWORD missing). Skipping DB connection test.');
}

// Start server with robust error handling for EADDRINUSE
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

server.on('error', (err) => {
  console.error('Server failed to start:', err.message);
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Stop the process using the port or change PORT in .env.`);
  }
  process.exit(1);
});

