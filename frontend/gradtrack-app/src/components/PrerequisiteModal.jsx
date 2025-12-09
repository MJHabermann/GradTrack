import React, { useState } from 'react';
import '../styles/PrerequisiteModal.css';

const PREREQUISITES = [
  { code: 'CS 1120', title: 'Structured Programming' },
  { code: 'CS 1121', title: 'Algorithms and Data Structures' },
];

const DEFICIENCIES = [
  { code: 'CS 1550', title: 'Computer Organization and Architecture' },
  { code: 'CS 2100', title: 'Computer Languages' },
  { code: 'CS 2240', title: 'Computer Operating Systems' },
  { code: 'CS 3383', title: 'Software Engineering' },
  { code: 'CS 3195', title: 'Analysis of Algorithms' },
  { code: 'CS 3185', title: 'Theory of Computation' },
];

export default function PrerequisiteModal({ isOpen, onClose, onSubmit, allCourses }) {
  const [checkedPrereq, setCheckedPrereq] = useState({});
  const [checkedDeficiency, setCheckedDeficiency] = useState({});

  const handlePrereqChange = (courseCode) => {
    setCheckedPrereq(prev => ({ ...prev, [courseCode]: !prev[courseCode] }));
  };

  const handleDeficiencyChange = (courseCode) => {
    setCheckedDeficiency(prev => ({ ...prev, [courseCode]: !prev[courseCode] }));
  };

  const handleSubmit = async () => {
    const notTakenCourses = [];
    
    // Collect all UNCHECKED courses (the ones NOT taken)
    Object.entries(checkedPrereq).forEach(([code, checked]) => {
      if (!checked) {  // If NOT checked, means they haven't taken it
        const course = allCourses.find(c => c.course_code === code);
        if (course) notTakenCourses.push(course);
      }
    });

    Object.entries(checkedDeficiency).forEach(([code, checked]) => {
      if (!checked) {  // If NOT checked, means they haven't taken it
        const course = allCourses.find(c => c.course_code === code);
        if (course) notTakenCourses.push(course);
      }
    });

    // Send courses NOT taken to be marked as completed
    // The unchecked courses are the ones they still need to take
    await onSubmit(notTakenCourses);
  };

  if (!isOpen) return null;

  return (
    <div className="prerequisite-modal-overlay">
      <div className="prerequisite-modal">
        <h2>CS Master's Program Requirements</h2>
        <p className="modal-intro">
          Welcome! To help us track your progress, please indicate which of the following courses you still NEED to take. The rest will be assumed as already completed.
        </p>

        <div className="modal-content">
          {/* Prerequisites Section */}
          <div className="requirements-section">
            <h3>Required Prerequisites</h3>
            <p className="section-desc">
              Please select the courses you have not yet completed:
            </p>
            <div className="courses-list">
              {PREREQUISITES.map(course => (
                <label key={course.code} className="course-checkbox">
                  <input
                    type="checkbox"
                    checked={checkedPrereq[course.code] || false}
                    onChange={() => handlePrereqChange(course.code)}
                  />
                  <span className="course-code">{course.code}</span>
                  <span className="course-title">{course.title}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Deficiencies Section */}
          <div className="requirements-section">
            <h3>Possible Deficiencies</h3>
            <p className="section-desc">
              Select all the courses you that are indicated as deficiencies in your admission letter:
            </p>
            <div className="courses-list">
              {DEFICIENCIES.map(course => (
                <label key={course.code} className="course-checkbox">
                  <input
                    type="checkbox"
                    checked={checkedDeficiency[course.code] || false}
                    onChange={() => handleDeficiencyChange(course.code)}
                  />
                  <span className="course-code">{course.code}</span>
                  <span className="course-title">{course.title}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-primary" onClick={handleSubmit}>
            Clear Deficencies
          </button>
        </div>
      </div>
    </div>
  );
}
