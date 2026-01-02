const pool = require('../config/database');

const requireDb = (req, res, next) => {
  if (!pool.isConfigured) {
    return res.status(503).json({ error: 'Database not configured. Set DB_PASSWORD in .env and restart the server.' });
  }
  next();
};

module.exports = requireDb;
