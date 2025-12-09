import React, { useEffect, useState } from 'react';
import './MilestoneCard.css';
import API_CONFIG from '../../api/config';

const MilestoneCard = ({ studentId }) => {
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMilestones = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Build URL with optional studentId query parameter
        let url = API_CONFIG.ENDPOINTS.MILESTONES;
        if (studentId) {
          url += `?studentId=${studentId}`;
        }
        
        const response = await API_CONFIG.request(url, {
          method: 'GET',
        });
        
        const data = await response.json();
        setMilestones(data.milestones || []);
      } catch (err) {
        console.error('Error fetching milestones:', err);
        setError('Failed to load milestones');
        // Set empty array on error to prevent UI breakage
        setMilestones([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMilestones();
  }, [studentId]);

  const total = milestones.length;
  const completed = milestones.filter(m => m.completed).length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  if (loading) {
    return (
      <div className="milestone-card">
        <h3>Milestones</h3>
        <p>Loading milestones...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="milestone-card">
        <h3>Milestones</h3>
        <p className="error-text">{error}</p>
      </div>
    );
  }

  return (
    <div className="milestone-card">
      <h3>Milestones</h3>

      {milestones.length === 0 ? (
        <p>No milestones available</p>
      ) : (
        <>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          <p className="progress-text">
            {completed} of {total} completed ({percentage}%)
          </p>

          <ul>
            {milestones.map(m => (
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
        </>
      )}
    </div>
  );
};

export default MilestoneCard;
