import React, { useEffect, useState } from 'react';
import './DeadlineList.css';

const DeadlineList = () => {
  const [deadlines, setDeadlines] = useState([]);

  useEffect(() => {
    // TODO: Replace with Laravel API call to /api/deadlines
    setDeadlines([
      { id: 1, label: 'Submit Program of Study', date: '2025-10-20' },
      { id: 2, label: 'Annual Evaluation Due', date: '2025-11-05' },
      { id: 3, label: 'Schedule Committee Meeting', date: '2025-11-15' },
    ]);
  }, []);

  return (
    <div className="deadline-list">
      <h3>Upcoming Deadlines</h3>
      <ul>
        {deadlines.map(d => (
          <li key={d.id}>
            <span className="deadline-label">{d.label}</span>
            <span className="deadline-date">{d.date}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DeadlineList;
