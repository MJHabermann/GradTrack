import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import './FacultyDashboard.css';
import DocumentVault from '../components/widgets/DocumentVaultWidget';
import CalendarWidget from '../components/widgets/CalendarWidget';

const FacultyDashboard = () => {
  const [faculty, setFaculty] = useState(null);

  useEffect(() => {
    // Mock data for now - replace with API call later
    setFaculty({
      user: {
        first_name: 'Facul',
        last_name: 'Tea',
      },
      title: 'Associate Professor',
      office: 'CS Building, Room 305',
      advised_students: [
        { student_id: 1, user: { first_name: 'John', last_name: 'Smith' }, program_type: 'PhD', start_term: 'Fall 2023' },
        { student_id: 2, user: { first_name: 'Alice', last_name: 'Brown' }, program_type: 'Masters', start_term: 'Spring 2024' },
        { student_id: 3, user: { first_name: 'Bob', last_name: 'Wilson' }, program_type: 'PhD', start_term: 'Fall 2022' },
      ],
    });
  }, []);

  if (!faculty) return <div>Loading...</div>;

  return (
    <Layout>
      <div className="faculty-dashboard-container">
        <div className="faculty-header">
          <h1>Welcome, {faculty.user.first_name} {faculty.user.last_name}</h1>
          <p>Title: {faculty.title}</p>
          <p>Office: {faculty.office}</p>
          <p>{faculty.advised_students.length} students advised</p>
          <p>2 pending actions</p>
        </div>

        <section className="to-do-section">
          <h2>To Do</h2>
          <div className="to-do-grid">
            <div className="alert-item">
              <h3>⚠️ Alerts</h3>
              <p>3 documents pending review</p>
              <p>1 student missing forms</p>
            </div>
            <div className="upcoming-item">
              <h3>📅 Upcoming</h3>
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
                <button className="view-btn">View Details</button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default FacultyDashboard;