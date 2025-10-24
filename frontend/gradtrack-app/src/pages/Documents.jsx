import React, { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import './Documents.css';
import documentVaultApi from '../features/DocumentVault/api/documentVaultApi';

const Documents = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);

  // Files state statically set for testing
  const [files, setFiles] = useState([]);
  const [searchString, setSearchString] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fileTypes = ['application/pdf', 'application/docx', 'application/doc'];

  // Required documents
  const [requiredDocuments, setRequiredDocuments] = useState([
    {
      id: 1,
      name: 'Application Form',
      required: true,
      dueDate: '2025-10-20',
      fileTypes: ['pdf'],
      description: 'Completed graduate application form submitted through the online portal',
      status: 'pending',
      uploaded: false
    },
    {
      id: 2,
      name: 'Official Transcripts',
      required: true,
      dueDate: '2025-10-25',
      fileTypes: ['pdf'],
      description: 'Transcripts from all previously attended institutions',
      status: 'pending',
      uploaded: false
    },
    {
      id: 3,
      name: 'Letters of Recommendation',
      required: true,
      dueDate: '2025-10-30',
      fileTypes: ['pdf'],
      description: 'Two or three signed recommendation letters from academic or professional references',
      status: 'pending',
      uploaded: false
    },
    {
      id: 4,
      name: 'Statement of Purpose',
      required: true,
      dueDate: '2025-11-05',
      fileTypes: ['pdf', 'docx'],
      description: 'Personal statement outlining academic goals and reasons for pursuing graduate study',
      status: 'pending',
      uploaded: false
    },
    {
      id: 5,
      name: 'Resume or CV',
      required: true,
      dueDate: '2025-11-10',
      fileTypes: ['pdf', 'docx'],
      description: 'Detailed record of academic background, research, and work experience',
      status: 'pending',
      uploaded: false
    },
    {
      id: 6,
      name: 'I-9 Employment Eligibility Verification',
      required: true,
      dueDate: '2025-08-15',
      fileTypes: ['pdf'],
      description: 'Employment eligibility verification (International students)',
      status: 'pending',
      uploaded: false
    }
  ]);

 useEffect(() => {
  loadDocuments();
}, []);

//Get documents from server
const loadDocuments = async () => {
  try {
    setLoading(true);
    const documents = await documentVaultApi.getAllDocuments();
    const mappedFiles = (documents.map(document => ({
      id: document.id,
      name: document.file_name,
      url: document.file_path,
      size: formatFileSize(document.file_size),
      type: document.file_type,
      date: new Date(document.created_at).toLocaleDateString(),
      tag: document.tag,
      isRequired: document.is_required,
      requiredDocumentType: document.required_document_type,
    })));
    setFiles(mappedFiles);
    updateRequiredDocuments(mappedFiles);
    setLoading(false);
  } catch (error) {
    console.error('Error loading documents:', error);
    setLoading(false);
  }
}

const updateRequiredDocuments = (uploadedFiles) => {
  const updatedDocsStatus = requiredDocuments.map(doc => {
    let isUploaded = false;

    for(let i = 0; i < uploadedFiles.length; i++) {
      const file = uploadedFiles[i];
      if(file.isRequired && file.requiredDocumentType === doc.name) {
        isUploaded = true;
        break;
      }
    }
    return {
      ...doc,
      uploaded: isUploaded,
      status: isUploaded ? 'completed' : 'pending',
    };
  });
  setRequiredDocuments(updatedDocsStatus);
};


  // File dragging functionality
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  }
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  }

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    droppedFiles.forEach((file) => {
      handleFileUpload(file);
    });
  }

  // File preview handling
  const handleFilePreview = (id) => {
    const file = files.find((file) => file.id === id);
    window.open(file.url, '_blank');
  }

  // Let user pick file from local
  const handleFilePick = (e) => {
    e.preventDefault();
    const selectedFile = Array.from(e.target.files)[0];
    handleFileUpload(selectedFile);
  }

  // File delete handling
  const handleFileDelete = async (id) => {  
    if(!confirm('Are you sure you want to delete this file?')) return;
    try {
      await documentVaultApi.deleteDocument(id);
      setFiles(files.filter((file) => file.id !== id));
      updateRequiredDocuments(files.filter((file) => file.id !== id));
      alert('Document deleted successfully');
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document');
    }
  };

  // Download files
  /*
  * ID: file to download
  */
  const handleFileDownload = async (id, file_name) => {
    const file = files.find(f => f.id === id)
    if(!file) return;
    try {
      await documentVaultApi.downloadDocument(id, file.name);
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Failed to download document');
    }
  }

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get file extension
  const getFileExtension = (filename) => {
    return filename.split('.').pop().toLowerCase();
  };

  // Search files logic
  const fileSearch = files.filter(file => {
    if (searchString === '') {
      return true;
    }
    else {
      return file.name.toLowerCase().includes(searchString.toLowerCase());
    }

  });



  // File upload handling
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const handleFileUpload = async (file, requiredDocumentType = null) => {
    if (file.size > MAX_FILE_SIZE) {
      alert('File size must be less than 10MB');
      return;
    }
    if (!fileTypes.includes(file.type)) {
      alert('File type must be pdf or docx');
      return;
    }
    setUploading(true);
    try {
    const response = await documentVaultApi.uploadDocument(file,
      'Untagged',
      requiredDocumentType ? true : false,
      requiredDocumentType
    );
      const newDocument = {
        id: response.document.id,
        name: response.document.file_name,
        url: response.document.file_path,
        size: formatFileSize(response.document.file_size),
        type: response.document.file_type,
        date: new Date(response.document.created_at).toLocaleDateString(),
        tag: response.document.tag,
        isRequired: response.document.is_required,
        requiredDocumentType: response.document.required_document_type,
      }
      const updatedFiles = [...files, newDocument];
      setFiles(updatedFiles);
      updateRequiredDocuments(updatedFiles);
      alert('Document uploaded successfully');
      setUploading(false);
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Failed to upload document');
      setUploading(false);
    }
  };

  return (
    <>
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Navbar />
      <main style={{ paddingLeft: sidebarOpen ? '230px' : '0' }}>
        <div className="documents-container">
          <div className="documents-header">
            <h1>Document Vault</h1>
            <p>Manage your academic documents, research papers, and important files</p>
          </div>

          {/* Search */}
          <div className="search-section">
            <input
              type="text"
              placeholder="Search documents..."
              className="search-input"
              value={searchString}
              onChange={(e) => setSearchString(e.target.value)}
            />
          </div>

          {/* Filter */}
          <div className="filter-section">
            <select className="filter-select">
              <option value="">All Tags</option>
              <option value="Thesis">Thesis</option>
              <option value="Research">Research</option>
            </select>
          </div>

          {/* Required Documents Section */}
          <div className="required-documents-section">
            <h3>Required Documents</h3>
            <div className="required-docs-list">
              {requiredDocuments.map(doc => (
                <div key={doc.id} className={`required-doc-item ${doc.uploaded ? 'completed' : 'pending'}`}>
                  <div className="doc-header">
                    <span className="doc-name">{doc.name}</span>
                    <span className={`doc-status ${doc.status}`}>
                      {doc.uploaded ? 'Uploaded' : 'Missing'}
                    </span>
                  </div>
                  <div className="doc-details">
                    <span className="due-date">Due: {doc.dueDate}</span>
                    <span className="doc-description">{doc.description}</span>
                  </div>
                  <div className="doc-actions">
                    {!doc.uploaded && (
                      <button
                        className="upload-required-btn"
                        onClick={() =>{
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = '.pdf, .docx, .doc';
                          input.onchange = (e) => {
                            const file = e.target.files[0];
                            handleFileUpload(file, doc.name);
                          };
                          input.click();
                        }}
                      >
                        Upload {doc.name}
                      </button>
                    )}
                    {doc.uploaded && (
                      <>
                      <button className="view-uploaded-btn" onClick={() => {
                        const uploadedDocument = files.find(file => file.isRequired && file.requiredDocumentType === doc.name);
                        if(uploadedDocument) {
                          handleFileDownload(uploadedDocument.id, uploadedDocument.name);
                        }
                      }}>View Document</button>
                      <button className="action-btn delete" onClick={() => {
                        const uploadedDocument = files.find(file => file.isRequired && file.requiredDocumentType === doc.name);
                        if(uploadedDocument) {
                          handleFileDelete(uploadedDocument.id);
                        }
                      }}>Delete</button>
                    <span className="uploaded-file-name">
                    {files.find(file => file.isRequired && file.requiredDocumentType === doc.name)?.name}
                    </span>
                    </>
                    )}

                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upload */}
          <div className="upload-section" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
            <div className="upload-icon">📁</div>
            <div className="upload-text">Drop files here or click to upload</div>
            <div className="upload-subtext">Supports PDF, DOC, DOCX, images</div>
            <input type="file" onChange={handleFilePick} multiple id="file-input" style={{ display: 'none' }} />
            <button className="upload-btn" onClick={() => document.getElementById('file-input').click()}>Upload Files</button>
          </div>

          {/* Files Grid */}
          <div className="files-grid">
            {fileSearch.map((file) => (
              <div key={file.id} className="file-card">
                <div className="file-header">
                  <div className="file-icon">📄</div>
                  <div className="file-info">
                    <div className="file-name">{file.name}</div>
                    <div className="file-meta">{file.size} • {file.date}</div>
                    <div className="file-tags">
                      <span className="file-tag">{file.tag}</span>
                    </div>
                  </div>
                </div>
                <div className="file-actions">
                  {/*!-- Add preview if time permits
                <button className="action-btn" onClick={() => handleFilePreview(file.id)}>Preview</button>
                */}
                  <button className="action-btn" onClick={() => handleFileDownload(file.id)}>Download</button>
                  <button className="action-btn delete" onClick={() => handleFileDelete(file.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
};
export default Documents; 
