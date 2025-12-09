import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer'; 

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

return (
  <div className="app-layout">
    <Navbar sidebarOpen={sidebarOpen} />
    <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
    <div
      className="main-content"
      style={{
        marginLeft: sidebarOpen ? '220px' : '60px',
        marginTop: '72px',
        flex: 1,
        transition: 'margin-left 0.3s ease',
        overflow: 'hidden',
      }}
    >
      {children}
      <Footer />
    </div>
  </div>
);
}

export default Layout;
