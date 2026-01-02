const express = require('express');
const pool = require('../config/database');
const authenticateToken = require('../middleware/auth');

const requireDb = require('../middleware/requireDb');
const router = express.Router();

// Require DB for games routes
router.use(requireDb);

// Get all games/matches (protected route) with search & pagination
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { filter, type, favorites, q } = req.query;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 100);
    const offset = (page - 1) * limit;

    const baseFrom = `FROM games g LEFT JOIN favorites f ON g.id = f.game_id AND f.user_id = $1`;
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

    // Filter only favorites
    if (favorites === 'true') {
      conditions.push('f.id IS NOT NULL');
    }

    // Search by name/team/league
    if (q && q.trim() !== '') {
      const like = `%${q.trim()}%`;
      conditions.push(`(g.game_name ILIKE $${params.length + 1} OR g.team_a ILIKE $${params.length + 1} OR g.team_b ILIKE $${params.length + 1} OR g.league ILIKE $${params.length + 1})`);
      params.push(like);
    }

    const whereClause = conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : '';

    // Total count
    const countRes = await pool.query(`SELECT COUNT(*) ${baseFrom} ${whereClause}`, params);
    const total = Number(countRes.rows[0].count);
    const totalPages = Math.max(Math.ceil(total / limit), 1);

    // Data query with limit/offset
    const query = `
      SELECT g.*, CASE WHEN f.id IS NOT NULL THEN true ELSE false END as is_favorite
      ${baseFrom}
      ${whereClause}
      ORDER BY g.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({ items: result.rows, total, page, limit, totalPages });
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

