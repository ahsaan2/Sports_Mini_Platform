const express = require('express');
const pool = require('../config/database');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// All favorites routes require authentication
router.use(authenticateToken);

// Add to favorites
router.post('/:gameId', async (req, res) => {
  try {
    const { gameId } = req.params;
    const userId = req.user.userId;

    // Check if game exists
    const gameCheck = await pool.query('SELECT * FROM games WHERE id = $1', [gameId]);
    if (gameCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Check if already favorited
    const existing = await pool.query(
      'SELECT * FROM favorites WHERE user_id = $1 AND game_id = $2',
      [userId, gameId]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Game already in favorites' });
    }

    // Add to favorites
    await pool.query(
      'INSERT INTO favorites (user_id, game_id) VALUES ($1, $2)',
      [userId, gameId]
    );

    res.status(201).json({ message: 'Game added to favorites' });
  } catch (error) {
    console.error('Add favorite error:', error);
    if (error.code === '23505') { // Unique constraint violation
      return res.status(400).json({ error: 'Game already in favorites' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove from favorites
router.delete('/:gameId', async (req, res) => {
  try {
    const { gameId } = req.params;
    const userId = req.user.userId;

    const result = await pool.query(
      'DELETE FROM favorites WHERE user_id = $1 AND game_id = $2',
      [userId, gameId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Favorite not found' });
    }

    res.json({ message: 'Game removed from favorites' });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all favorites
router.get('/', async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `SELECT g.*, f.created_at as favorited_at
       FROM favorites f
       JOIN games g ON f.game_id = g.id
       WHERE f.user_id = $1
       ORDER BY f.created_at DESC`,
      [userId]
    );

    res.json(result.rows.map(game => ({ ...game, is_favorite: true })));
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

