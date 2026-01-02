const express = require('express');
const pool = require('../config/database');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Get all games/matches (protected route)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { filter, type } = req.query;
    let query = `
      SELECT 
        g.*,
        CASE 
          WHEN f.id IS NOT NULL THEN true 
          ELSE false 
        END as is_favorite
      FROM games g
      LEFT JOIN favorites f ON g.id = f.game_id AND f.user_id = $1
    `;
    const params = [req.user.userId];
    const conditions = [];

    // Filter by sport (for sports matches)
    if (filter && type === 'sport') {
      conditions.push(`g.sport = $${params.length + 1}`);
      params.push(filter);
    }

    // Filter by provider (for casino games)
    if (filter && type === 'provider') {
      conditions.push(`g.provider = $${params.length + 1}`);
      params.push(filter);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY g.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get games error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get unique sports (for filtering)
router.get('/sports', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT DISTINCT sport FROM games WHERE sport IS NOT NULL ORDER BY sport'
    );
    res.json(result.rows.map(row => row.sport));
  } catch (error) {
    console.error('Get sports error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get unique providers (for filtering)
router.get('/providers', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT DISTINCT provider FROM games WHERE provider IS NOT NULL ORDER BY provider'
    );
    res.json(result.rows.map(row => row.provider));
  } catch (error) {
    console.error('Get providers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

