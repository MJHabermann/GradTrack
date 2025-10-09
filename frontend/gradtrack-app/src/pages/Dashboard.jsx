import React, { useEffect, useState } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import MilestoneCard from '../components/widgets/MilestoneCard';
import DeadlineList from '../components/widgets/DeadlineList';
import DocumentVault from '../components/widgets/DocumentVaultWidget';
// import EvaluationStatus from '../components/widgets/EvaluationStatus';
// import ReminderPanel from '../components/widgets/ReminderPanel';
// import QuickActions from '../components/widgets/QuickActions';
import './Dashboard.css';

const Dashboard = () => {
  const [deadlines, setDeadlines] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    // TODO: Replace with Laravel API call to /api/deadlines
    setDeadlines([
      { id: 1, label: 'Submit Program of Study', date: '2025-10-20' },
      { id: 2, label: 'Annual Evaluation Due', date: '2025-11-05' },
    ]);
  }, []);

  return (
    <>
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Navbar />
      <main
        className="dashboard-container"
        style={{ paddingLeft: sidebarOpen ? '220px' : '0' }}
      >
        <div className="searchbar-container">
          <input
            type="text"
            className="searchbar"
            placeholder="What would you like to do?"
          />
        </div>

        <div className="dashboard-columns">
          <div className="dashboard-main">
            <DocumentVault />
            {/* Add other main widgets here */}
          </div>

          <div className="dashboard-side">
            <MilestoneCard />
            <DeadlineList deadlines={deadlines} />
          </div>
        </div>

        {/* <section className="dashboard-section">
          <h2>Faculty Evaluations</h2>
          <EvaluationStatus evaluations={evaluations} />
        </section>

        <section className="dashboard-section">
          <h2>Reminders & Alerts</h2>
          <ReminderPanel reminders={reminders} />
        </section>

        <section className="dashboard-section">
          <h2>Quick Actions</h2>
          <QuickActions />
        </section> */}
      </main>
    </>
  );
};

export default Dashboard;
