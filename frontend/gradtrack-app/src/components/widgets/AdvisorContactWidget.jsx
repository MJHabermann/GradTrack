import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AdvisorContactWidget.css';

const AdvisorContactWidget = ({ studentId }) => {
  const [advisor, setAdvisor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`http://127.0.0.1:8000/api/advisor/${studentId}`)
      .then(res => {
        setAdvisor(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch advisor:', err);
        setLoading(false);
      });
  }, [studentId]);

  if (loading) return <div className="advisor-widget">Loading advisor info...</div>;
  if (!advisor) return <div className="advisor-widget">Advisor not found.</div>;

  return (
    <div className="advisor-widget">
      <h3>Contact Your Advisor</h3>
      <div className="advisor-info">
        <p><strong>Name:</strong> {advisor.name}</p>
        <p><strong>Email:</strong> <span className="advisor-email" onClick={() => window.location.href = `mailto:${advisor.email}`}>{advisor.email}</span></p>
        <p><strong>Office:</strong> {advisor.office}</p>
      </div>
    </div>
  );
};

export default AdvisorContactWidget;
