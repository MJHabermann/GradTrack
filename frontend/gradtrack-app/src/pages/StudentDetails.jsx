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
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [declineReason, setDeclineReason] = useState('');
  const [updating, setUpdating] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    program_type: '',
    start_term: '',
    graduation_term: '',
  });
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderFormData, setReminderFormData] = useState({
    text: '',
    due_date: '',
    priority: 'medium',
  });
  const [sendingReminder, setSendingReminder] = useState(false);
  
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

  // Check if a required document has been submitted and get its details
  const getDocumentStatus = (docName) => {
    const submittedDoc = documents.find(
      doc => doc.is_required && doc.required_document_type === docName
    );
    return submittedDoc ? { 
      submitted: true, 
      document: submittedDoc,
      status: submittedDoc.status || 'Pending Review',
      reviewComment: submittedDoc.review_comment || null
    } : { 
      submitted: false, 
      document: null,
      status: null,
      reviewComment: null
    };
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

  // Handle document approval
  const handleApprove = async (doc) => {
    if (!confirm(`Are you sure you want to approve "${doc.file_name}"?`)) {
      return;
    }

    try {
      setUpdating(true);
      await documentVaultApi.updateDocumentStatus(doc.id, 'Approved');
      alert('Document approved successfully');
      // Reload documents
      const response = await API_CONFIG.request(`/api/students/${studentId}/documents`, {
        method: 'GET',
      });
      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error('Error approving document:', error);
      alert('Failed to approve document. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  // Handle decline click
  const handleDeclineClick = (doc) => {
    setSelectedDocument(doc);
    setDeclineReason('');
    setShowDeclineModal(true);
  };

  // Handle decline submit
  const handleDeclineSubmit = async () => {
    if (!declineReason.trim()) {
      alert('Please provide a reason for declining this document.');
      return;
    }

    if (!selectedDocument) return;

    try {
      setUpdating(true);
      await documentVaultApi.updateDocumentStatus(
        selectedDocument.id,
        'Declined',
        declineReason.trim()
      );
      alert('Document declined successfully');
      setShowDeclineModal(false);
      setSelectedDocument(null);
      setDeclineReason('');
      // Reload documents
      const response = await API_CONFIG.request(`/api/students/${studentId}/documents`, {
        method: 'GET',
      });
      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error('Error declining document:', error);
      alert('Failed to decline document. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    if (!status) return 'status-badge';
    const statusLower = status.toLowerCase().replace(/\s+/g, '-');
    switch (statusLower) {
      case 'approved':
        return 'status-badge approved';
      case 'declined':
        return 'status-badge declined';
      case 'pending-review':
        return 'status-badge pending';
      default:
        return 'status-badge';
    }
  };

  // Check if user can review documents
  const canReviewDocuments = user?.role === 'admin' || user?.role === 'faculty';

  // Handle edit student button click
  const handleEditStudentClick = () => {
    if (user?.role !== 'admin') {
      setError('You are not authorized to edit students');
      return;
    }
    setError(null);
    // Populate form with current student data
    setEditFormData({
      first_name: student.user.first_name || '',
      last_name: student.user.last_name || '',
      email: student.user.email || '',
      password: '', // Don't pre-fill password
      program_type: student.program_type || '',
      start_term: student.start_term || '',
      graduation_term: student.graduation_term || '',
    });
    setShowEditModal(true);
  };

  // Handle edit form submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setUpdating(true);

    try {
      // Update user information
      const userUpdateData = {
        first_name: editFormData.first_name,
        last_name: editFormData.last_name,
        email: editFormData.email,
      };
      
      // Only include password if it's provided
      if (editFormData.password && editFormData.password.trim() !== '') {
        userUpdateData.password = editFormData.password;
      }

      const userResponse = await API_CONFIG.request(`/api/users/${student.user.id}`, {
        method: 'PUT',
        body: JSON.stringify(userUpdateData),
      });

      if (!userResponse.ok) {
        const errorData = await userResponse.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update user information');
      }

      // Update student information
      const studentUpdateData = {
        program_type: editFormData.program_type,
        start_term: editFormData.start_term,
        graduation_term: editFormData.graduation_term || null,
      };

      const studentResponse = await API_CONFIG.request(`/api/students/${studentId}`, {
        method: 'PUT',
        body: JSON.stringify(studentUpdateData),
      });

      if (!studentResponse.ok) {
        const errorData = await studentResponse.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update student information');
      }

      // Refresh student data
      const refreshResponse = await API_CONFIG.request(`/api/students/${studentId}`, {
        method: 'GET',
      });
      const refreshData = await refreshResponse.json();
      setStudent(refreshData.student);
      
      setShowEditModal(false);
      setEditFormData({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        program_type: '',
        start_term: '',
        graduation_term: '',
      });
      alert('Student information updated successfully');
    } catch (error) {
      console.error('Error updating student:', error);
      setError(error.message || 'Failed to update student information');
    } finally {
      setUpdating(false);
    }
  };

  // Handle reminder button click
  const handleReminderClick = () => {
    if (user?.role !== 'admin' && user?.role !== 'faculty') {
      setError('You are not authorized to send reminders');
      return;
    }
    setError(null);
    setShowReminderModal(true);
    setReminderFormData({
      text: '',
      due_date: '',
      priority: 'medium',
    });
  };

  // Handle reminder form submission
  const handleReminderSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!reminderFormData.text.trim()) {
      setError('Please enter reminder text');
      return;
    }

    setSendingReminder(true);

    try {
      const response = await API_CONFIG.request(`/api/students/${studentId}/reminders`, {
        method: 'POST',
        body: JSON.stringify({
          text: reminderFormData.text.trim(),
          due_date: reminderFormData.due_date || null,
          priority: reminderFormData.priority,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'Failed to send reminder');
      }

      const data = await response.json();
      alert('Reminder sent successfully!');
      setShowReminderModal(false);
      setReminderFormData({
        text: '',
        due_date: '',
        priority: 'medium',
      });
    } catch (error) {
      console.error('Error sending reminder:', error);
      setError(error.message || 'Failed to send reminder');
    } finally {
      setSendingReminder(false);
    }
  };

  // Handle delete student
  const handleDeleteStudent = async () => {
    if (!window.confirm(`Are you sure you want to delete ${student.user.first_name} ${student.user.last_name}? This action cannot be undone.`)) {
      return;
    }

    if (!window.confirm('This will permanently delete the student and their associated user account. Are you absolutely sure?')) {
      return;
    }

    setError(null);
    setUpdating(true);

    try {
      // Delete student 
      const studentResponse = await API_CONFIG.request(`/api/students/${studentId}`, {
        method: 'DELETE',
      });

      if (!studentResponse.ok) {
        throw new Error('Failed to delete student');
      }

      // Also delete the user account
      const userResponse = await API_CONFIG.request(`/api/users/${student.user.id}`, {
        method: 'DELETE',
      });

      if (!userResponse.ok) {
        console.warn('Student deleted but user deletion failed');
      }

      alert('Student deleted successfully');
      navigate('/admin-dashboard');
    } catch (error) {
      console.error('Error deleting student:', error);
      setError(error.message || 'Failed to delete student');
    } finally {
      setUpdating(false);
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
          {(user?.role === 'admin' || user?.role === 'faculty') && (
            <button className = "message-btn" onClick={handleReminderClick}>Send Reminder</button>
          )}
          {user?.role === 'admin' && (
            <button className = "edit-btn" onClick={handleEditStudentClick}>
              Edit Student
            </button>
          )}
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
                    {/* <th>Due Date</th> */}
                    <th>Status</th>
                    {canReviewDocuments && <th>Review</th>}
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
                          {doc.description && (
                            <div className="doc-description-cell">{doc.description}</div>
                          )}
                        </td>
                        {/* <td className="doc-date-cell">{doc.dueDate}</td> */}
                        <td className="doc-status-cell">
                          {status.submitted ? (
                            <div className="document-status-container">
                              <span className={getStatusBadgeClass(status.status)}>
                                {status.status || 'Pending Review'}
                              </span>
                              {status.reviewComment && status.status === 'Declined' && (
                                <div className="review-comment-preview">
                                  <strong>Decline Reason:</strong> {status.reviewComment}
                                </div>
                              )}
                              {status.document && (
                                <div className="uploaded-file-info">
                                  <small>File: {status.document.file_name}</small>
                                  <small>Uploaded: {new Date(status.document.created_at).toLocaleDateString()}</small>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="status-badge pending">Not Submitted</span>
                          )}
                        </td>
                        {canReviewDocuments && (
                          <td className="doc-review-cell">
                            {status.submitted && status.status === 'Pending Review' && (
                              <div className="review-buttons">
                                <button
                                  className="approve-btn-small"
                                  onClick={() => handleApprove(status.document)}
                                  disabled={updating}
                                >
                                  Approve
                                </button>
                                <button
                                  className="decline-btn-small"
                                  onClick={() => handleDeclineClick(status.document)}
                                  disabled={updating}
                                >
                                  Decline
                                </button>
                              </div>
                            )}
                            {status.submitted && status.status !== 'Pending Review' && (
                              <span className="reviewed-badge">Reviewed</span>
                            )}
                            {!status.submitted && (
                              <span className="no-document-badge">No document</span>
                            )}
                          </td>
                        )}
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

        {/* Decline Document Modal */}
        {showDeclineModal && (
          <div className="modal-overlay" onClick={() => setShowDeclineModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Decline Document</h2>
                <button className="modal-close" onClick={() => setShowDeclineModal(false)}>×</button>
              </div>
              <div className="modal-body">
                <p>
                  <strong>Document:</strong> {selectedDocument?.file_name}
                </p>
                <div className="form-group">
                  <label htmlFor="declineReason">
                    <strong>Reason for Decline (Required):</strong>
                  </label>
                  <textarea
                    id="declineReason"
                    value={declineReason}
                    onChange={(e) => setDeclineReason(e.target.value)}
                    placeholder="Please provide a reason for declining this document..."
                    rows="5"
                    maxLength={1000}
                    className="decline-reason-input"
                  />
                  <span className="char-count">
                    {declineReason.length}/1000 characters
                  </span>
                </div>
                <div className="modal-actions">
                  <button
                    className="cancel-btn"
                    onClick={() => {
                      setShowDeclineModal(false);
                      setSelectedDocument(null);
                      setDeclineReason('');
                    }}
                    disabled={updating}
                  >
                    Cancel
                  </button>
                  <button
                    className="submit-decline-btn"
                    onClick={handleDeclineSubmit}
                    disabled={updating || !declineReason.trim()}
                  >
                    {updating ? 'Submitting...' : 'Submit Decline'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Student Modal */}
        {showEditModal && (
          <div className="modal-overlay" onClick={() => !updating && setShowEditModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Edit Student Information</h2>
                <button className="modal-close" onClick={() => !updating && setShowEditModal(false)} disabled={updating}>×</button>
              </div>
              <div className="modal-body">
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleEditSubmit}>
                  <div className="form-group">
                    <label htmlFor="editFirstName">First Name:</label>
                    <input
                      type="text"
                      id="editFirstName"
                      value={editFormData.first_name}
                      onChange={(e) => setEditFormData({...editFormData, first_name: e.target.value})}
                      required
                      disabled={updating}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="editLastName">Last Name:</label>
                    <input
                      type="text"
                      id="editLastName"
                      value={editFormData.last_name}
                      onChange={(e) => setEditFormData({...editFormData, last_name: e.target.value})}
                      required
                      disabled={updating}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="editEmail">Email:</label>
                    <input
                      type="email"
                      id="editEmail"
                      value={editFormData.email}
                      onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                      required
                      disabled={updating}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="editPassword">New Password (leave blank to keep current):</label>
                    <input
                      type="password"
                      id="editPassword"
                      value={editFormData.password}
                      onChange={(e) => setEditFormData({...editFormData, password: e.target.value})}
                      disabled={updating}
                      placeholder="Enter new password or leave blank"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="editProgramType">Program Type:</label>
                    <select
                      id="editProgramType"
                      value={editFormData.program_type}
                      onChange={(e) => setEditFormData({...editFormData, program_type: e.target.value})}
                      required
                      disabled={updating}
                    >
                      <option value="">Select program type</option>
                      <option value="Masters">Masters</option>
                      <option value="PhD">PhD</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="editStartTerm">Start Term:</label>
                    <input
                      type="text"
                      id="editStartTerm"
                      value={editFormData.start_term}
                      onChange={(e) => setEditFormData({...editFormData, start_term: e.target.value})}
                      required
                      disabled={updating}
                      placeholder="e.g., Fall 2024"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="editGraduationTerm">Graduation Term (optional):</label>
                    <input
                      type="text"
                      id="editGraduationTerm"
                      value={editFormData.graduation_term}
                      onChange={(e) => setEditFormData({...editFormData, graduation_term: e.target.value})}
                      disabled={updating}
                      placeholder="e.g., Spring 2026"
                    />
                  </div>
                  <div className="modal-actions">
                    <button type="submit" className="submit-btn" disabled={updating}>
                      {updating ? 'Updating...' : 'Update Student'}
                    </button>
                    <button
                      type="button"
                      className="delete-btn"
                      onClick={handleDeleteStudent}
                      disabled={updating}
                      style={{ backgroundColor: '#dc3545', color: 'white' }}
                    >
                      Delete Student
                    </button>
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={() => setShowEditModal(false)}
                      disabled={updating}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

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

        {/* Send Reminder Modal */}
        {showReminderModal && (
          <div className="modal-overlay" onClick={() => !sendingReminder && setShowReminderModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Send Reminder to {student?.user?.first_name} {student?.user?.last_name}</h2>
                <button className="modal-close" onClick={() => !sendingReminder && setShowReminderModal(false)} disabled={sendingReminder}>×</button>
              </div>
              <div className="modal-body">
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleReminderSubmit}>
                  <div className="form-group">
                    <label htmlFor="reminderText">
                      <strong>Reminder Text (Required):</strong>
                    </label>
                    <textarea
                      id="reminderText"
                      value={reminderFormData.text}
                      onChange={(e) => setReminderFormData({...reminderFormData, text: e.target.value})}
                      placeholder="Enter reminder message..."
                      rows="5"
                      maxLength={255}
                      required
                      disabled={sendingReminder}
                      className="reminder-text-input"
                    />
                    <span className="char-count">
                      {reminderFormData.text.length}/255 characters
                    </span>
                  </div>
                  <div className="form-group">
                    <label htmlFor="reminderDueDate">
                      <strong>Due Date (Optional):</strong>
                    </label>
                    <input
                      type="date"
                      id="reminderDueDate"
                      value={reminderFormData.due_date}
                      onChange={(e) => setReminderFormData({...reminderFormData, due_date: e.target.value})}
                      disabled={sendingReminder}
                    />
                    <small className="form-hint">If set, this reminder will appear on the student's calendar</small>
                  </div>
                  <div className="form-group">
                    <label htmlFor="reminderPriority">
                      <strong>Priority:</strong>
                    </label>
                    <select
                      id="reminderPriority"
                      value={reminderFormData.priority}
                      onChange={(e) => setReminderFormData({...reminderFormData, priority: e.target.value})}
                      disabled={sendingReminder}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div className="modal-actions">
                    <button
                      type="submit"
                      className="submit-btn"
                      disabled={sendingReminder || !reminderFormData.text.trim()}
                    >
                      {sendingReminder ? 'Sending...' : 'Send Reminder'}
                    </button>
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={() => setShowReminderModal(false)}
                      disabled={sendingReminder}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StudentDetail;