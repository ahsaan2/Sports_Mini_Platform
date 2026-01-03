const app = require('./app');
const pool = require('./config/database');

const PORT = process.env.PORT || 5000;

// Test DB connectivity on startup
if (pool.isConfigured) {
  pool.query('SELECT NOW()')
    .then(async () => {
      console.log('Database connection test succeeded');

      // Optional: run init and seed on first deploy when explicitly enabled
      // Controlled via RUN_INIT_ON_DEPLOY=true and optional FORCE_SEED=true
      if (process.env.RUN_INIT_ON_DEPLOY === 'true') {
        try {
          console.log('RUN_INIT_ON_DEPLOY=true detected — running database initialization and seed (if applicable)');
          const createTables = require('./scripts/initDb');
          const seedData = require('./scripts/seed');
          await createTables();
          await seedData();
          console.log('Auto init/seed completed');
        } catch (err) {
          console.error('Auto init/seed failed:', err);
        }
      }

    })
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

