import React, { useState } from 'react';
import '../styles/PrerequisiteModal.css';

const PREREQUISITES = [
  { code: 'CS1120', title: 'Structured Programming' },
  { code: 'CS1121', title: 'Algorithms and Data Structures' },
];

const DEFICIENCIES = [
  { code: 'CS1550', title: 'Computer Organization and Architecture' },
  { code: 'CS2100', title: 'Computer Languages' },
  { code: 'CS2240', title: 'Computer Operating Systems' },
  { code: 'CS3383', title: 'Software Engineering' },
  { code: 'CS3195', title: 'Analysis of Algorithms' },
  { code: 'CS3185', title: 'Theory of Computation' },
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
    const completedCourses = [];
    
    // Collect all checked prerequisite and deficiency courses
    Object.entries(checkedPrereq).forEach(([code, checked]) => {
      if (checked) {
        const course = allCourses.find(c => c.course_code === code);
        if (course) completedCourses.push(course);
      }
    });

    Object.entries(checkedDeficiency).forEach(([code, checked]) => {
      if (checked) {
        const course = allCourses.find(c => c.course_code === code);
        if (course) completedCourses.push(course);
      }
    });

    await onSubmit(completedCourses);
  };

  if (!isOpen) return null;

  return (
    <div className="prerequisite-modal-overlay">
      <div className="prerequisite-modal">
        <h2>CS Master's Program Requirements</h2>
        <p className="modal-intro">
          Welcome! To help us track your progress, please indicate which of the following courses you have already completed.
        </p>

        <div className="modal-content">
          {/* Prerequisites Section */}
          <div className="requirements-section">
            <h3>Required Prerequisites</h3>
            <p className="section-desc">
              Competence in the following areas must be demonstrated:
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
              If prerequisite requirements are met, students without adequate computer science background may be admitted with deficiencies in:
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
          <button className="btn btn-secondary" onClick={onClose}>
            Skip for Now
          </button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            Mark as Completed
          </button>
        </div>
      </div>
    </div>
  );
}
