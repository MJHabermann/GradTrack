import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import './FacultyDashboard.css';
import DocumentVault from '../components/widgets/DocumentVaultWidget';
import CalendarWidget from '../components/widgets/CalendarWidget';
import DocumentReview from '../components/widgets/AdminDocumentReviewWidget';
import {UserContext} from '../context/UserContext';
import API_CONFIG from '../api/config';

const FacultyDashboard = () => {
  const { user } = useContext(UserContext);
  const [faculty, setFaculty] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  //Fetch faculty data from API
  useEffect(() => {
    const fetchFaculty = async () => {
      setLoading(true);
      try{
        console.log('Fetching faculty data for user:', user.id);
        const response = await API_CONFIG.request(`/api/faculty/${user.id}/students`, {
          method: 'GET',
        });
        const data = await response.json();
        setFaculty(data.faculty);
      }
      catch(error){
        console.error('Error fetching faculty data:', error);
        setFaculty(null);
      }
      finally{
        setLoading(false);
      }
    };
    if(user){
      fetchFaculty();
    }
  }, [user]);

  if (loading) return <div>Loading...</div>;
  if(!faculty) return <div>No faculty data found</div>;

  return (
    <Layout>
      
      <div className="faculty-dashboard-container">
       <div className="faculty-top-section">
        <div className="faculty-header">
          <h1>Welcome, {faculty.user.first_name} {faculty.user.last_name}</h1>
          <p>Title: {faculty.title}</p>
          <p>Office: {faculty.office}</p>
          <p>{faculty.advised_students.length} students advised</p>
          <p>2 pending actions</p>
        </div>
        

        <div className="calendar-container">
          <CalendarWidget />
        </div>
      </div>




        <section className="to-do-section">
          <h2>To Do</h2>
          <div className="to-do-grid">
            <div className="alert-item">
              <h3>Alerts</h3>
              <DocumentReview />
            </div>
            <div className="upcoming-item">
              <h3>Upcoming</h3>
              <p>John Smith - Approve (Nov 15)</p>
              <p>Committee Meeting (Nov 20)</p>
            </div>
          </div>
        </section>

        <section className="advised-students-section">
          <h2>Your Advisees</h2>
          <div className="students-grid">
            {faculty.advised_students.map(student => (
              <div key={student.student_id} className="student-card">
                <h3>{student.user.first_name} {student.user.last_name}</h3>
                <p>Program: {student.program_type}</p>
                <p>Started: {student.start_term}</p>
                <button className="view-btn" onClick={() => navigate(`/student-details/${student.student_id}`)}>View Details</button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default FacultyDashboard;