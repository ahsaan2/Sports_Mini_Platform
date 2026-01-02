import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from './Login';
import * as AuthContext from '../context/AuthContext';
import api from '../services/api';

jest.mock('../services/api');

describe('Login page', () => {
  it('renders and logs in successfully', async () => {
    const mockLogin = jest.fn();
    jest.spyOn(AuthContext, 'useAuth').mockReturnValue({ login: mockLogin });

    api.post.mockResolvedValue({ data: { user: { id: 1, name: 'Test', email: 't@test.com' }, token: 'abc' } });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 't@test.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password1' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => expect(api.post).toHaveBeenCalledWith('/auth/login', { email: 't@test.com', password: 'password1' }));
    expect(mockLogin).toHaveBeenCalled();
  });
});
