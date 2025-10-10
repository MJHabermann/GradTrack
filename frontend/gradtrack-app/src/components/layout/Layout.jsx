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
        width: `calc(100% - ${sidebarOpen ? '220px' : '60px'})`,
        transition: 'margin-left 0.3s ease',
      }}
    >
      {children}
      <Footer />
    </div>
  </div>
);
}

export default Layout;
