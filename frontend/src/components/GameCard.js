import React from 'react';
import './GameCard.css';

const GameCard = ({ game, onFavoriteToggle }) => {
  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleFavoriteClick = () => {
    onFavoriteToggle(game.id, game.is_favorite);
  };

  return (
    <div className="game-card">
      <div className="game-header">
        <div className="title-with-badge">
          <h3>{game.game_name}</h3>
          <span className={`badge ${game.game_type}`}>{game.game_type === 'sports' ? 'Sports' : 'Casino'}</span>
        </div>
        <button
          onClick={handleFavoriteClick}
          className={`favorite-btn ${game.is_favorite ? 'active' : ''}`}
          title={game.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          {game.is_favorite ? '❤️' : '🤍'}
        </button>
      </div>
      
      <div className="game-details">
        {game.game_type === 'sports' ? (
          <>
            {game.sport && (
              <div className="game-info">
                <span className="label">Sport:</span>
                <span className="value">{game.sport}</span>
              </div>
            )}
            {game.league && (
              <div className="game-info">
                <span className="label">League:</span>
                <span className="value">{game.league}</span>
              </div>
            )}
            {game.team_a && game.team_b && (
              <div className="game-info">
                <span className="label">Teams:</span>
                <span className="value">{game.team_a} vs {game.team_b}</span>
              </div>
            )}
            {game.start_time && (
              <div className="game-info">
                <span className="label">Start Time:</span>
                <span className="value">{formatDate(game.start_time)}</span>
              </div>
            )}
          </>
        ) : (
          <>
            {game.provider && (
              <div className="game-info">
                <span className="label">Provider:</span>
                <span className="value">{game.provider}</span>
              </div>
            )}
            {game.category && (
              <div className="game-info">
                <span className="label">Category:</span>
                <span className="value">{game.category}</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GameCard;

