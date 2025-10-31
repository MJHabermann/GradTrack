import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../../context/UserContext';
import './AdvisorContactWidget.css';

const AdvisorWidget = () => {
  const { user } = useContext(UserContext);
  const [advisor, setAdvisor] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'faculty') return;

    axios.get(`/api/faculty/${user.id}/with-students`)
      .then(res => setAdvisor(res.data.faculty))
      .catch(err => console.error('Failed to load advisor data:', err));
  }, [user]);

  if (!advisor) return <div className="advisor-widget">Loading advisor info…</div>;

  return (
    <div className="advisor-widget">
      <h3>{advisor.user.first_name} {advisor.user.last_name}</h3>
      <p><strong>Title:</strong> {advisor.title}</p>
      <p><strong>Office:</strong> {advisor.office}</p>
      <p><strong>Department:</strong> {advisor.user.department}</p>

      <h4>Advised Students</h4>
      <ul>
        {advisor.advised_students.map(student => (
          <li key={student.student_id}>
            {student.user.first_name} {student.user.last_name} – {student.program_type}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdvisorWidget;
