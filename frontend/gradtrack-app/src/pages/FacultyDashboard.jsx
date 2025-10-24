import { useEffect, useState } from 'react';
import axios from 'axios';
import './FacultyDashboard.css';


export default function FacultyDashboard({ facultyId }) {
  const [faculty, setFaculty] = useState(null);

  useEffect(() => {
    axios.get(`/api/faculty/${facultyId}/with-students`)
      .then(res => setFaculty(res.data.faculty))
      .catch(err => console.error(err));
  }, [facultyId]);

  if (!faculty) return <div>Loading...</div>;

  return (
    <div className="dashboard">
      <h1>Welcome, {faculty.user.first_name}</h1>
      <p>Title: {faculty.title}</p>
      <p>Office: {faculty.office}</p>

      <h2>Advised Students</h2>
      <ul>
        {faculty.advised_students.map(student => (
          <li key={student.student_id}>
              {student.user.first_name} {student.user.last_name} – {student.program_type} ({student.start_term})
          </li>
        ))}
      </ul>
    </div>
  );
}
