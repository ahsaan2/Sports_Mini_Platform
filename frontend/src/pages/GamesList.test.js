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
});
