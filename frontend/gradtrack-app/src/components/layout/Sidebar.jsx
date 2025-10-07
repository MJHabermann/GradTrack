import React from 'react';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <h2 className="logo">GradTrack</h2>
      <nav>
        <ul>
          <li><a href="#">Dashboard</a></li>
          <li><a href="#">Milestones</a></li>
          <li><a href="#">Deadlines</a></li>
          <li><a href="#">Evaluations</a></li>
          <li><a href="#">Reminders</a></li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
