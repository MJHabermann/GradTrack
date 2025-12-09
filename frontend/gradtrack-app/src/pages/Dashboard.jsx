import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import MilestoneCard from '../components/widgets/MilestoneCard';
import MajorCompletionWidget from '../components/widgets/MajorCompletionWidget';
import DeadlineList from '../components/widgets/DeadlineList';
import DocumentVault from '../components/widgets/DocumentVaultWidget';
import AdvisorContactWidget from '../components/widgets/AdvisorContactWidget';
import CalendarWidget from '../components/widgets/CalendarWidget';
// import EvaluationStatus from '../components/widgets/EvaluationStatus';
// import ReminderPanel from '../components/widgets/ReminderPanel';
// import QuickActions from '../components/widgets/QuickActions';
import './Dashboard.css';
import { useContext } from 'react';
import { UserContext } from '../context/UserContext';

const Dashboard = () => {
  const [deadlines, setDeadlines] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const { user, loading } = useContext(UserContext);
  const navigate = useNavigate();

  // Define available pages and shortcuts
  const pageMap = {
      'planner': '/course-planner',
      'course planner': '/course-planner',
      'schedule': '/course-planner',
      'courses': '/course-planner',
      'documents': '/documents',
      'vault': '/documents',
      'document vault': '/documents',
      'settings': '/settings',
      'dashboard': '/dashboard',
      'home': '/dashboard',
  };

  const handleSearchChange = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchInput(value);

    // Filter suggestions based on input
    if (value.trim()) {
      const matches = Object.keys(pageMap).filter(key =>
        key.includes(value)
      );
      setSearchSuggestions(matches.slice(0, 5)); // Show up to 5 suggestions
    } else {
      setSearchSuggestions([]);
    }
  };

  const navigateToPage = (query) => {
    const normalizedQuery = query.toLowerCase().trim();
    const path = pageMap[normalizedQuery];

    if (path) {
      navigate(path);
      setSearchInput('');
      setSearchSuggestions([]);
    } else {
      alert(`Page not found. Try: ${Object.keys(pageMap).join(', ')}`);
    }
  };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter') {
      navigateToPage(searchInput);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    navigateToPage(suggestion);
  };

  useEffect(() => {
    // TODO: Replace with Laravel API call to /api/deadlines
    setDeadlines([
      { id: 1, label: 'Submit Program of Study', date: '2025-10-20' },
      { id: 2, label: 'Annual Evaluation Due', date: '2025-11-05' },
    ]);


  }, []);



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
            <CalendarWidget />
            <DocumentVault />
            <AdvisorContactWidget facultyId={user?.id || 1} />
            {/* Add other main widgets here */}
          </div>

          <div className="dashboard-side">
            <h2 className="dashboard-section-title">Progress Tracker</h2>
            <MajorCompletionWidget studentId={user?.id || 1} />
            <MilestoneCard studentId={user?.id} />
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
