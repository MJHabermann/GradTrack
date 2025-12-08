import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from '../../context/UserContext';
import './AdvisorContactWidget.css';
import API_CONFIG from '../../api/config';

const AdvisorWidget = () => {
  const { user } = useContext(UserContext);
  const [advisor, setAdvisor] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchAdvisor = async () => {
    setLoading(true);
    try {
      const response = await API_CONFIG.request(`/api/students/${user.id}`, {
        method: 'GET',
      });
      const data = await response.json();
      
      if (data.student && data.student.major_professor) {
        const advisorUser = data.student.major_professor;
        let facultyDetails = null;
        
        // Fetch faculty details to get title and office
        try {
          const facultyResponse = await API_CONFIG.request(`/api/faculty/${advisorUser.id}`, {
            method: 'GET',
          });
          const facultyData = await facultyResponse.json();
          facultyDetails = facultyData.faculty;
        } catch (err) {
          // Faculty details not available, that's okay
          console.log('Faculty details not available:', err);
        }
        
        setAdvisor({
          user: advisorUser,
          faculty: facultyDetails,
        });
      } else {
        setAdvisor(null);
      }
    } catch (error) {
      console.error('Failed to load advisor data:', error);
      setAdvisor(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'student') {
      setLoading(false);
      return;
    }
    fetchAdvisor();
  }, [user]);

  if (!user || user.role !== 'student') {
    return null; // Don't show widget for non-students
  }

  if (loading) {
    return <div className="advisor-widget">Loading advisor info…</div>;
  }

  if (!advisor) {
    return (
      <div className="advisor-widget">
        <h3>Advisor</h3>
        <p>No advisor assigned</p>
        <button className="advisor-button" onClick={() => window.location.href = `mailto:admin@gradtrack.com`}> Contact Admin to Connect with Advisor</button>
      </div>
    );
  }

  return (
    <div className="advisor-widget">
      <h3>Advisor</h3>
      <p><strong>{advisor.user.first_name} {advisor.user.last_name}</strong></p>
      {advisor.faculty && (
        <>
          {advisor.faculty.title && (
            <p><strong>Title:</strong> {advisor.faculty.title}</p>
          )}
          {advisor.faculty.office && (
            <p><strong>Office:</strong> {advisor.faculty.office}</p>
          )}
        </>
      )}
      {advisor.user.department && (
        <p><strong>Department:</strong> {advisor.user.department}</p>
      )}
      {advisor.user.email && (
        <p><strong>Email:</strong> {advisor.user.email}</p>
      )}
      <button className="advisor-button" onClick={() => window.location.href = `mailto:${advisor.user.email}`} > Contact Advisor</button>
    </div>
  );
};

export default AdvisorWidget;
