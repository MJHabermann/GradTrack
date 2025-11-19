import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import DocumentReview from '../components/widgets/AdminDocumentReviewWidget';
import API_CONFIG from '../api/config';
import { UserContext } from '../context/UserContext';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user, loading: userLoading } = useContext(UserContext);

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch all students
        const response = await API_CONFIG.request('/api/students', {
          method: 'GET',
        });
        const data = await response.json();
        setStudents(data.students || data || []);
      } catch (error) {
        console.error('Error fetching students:', error);
        setError('Failed to load students. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (!userLoading) {
      fetchStudents();
    }
  }, [userLoading]);

  const handleStudentClick = (studentId) => {
    navigate(`/student-details/${studentId}`);
  };

  if (userLoading || loading) return <Layout><div className="loading-message">Loading...</div></Layout>;
  if (error) return <Layout><div className="error-message">{error}</div></Layout>;
  if (!user) return <Layout><div className="error-message">Please log in to access the admin dashboard.</div></Layout>;

  return (
    <Layout>
      <div className="admin-dashboard-container">
        <div className="admin-header">
          <h1>Welcome, {user.first_name} {user.last_name}</h1>
          <p>System Administrator</p>
        </div>

        <section className="admin-section">
          <h2 className="admin-section-title">Compliance Snapshot</h2>
          <div className="admin-stats-grid">
            <div className="admin-stat-card">
              <h3>0</h3>
              <p>Pending Documents</p>
              <DocumentReview />
            </div>
            <div className="admin-stat-card">
              <h3>0</h3>
              <p>Flagged Students</p>
            </div>
            <div className="admin-stat-card">
              <h3>{students.length}</h3>
              <p>Total Students</p>
            </div>
          </div>
        </section>

        <section className="admin-section">
          <h2 className="admin-section-title">Student Management</h2>
          {students.length === 0 ? (
            <div className="admin-placeholder">No students found</div>
          ) : (
            <div className="students-table-container">
              <table className="students-table">
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Program Type</th>
                    <th>Department</th>
                    <th>Advisor</th>
                    <th>I9 Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr 
                      key={student.student_id} 
                      className="student-row"
                      onClick={() => handleStudentClick(student.student_id)}
                    >
                      <td>{student.student_id}</td>
                      <td>{student.user?.first_name} {student.user?.last_name}</td>
                      <td>{student.user?.email}</td>
                      <td>{student.program_type || 'N/A'}</td>
                      <td>{student.user?.department || 'N/A'}</td>
                      <td>
                        {student.major_professor 
                          ? `${student.major_professor.first_name} ${student.major_professor.last_name}`
                          : 'Not Assigned'}
                      </td>
                      <td>
                        <span className={`status-badge ${student.i9_status?.toLowerCase() || 'pending'}`}>
                          {student.i9_status || 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </div>
    </Layout>
  );
};

export default AdminDashboard;
