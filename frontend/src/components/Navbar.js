import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/games" className="navbar-brand">
          Sports Platform
        </Link>
        <div className="navbar-links">
          <Link to="/games" className="navbar-link">
            Games
          </Link>
          <Link to="/favorites" className="navbar-link">
            Favorites
          </Link>
          {user && (
            <span className="navbar-user">Hello, {user.name}</span>
          )}
          <button onClick={handleLogout} className="btn btn-secondary">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

