import React, { useEffect, useState } from 'react';
import './MilestoneCard.css';

const MilestoneCard = () => {
  const [milestones, setMilestones] = useState([]);

  useEffect(() => {
    // TODO: Replace with Laravel API call to /api/milestones
    setMilestones([
      { id: 1, title: 'Deficiency Courses', completed: true },
      { id: 2, title: 'Major Professor Selected', completed: false },
      { id: 3, title: 'Committee Formed', completed: false },
      { id: 4, title: 'Program of Study Approved', completed: true },
      { id: 5, title: 'Annual Evaluation Submitted', completed: false },
    ]);
  }, []);

  return (
    <div className="milestone-card">
      <h3>Milestones</h3>
      <ul>
        {milestones.map((m) => (
          <li key={m.id} className={m.completed ? 'completed' : 'pending'}>
            <span className="milestone-title">{m.title}</span>
            <input
              type="checkbox"
              checked={m.completed}
              readOnly
              className="milestone-checkbox"
              aria-label={`Mark ${m.title} as complete`}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MilestoneCard;
