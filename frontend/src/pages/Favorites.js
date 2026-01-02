import React, { useState, useEffect } from 'react';
import api from '../services/api';
import GameCard from '../components/GameCard';
import './GamesList.css';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/favorites');
      setFavorites(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteToggle = async (gameId) => {
    try {
      await api.delete(`/favorites/${gameId}`);
      // Remove from local state
      setFavorites(favorites.filter(game => game.id !== gameId));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to remove favorite');
    }
  };

  if (loading) {
    return <div className="loading">Loading favorites...</div>;
  }

  return (
    <div className="container">
      <h1>My Favorites</h1>
      {error && <div className="error-message">{error}</div>}
      {favorites.length === 0 ? (
        <div className="empty-state">
          <h3>No favorites yet</h3>
          <p>Start adding games to your favorites to see them here</p>
        </div>
      ) : (
        <div className="games-grid">
          {favorites.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onFavoriteToggle={handleFavoriteToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;

