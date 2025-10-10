import React from 'react';
import './Navbar.css';

const Navbar = ({ sidebarOpen }) => {
  return (
    <header className={`navbar ${sidebarOpen ? 'with-sidebar' : 'full-width'}`}>
      <div className="navbar-title">Welcome, Mikayla</div>
      <div className="navbar-actions">
        <a href="/settings" className="nav-btn">Settings</a>
        <button className="nav-btn logout">Logout</button>
      </div>
    </header>
  );
};


export default Navbar;

