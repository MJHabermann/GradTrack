import React, { useState } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import './Documents.css';

const Documents = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);

  // Files state statically set for testing
  const [files, setFiles] = useState([]);
  const [searchString, setSearchString] = useState('');

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
  const handleFileDelete = (id) => {
    setFiles(files.filter((file) => file.id !== id));
  }

  // Download files
  /*
  * ID: file to download
  */
  const handleFileDownload = (id) => {
    const file = files.find(f => f.id === id)
    if (file && file.url) {
      const link = document.createElement('a'); //create a html element
      link.href = file.url; //href to file url
      link.download = file.name; //set file name
      link.click();
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
  const handleFileUpload = (file) => {
    if (file.size > MAX_FILE_SIZE) {
      alert('File size must be less than 10MB');
      return;
    }
    if (!fileTypes.includes(file.type)) {
      alert('File type must be pdf or docx');
      return;
    }

    const newFile = {
      id: files.length + 1,
      name: file.name,
      tag: 'Untagged',
      date: new Date().toLocaleDateString(),
      size: formatFileSize(file.size),
      type: getFileExtension(file.name),
      url: URL.createObjectURL(file),
    }

    setFiles([...files, newFile]);
    alert('File uploaded successfully');

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
                        onClick={() => document.getElementById('file-input').click()}
                      >
                        Upload {doc.name}
                      </button>
                    )}
                    {doc.uploaded && (
                      <button className="view-uploaded-btn">View Document</button>
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