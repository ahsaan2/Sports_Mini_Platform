const pool = require('../config/database');

const createTables = async () => {
  try {
    if (!pool.isConfigured) {
      throw new Error('DB_PASSWORD is not set. Please set DB_PASSWORD in backend/.env (copy .env.example) and rerun `npm run init-db`.');
    }

    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Games table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS games (
        id SERIAL PRIMARY KEY,
        game_name VARCHAR(255) NOT NULL,
        sport VARCHAR(100),
        provider VARCHAR(100),
        league VARCHAR(255),
        category VARCHAR(100),
        team_a VARCHAR(255),
        team_b VARCHAR(255),
        start_time TIMESTAMP,
        game_type VARCHAR(50) NOT NULL CHECK (game_type IN ('sports', 'casino')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Favorites table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, game_id)
      )
    `);

    console.log('Tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
};

// Run if called directly
if (require.main === module) {
  createTables()
    .then(() => {
      console.log('Database initialization completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database initialization failed:', error);
      process.exit(1);
    });
}

module.exports = createTables;

