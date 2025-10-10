import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="dashboard-footer">
      <p>© {new Date().getFullYear()} GradTrack. All rights reserved.</p>
      <p className="footer-links">
        <a href="#">Privacy</a> · <a href="#">Terms</a> · <a href="#">Support</a>
      </p>
    </footer>
  );
};

export default Footer;
