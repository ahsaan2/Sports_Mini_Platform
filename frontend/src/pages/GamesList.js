import React, { useState, useEffect } from 'react';
import api from '../services/api';
import GameCard from '../components/GameCard';
import FilterBar from '../components/FilterBar';
import './GamesList.css';

const GamesList = () => {
  const [games, setGames] = useState([]);
  const [sports, setSports] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFilter, setSelectedFilter] = useState({ type: null, value: null });

  useEffect(() => {
    fetchFilters();
    fetchGames();
  }, [selectedFilter]);

  const fetchFilters = async () => {
    try {
      const [sportsRes, providersRes] = await Promise.all([
        api.get('/games/sports'),
        api.get('/games/providers')
      ]);
      setSports(sportsRes.data);
      setProviders(providersRes.data);
    } catch (err) {
      console.error('Error fetching filters:', err);
    }
  };

  const fetchGames = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (selectedFilter.type && selectedFilter.value) {
        params.filter = selectedFilter.value;
        params.type = selectedFilter.type;
      }
      const response = await api.get('/games', { params });
      setGames(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load games');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (type, value) => {
    if (value === 'all') {
      setSelectedFilter({ type: null, value: null });
    } else {
      setSelectedFilter({ type, value });
    }
  };

  const handleFavoriteToggle = async (gameId, isFavorite) => {
    try {
      if (isFavorite) {
        await api.delete(`/favorites/${gameId}`);
      } else {
        await api.post(`/favorites/${gameId}`);
      }
      // Refresh games to update favorite status
      fetchGames();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update favorite');
    }
  };

  if (loading) {
    return <div className="loading">Loading games...</div>;
  }

  return (
    <div className="container">
      <h1>Games & Matches</h1>
      <FilterBar
        sports={sports}
        providers={providers}
        selectedFilter={selectedFilter}
        onFilterChange={handleFilterChange}
      />
      {error && <div className="error-message">{error}</div>}
      {games.length === 0 ? (
        <div className="empty-state">
          <h3>No games found</h3>
          <p>Try adjusting your filters</p>
        </div>
      ) : (
        <div className="games-grid">
          {games.map((game) => (
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

export default GamesList;

