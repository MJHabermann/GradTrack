import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import MilestoneCard from '../components/widgets/MilestoneCard';
import MajorCompletionWidget from '../components/widgets/MajorCompletionWidget';
import DeadlineList from '../components/widgets/DeadlineList';
import DocumentVault from '../components/widgets/DocumentVaultWidget';
import AdvisorContactWidget from '../components/widgets/AdvisorContactWidget';
// import EvaluationStatus from '../components/widgets/EvaluationStatus';
// import ReminderPanel from '../components/widgets/ReminderPanel';
// import QuickActions from '../components/widgets/QuickActions';
import './Dashboard.css';
import { useContext } from 'react';
import { UserContext } from '../context/UserContext';

const Dashboard = () => {
  const [deadlines, setDeadlines] = useState([]);
  const { user, loading } = useContext(UserContext);

  useEffect(() => {
    // TODO: Replace with Laravel API call to /api/deadlines
    setDeadlines([
      { id: 1, label: 'Submit Program of Study', date: '2025-10-20' },
      { id: 2, label: 'Annual Evaluation Due', date: '2025-11-05' },
    ]);


  }, []);

  // Show loading state while user data is being fetched
  if (loading) {
    return (
      <Layout>
        <main className="dashboard-container">
          <div className="loading-container">
            <h2>Loading...</h2>
          </div>
        </main>
      </Layout>
    );
  }

  // Show error state if user is not authenticated
  if (!user) {
    return (
      <Layout>
        <main className="dashboard-container">
          <div className="error-container">
            <h2>Please log in to access the dashboard</h2>
          </div>
        </main>
      </Layout>
    );
  }

  return (
    <Layout>
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
            <h2 className="dashboard-section-title">Services</h2>
            <DocumentVault />
            <AdvisorContactWidget studentId={1} />
            {/* Add other main widgets here */}
          </div>

          <div className="dashboard-side">
            <h2 className="dashboard-section-title">Progress Tracker</h2>
            <MajorCompletionWidget studentId={user.id} />
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
    </Layout>
  );
};

export default Dashboard;
