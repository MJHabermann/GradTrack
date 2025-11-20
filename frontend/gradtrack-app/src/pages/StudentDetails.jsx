import React, { useEffect, useState, useContext } from 'react';
import {useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import API_CONFIG from '../api/config';
import { UserContext } from '../context/UserContext';
import documentVaultApi from '../features/DocumentVault/api/documentVaultApi';
import './StudentDetails.css';

const StudentDetail = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const { user } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAdvisorModal, setShowAdvisorModal] = useState(false);
  const [advisorId, setAdvisorId] = useState('');
  const [facultyList, setFacultyList] = useState([]);
  const [loadingFaculty, setLoadingFaculty] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  
  // Required documents list
  const requiredDocuments = [
    {
      id: 1,
      name: 'Application Form',
      required: true,
      dueDate: '2025-10-20',
      description: 'Completed graduate application form submitted through the online portal',
    },
    {
      id: 2,
      name: 'Transcripts',
      required: true,
      dueDate: '2025-10-25',
      description: 'Transcripts from all previously attended institutions',
    },
    {
      id: 3,
      name: 'Letters of Recommendation',
      required: true,
      dueDate: '2025-10-30',
      description: 'Two or three signed recommendation letters from academic or professional references',
    },
    {
      id: 4,
      name: 'Statement of Purpose',
      required: true,
      dueDate: '2025-11-05',
      description: 'Personal statement outlining academic goals and reasons for pursuing graduate study',
    },
    {
      id: 5,
      name: 'Resume or CV',
      required: true,
      dueDate: '2025-11-10',
      description: 'Detailed record of academic background, research, and work experience',
    },
    {
      id: 6,
      name: 'I-9 Employment Eligibility Verification',
      required: true,
      dueDate: '2025-08-15',
      description: 'Employment eligibility verification (International students)',
    }
  ];

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

  // Fetch documents for the student
  useEffect(() => {
    const fetchStudentDocuments = async () => {
      if (!studentId) return;
      
      setLoadingDocuments(true);
      try {
        const response = await API_CONFIG.request(`/api/students/${studentId}/documents`, {
          method: 'GET',
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch documents: ${response.status}`);
        }
        
        const data = await response.json();
        // Response format: { student_id: 1, documents: [...] }
        const docs = data.documents || [];
        setDocuments(docs);
      } catch (error) {
        console.error('Error fetching student documents:', error);
        setDocuments([]);
        // Don't set error state, just log it - documents might not be available
      } finally {
        setLoadingDocuments(false);
      }
    };

    if (studentId) {
      fetchStudentDocuments();
    }
  }, [studentId]);

  if (loading) return <Layout><div>Loading...</div></Layout>;
  if (error) return <Layout><div>{error}</div></Layout>;
  if (!student) return <Layout><div>Student not found</div></Layout>;

  //Change I9 Status Function
  const changeI9Status = async () => {
    const newI9Status = (student.i9_status === 'Completed') ? 'Pending' : 'Completed';
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

  // Fetch faculty list
  const fetchFacultyList = async () => {
    setLoadingFaculty(true);
    setError(null);
    try {
      // Try /api/users?role=faculty first (most likely to work)
      const response = await API_CONFIG.request('/api/users?role=faculty', {
        method: 'GET',
      });
      const data = await response.json();
      // Handle different possible response formats
      const faculty = data.users || data.faculty || data.faculties || data || [];
      setFacultyList(faculty);
      return faculty;
    } catch (error) {
      console.error('Error fetching faculty list:', error);
      // Try alternative endpoint
      try {
        const response = await API_CONFIG.request('/api/faculty', {
          method: 'GET',
        });
        const data = await response.json();
        const faculty = data.faculty || data.faculties || data || [];
        setFacultyList(faculty);
        return faculty;
      } catch (err) {
        console.error('Error fetching faculty from alternative endpoint:', err);
        setError('Failed to load faculty list. Please try again.');
        setFacultyList([]);
        return [];
      }
    } finally {
      setLoadingFaculty(false);
    }
  };

  // Admin function to manage advisor
  const handleAdvisorClick = async () => {
    if (user?.role !== 'admin') {
      setError('You are not authorized to manage advisors');
      return;
    }
    setError(null);
    setShowAdvisorModal(true);
    // Fetch faculty list when modal opens, then set the current advisor ID
    await fetchFacultyList();
    setAdvisorId(student?.major_professor_id?.toString() || '');
  };

  const handleAdvisorSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!advisorId || advisorId.trim() === '') {
      setError('Please select an advisor');
      return;
    }

    try {
      const payload = {
        major_professor_id: parseInt(advisorId)
      };

      const response = await API_CONFIG.request(`/api/students/${studentId}/advisor`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        setStudent(data.student || data);
        setShowAdvisorModal(false);
        setAdvisorId('');
        // Refresh student data
        const refreshResponse = await API_CONFIG.request(`/api/students/${studentId}`, {
          method: 'GET',
        });
        const refreshData = await refreshResponse.json();
        setStudent(refreshData.student);
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update advisor');
      }
    } catch (error) {
      console.error('Error updating advisor:', error);
      setError(error.message || 'Failed to update advisor');
    }
  };

  const handleRemoveAdvisor = async () => {
    if (!window.confirm('Are you sure you want to remove this advisor?')) {
      return;
    }

    try {
      const response = await API_CONFIG.request(`/api/students/${studentId}/advisor`, {
        method: 'PUT',
        body: JSON.stringify({
          major_professor_id: null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setStudent(data.student || data);
        setShowAdvisorModal(false);
        setAdvisorId('');
        // Refresh student data
        const refreshResponse = await API_CONFIG.request(`/api/students/${studentId}`, {
          method: 'GET',
        });
        const refreshData = await refreshResponse.json();
        setStudent(refreshData.student);
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to remove advisor');
      }
    } catch (error) {
      console.error('Error removing advisor:', error);
      setError(error.message || 'Failed to remove advisor');
    }
  };

  // Check if a required document has been submitted
  const getDocumentStatus = (docName) => {
    const submittedDoc = documents.find(
      doc => doc.is_required && doc.required_document_type === docName
    );
    return submittedDoc ? { submitted: true, document: submittedDoc } : { submitted: false, document: null };
  };

  // Handle document view/download using student-specific endpoint
  const handleViewDocument = async (documentId, fileName) => {
    try {
      const response = await API_CONFIG.request(
        `/api/students/${studentId}/documents/${documentId}/download`,
        { method: 'GET' }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to download document: ${response.status}`);
      }
      
      // Convert response to blob
      const blob = await response.blob();
      
      // Create download link and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error viewing document:', error);
      alert('Failed to view document. You may not have permission to view this document.');
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
              <span className={`status-badge ${(student.i9_status || 'pending').toLowerCase()}`}>
                {student.i9_status || 'Pending'}
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
          {user?.role === 'admin' ? (
            <button className = "advisor-btn" onClick={handleAdvisorClick}>
              {student?.major_professor_id ? 'Edit Advisor' : 'Add Advisor'}
            </button>
          ) : (
            <button className = "delete-btn" onClick={dropAdvisee}>Drop Advisee</button>
          )}
        </div>

        {/* Documents Table Section */}
        <div className="documents-section">
          <h2>Required Documents & Forms</h2>
          {loadingDocuments ? (
            <div className="loading-documents">Loading documents...</div>
          ) : (
            <div className="documents-table-container">
              <table className="documents-table">
                <thead>
                  <tr>
                    <th>Document Name</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requiredDocuments.map((doc) => {
                    const status = getDocumentStatus(doc.name);
                    return (
                      <tr key={doc.id}>
                        <td className="doc-name-cell">
                          <strong>{doc.name}</strong>
                        </td>
                        <td className="doc-date-cell">{doc.dueDate}</td>
                        <td className="doc-status-cell">
                          <span className={`status-badge ${status.submitted ? 'completed' : 'pending'}`}>
                            {status.submitted ? 'Submitted' : 'Not Submitted'}
                          </span>
                        </td>
                        <td className="doc-actions-cell">
                          {status.submitted ? (
                            <button
                              className="view-doc-btn"
                              onClick={() => handleViewDocument(status.document.id, status.document.file_name)}
                            >
                              View Document
                            </button>
                          ) : (
                            <span className="no-document">No document available</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Advisor Management Modal */}
        {showAdvisorModal && (
          <div className="modal-overlay" onClick={() => setShowAdvisorModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Manage Advisor</h2>
                <button className="modal-close" onClick={() => setShowAdvisorModal(false)}>×</button>
              </div>
              <div className="modal-body">
                {error && <div className="error-message">{error}</div>}
                <div className="current-advisor-info">
                  <p><strong>Current Advisor:</strong></p>
                  {student?.major_professor ? (
                    <p>{student.major_professor.first_name} {student.major_professor.last_name} ({student.major_professor.email})</p>
                  ) : (
                    <p>No advisor assigned</p>
                  )}
                </div>
                {loadingFaculty ? (
                  <div className="loading-faculty">Loading faculty list...</div>
                ) : (
                  <form onSubmit={handleAdvisorSubmit}>
                    <div className="form-group">
                      <label htmlFor="advisorSelect">Select Advisor:</label>
                      <select
                        id="advisorSelect"
                        value={advisorId}
                        onChange={(e) => setAdvisorId(e.target.value)}
                        className="advisor-select"
                      >
                        <option value="">-- Select an advisor --</option>
                        {facultyList.map((faculty) => (
                          <option key={faculty.id || faculty.user?.id} value={faculty.id || faculty.user?.id}>
                            {faculty.user?.first_name || faculty.first_name} {faculty.user?.last_name || faculty.last_name}
                            {faculty.user?.email || faculty.email ? ` (${faculty.user?.email || faculty.email})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="modal-actions">
                      <button type="submit" className="submit-btn">
                        {student?.major_professor_id ? 'Update Advisor' : 'Assign Advisor'}
                      </button>
                      {student?.major_professor_id && (
                        <button type="button" className="remove-btn" onClick={handleRemoveAdvisor}>
                          Remove Advisor
                        </button>
                      )}
                      <button type="button" className="cancel-btn" onClick={() => setShowAdvisorModal(false)}>
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StudentDetail;