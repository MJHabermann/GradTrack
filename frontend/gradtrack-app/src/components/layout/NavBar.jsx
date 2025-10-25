import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';
import { UserContext } from '../../context/UserContext';

const Navbar = ({ sidebarOpen }) => {
  const { user, logout } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/signin');
    } catch (error) {
      console.error('Logout failed:', error);
      navigate('/signin');
    }
  };

  const handleLogin = () => {
    navigate('/signin');
  };

  const displayName = user ? `${user.first_name} ${user.last_name}` : 'Guest';

  return (
    <header className={`navbar ${sidebarOpen ? 'with-sidebar' : 'full-width'}`}>
      <div className="navbar-title">Welcome, {displayName}</div>
      <div className="navbar-actions">
        {user ? (
          <>
            <a href="/settings" className="nav-btn">Settings</a>
            <button className="nav-btn logout" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <button className="nav-btn login" onClick={handleLogin}>Login</button>
        )}
      </div>
    </header>
  );
};


export default Navbar;

