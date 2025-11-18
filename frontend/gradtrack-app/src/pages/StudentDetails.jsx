import React, { useEffect, useState, useContext } from 'react';
import {useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import API_CONFIG from '../api/config';
import { UserContext } from '../context/UserContext';
import './StudentDetails.css';

const StudentDetail = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const { user } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudent = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await API_CONFIG.request(`/api/students/${studentId}`, {
          method: 'GET',
        });
        const data = await response.json();
        setStudent(data.student);
      } catch (error) {
        console.error('Error fetching student data:', error);
        setError('Failed to load student information');
      } finally {
        setLoading(false);
      }
    };

    if (studentId) {
      fetchStudent();
    }
  }, [studentId]);

  if (loading) return <Layout><div>Loading...</div></Layout>;
  if (error) return <Layout><div>{error}</div></Layout>;
  if (!student) return <Layout><div>Student not found</div></Layout>;

  //Change I9 Status Function
  const changeI9Status = async () => {
    const newI9Status = student.i9_status === 'Completed' ? 'Pending' : 'Completed';
    try {
      const response = await API_CONFIG.request(`/api/students/${studentId}`, {
        method: 'PUT',
        body: JSON.stringify({
          i9_status: newI9Status,
        }),
      });
      const data = await response.json();
      setStudent(data.student);
    }
   catch (error) {
    console.error('Error changing I9 status:', error);
    setError('Failed to change I9 status');
  }
  };

  //Clear Deficiency Function
  const clearDeficiency = async () => {
    try {
      const response = await API_CONFIG.request(`/api/students/${studentId}`, {
        method: 'PUT',
        body: JSON.stringify({
          deficiency_cleared: !student.deficiency_cleared,
        }),
      });
      const data = await response.json();
      setStudent(data.student);
    }
    catch (error) {
    console.error('Error clearing deficiency:', error);
    setError('Failed to clear deficiency');
  }
  };

  // Add drop advisee function for faculty instead of delete, admin can only delete students, authenticated users can only drop their own advisees
  const dropAdvisee = async () => {
    if (user.role !== 'faculty') {
      setError('You are not authorized to drop advisees');
      return;
    }
    if (user.id !== student.major_professor_id) {
      setError('You are not authorized to drop this advisee');
      return;
    }

    if (!window.confirm('Are you sure you want to drop this advisee?')) {
      return;
    }

    try {
      const response = await API_CONFIG.request(`/api/students/${studentId}`, {
        method: 'PUT',
        body: JSON.stringify({
          major_professor_id: null,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setStudent(data.student);
        alert('Advisee dropped successfully');
        navigate(`/faculty-dashboard`);
      } else {
        throw new Error('Failed to drop advisee');
      }
    } catch (error) {
      console.error('Error dropping advisee:', error);
      setError('Failed to drop advisee');
    }
  };

  return (
    <Layout>
      <div className="student-detail-container">
        <button onClick={() => navigate(-1)} className="back-btn">
          Back
        </button>
        <div className="student-header">
          <h1>{student.user.first_name} {student.user.last_name}</h1>
          <p className="student-email">{student.user.email}</p>
          <p className="student-id">Student ID: {student.student_id}</p>
        </div>

        <div className="student-info-grid">
          <div className="info-section">
            <h2>Academic Information</h2>
            <div className="info-item">
              <label>Program Type:</label>
              <span>{student.program_type}</span>
            </div>
            <div className="info-item">
              <label>Start Term:</label>
              <span>{student.start_term}</span>
            </div>
            {student.graduation_term && (
              <div className="info-item">
                <label>Graduation Term:</label>
                <span>{student.graduation_term}</span>
              </div>
            )}
          </div>

          <div className="info-section">
            <h2>Advisor Information</h2>
            {student.major_professor ? (
              <>
                <div className="info-item">
                  <label>Major Professor:</label>
                  <span>{student.major_professor.first_name} {student.major_professor.last_name}</span>
                </div>
                <div className="info-item">
                  <label>Advisor Email:</label>
                  <span>{student.major_professor.email}</span>
                </div>
              </>
            ) : (
              <p>No advisor assigned</p>
            )}
          </div>

          <div className="info-section">
            <h2>Status Information</h2>
            <div className="info-item">
              <label>I9 Status:</label>
              <span className={`status-badge ${student.i9_status.toLowerCase()}`}>
                {student.i9_status}
              </span>
              <button className = "change-i9-status-btn" onClick = {changeI9Status}>Change I9 Status</button>
            </div>
            <div className="info-item">
              <label>Deficiency Cleared:</label>
              <span className={`status-badge ${student.deficiency_cleared ? 'completed' : 'pending'}`}>
                {student.deficiency_cleared ? 'Yes' : 'No'}
              </span>
              <button className = "clear-deficiency-btn" onClick = {clearDeficiency}>Clear Deficiency</button>
            </div>
          </div>
        </div>
        <div className= "student-options">
          <button className = "message-btn">Message</button>
          <button className = "edit-btn">Actions</button>
          <button className = "delete-btn" onClick={dropAdvisee}>Drop Advisee</button>
        </div>
      </div>
    </Layout>
  );
};

export default StudentDetail;