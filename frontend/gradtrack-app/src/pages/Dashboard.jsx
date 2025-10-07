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
  const [milestones, setMilestones] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  // const [evaluations, setEvaluations] = useState([]);
  // const [reminders, setReminders] = useState([]);

  useEffect(() => {
    // TODO: Replace with Laravel API call to /api/milestones
    setMilestones([
      { id: 1, title: 'Deficiency Courses', status: 'complete', due: '2025-09-01' },
      { id: 2, title: 'Major Professor Selected', status: 'pending', due: '2025-10-15' },
      { id: 3, title: 'Committee Formed', status: 'in-progress', due: '2025-11-01' },
    ]);

    // TODO: Replace with Laravel API call to /api/deadlines
    setDeadlines([
      { id: 1, label: 'Submit Program of Study', date: '2025-10-20' },
      { id: 2, label: 'Annual Evaluation Due', date: '2025-11-05' },
    ]);

    // TODO: Replace with Laravel API call to /api/evaluations
    // setEvaluations([
    //   { id: 1, faculty: 'Dr. Smith', status: 'approved' },
    //   { id: 2, faculty: 'Dr. Lee', status: 'pending' },
    // ]);

    // TODO: Replace with Laravel API call to /api/notifications
    // setReminders([
    //   { id: 1, message: 'Upload I-9 form', type: 'document' },
    //   { id: 2, message: 'Confirm committee members', type: 'milestone' },
    // ]);
  }, []);

  return (
    <>
      <Sidebar />
      <Navbar />
      <main className="dashboard-container">
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
