import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import GamesList from './GamesList';
import api from '../services/api';
import { BrowserRouter } from 'react-router-dom';

jest.mock('../services/api');

describe('GamesList', () => {
  it('renders games and handles empty state', async () => {
    api.get.mockImplementation((url) => {
      if (url === '/games/sports') return Promise.resolve({ data: ['Cricket'] });
      if (url === '/games/providers') return Promise.resolve({ data: ['Evolution'] });
      if (url === '/games') return Promise.resolve({ data: { items: [], total: 0, page: 1, totalPages: 1 } });
      return Promise.resolve({ data: [] });
    });

    render(
      <BrowserRouter>
        <GamesList />
      </BrowserRouter>
    );

    await waitFor(() => expect(api.get).toHaveBeenCalledWith('/games/sports'));
    // Wait for debounced fetch to complete and empty state to appear
    await screen.findByText(/No games found/i);
  });

  it('shows type badges for sports and casino cards', async () => {
    api.get.mockImplementation((url) => {
      if (url === '/games/sports') return Promise.resolve({ data: ['Cricket'] });
      if (url === '/games/providers') return Promise.resolve({ data: ['Evolution'] });
      if (url === '/games') return Promise.resolve({
        data: {
          items: [
            {
              id: 1,
              game_name: 'Mumbai vs Chennai',
              game_type: 'sports',
              sport: 'Cricket',
              league: 'IPL',
              team_a: 'Mumbai',
              team_b: 'Chennai',
              start_time: new Date().toISOString(),
              is_favorite: false
            },
            {
              id: 2,
              game_name: 'Book of Dead',
              game_type: 'casino',
              provider: "Play'n GO",
              category: 'Slots',
              is_favorite: false
            }
          ],
          total: 2,
          page: 1,
          totalPages: 1
        }
      });
      return Promise.resolve({ data: [] });
    });

    render(
      <BrowserRouter>
        <GamesList />
      </BrowserRouter>
    );

    await screen.findByRole('heading', { name: /Mumbai vs Chennai/i });
    await screen.findByRole('heading', { name: /Book of Dead/i });

    expect(screen.getAllByText(/^Sports$/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/^Casino$/i).length).toBeGreaterThan(0);
  });
});
