import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import DocumentReview from '../components/widgets/AdminDocumentReviewWidget';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    // Replace with real API call
    setAdmin({
      user: {
        first_name: 'Ada',
        last_name: 'Ministrator',
      },
      pending_documents: 0,
      flagged_students: 2,
      total_users: 128,
    });
  }, []);

  if (!admin) return <div>Loading...</div>;

  return (
    <Layout>
      <div className="admin-dashboard-container">
        <div className="admin-header">
          <h1>Welcome, {admin.user.first_name} {admin.user.last_name}</h1>
          <p>System Administrator</p>
        </div>

        <section className="admin-section">
          <h2 className="admin-section-title">Compliance Snapshot</h2>
          <div className="admin-stats-grid">
            <div className="admin-stat-card">
              <h3>{admin.pending_documents}</h3>
              <p>Pending Documents</p>
              <DocumentReview />
            </div>
            <div className="admin-stat-card">
              <h3>{admin.flagged_students}</h3>
              <p>Flagged Students</p>
            </div>
            <div className="admin-stat-card">
              <h3>{admin.total_users}</h3>
              <p>Total Users</p>
            </div>
          </div>
        </section>

        <section className="admin-section">
          <h2 className="admin-section-title">User Management</h2>
          <div className="admin-placeholder">[User table or search goes here]</div>
        </section>

      </div>
    </Layout>
  );
};

export default AdminDashboard;
