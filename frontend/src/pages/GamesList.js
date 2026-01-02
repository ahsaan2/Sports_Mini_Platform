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
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);

  // Debounce searchQuery updates to reduce immediate network requests and avoid focus loss
  useEffect(() => {
    fetchFilters();

    const timer = setTimeout(() => {
      fetchGames();
    }, 250); // 250ms debounce

    return () => clearTimeout(timer);
  }, [selectedFilter, page, searchQuery]);

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
      const params = { page, limit };
      if (selectedFilter.type && selectedFilter.value) {
        if (selectedFilter.type === 'favorites') {
          params.favorites = true;
        } else {
          params.filter = selectedFilter.value;
          params.type = selectedFilter.type;
        }
      }
      if (searchQuery && searchQuery.trim() !== '') {
        params.q = searchQuery.trim();
      }
      const response = await api.get('/games', { params });
      setGames(response.data.items);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load games');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (type, value) => {
    // Reset to first page when filters change
    setPage(1);

    if (type === 'favorites') {
      if (value === 'true') {
        setSelectedFilter({ type: 'favorites', value: 'true' });
      } else {
        setSelectedFilter({ type: null, value: null });
      }
      return;
    }

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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    // fetch is triggered by useEffect dependency on searchQuery
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setPage(1);
  };

  // Keep search and filters visible during loading to avoid losing focus
  return (
    <div className="container">
      <h1>Games & Matches</h1>
      <form className="search-form" onSubmit={(e) => { e.preventDefault(); setPage(1); setSearchQuery(searchQuery); }}>
        <input
          type="text"
          placeholder="Search by game name, team, or league"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        <button type="submit" className="btn">Search</button>
        <button type="button" className="btn" onClick={handleClearSearch}>Clear</button>
      </form>

      <FilterBar
        sports={sports}
        providers={providers}
        selectedFilter={selectedFilter}
        onFilterChange={handleFilterChange}
      />
      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading games...</div>
      ) : games.length === 0 ? (
        <div className="empty-state">
          <h3>No games found</h3>
          <p>Try adjusting your filters</p>
        </div>
      ) : (
        <>
          <div className="games-grid">
            {games.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onFavoriteToggle={handleFavoriteToggle}
              />
            ))}
          </div>

          <div className="pagination">
            <button className="btn" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
            <span>Page {page} of {totalPages}</span>
            <button className="btn" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</button>
          </div>
        </>
      )}
    </div>
  );
};

export default GamesList;

