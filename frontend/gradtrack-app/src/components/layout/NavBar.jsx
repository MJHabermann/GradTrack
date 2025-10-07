import React from 'react';
import './Navbar.css';

const Navbar = () => {
  return (
    <header className="navbar">
      <div className="navbar-title">Welcome, User</div>
      <div className="navbar-actions">
        <button className="nav-btn">Settings</button>
        <button className="nav-btn">Logout</button>
      </div>
    </header>
  );
};

export default Navbar;
