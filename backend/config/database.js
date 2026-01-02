const { Pool } = require('pg');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'sports_platform',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '', // ensure a string to avoid pg SASL error
};

if (!process.env.DB_PASSWORD) {
  console.warn('Warning: DB_PASSWORD is not set. Skipping DB authentication check; set DB_PASSWORD in .env for development/production.');
}

const pool = new Pool(dbConfig);

// Mark whether a non-empty DB password was provided (helpful for startup checks)
pool.isConfigured = Boolean(dbConfig.password && dbConfig.password !== '');

pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

// Log errors but do not force exit here; let callers decide how to proceed
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

module.exports = pool;

