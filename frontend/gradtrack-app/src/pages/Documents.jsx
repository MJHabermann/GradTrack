import React, { useState } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import './Documents.css';

const Documents = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);

  // Files state
  const [files, setFiles] = useState([
    { id: 1, name: 'Thesis_Draft_1.pdf', tag: 'Thesis', date: 'Oct 3', size: '1.2MB', type: 'pdf'},
    { id: 2, name: 'Research_Notes.docx', tag: 'Research', date: 'Oct 1', size: '1.2MB', type: 'docx'},
    { id: 3, name: 'Meeting_Notes.pdf', tag: 'Meeting', date: 'Sep 28', size: '1.2MB', type: 'pdf'},
  ]);

  const fileTypes = ['application/pdf', 'application/docx', 'application/doc', 'application/jpg', 'application/jpeg', 'application/png', 'application/gif', 'application/bmp', 'application/tiff', 'application/ico', 'application/webp'];
  
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

  // Let user pick file from computer
  const handleFilePick = (e) => {
    e.preventDefault();
    const selectedFile = Array.from(e.target.files)[0];
    handleFileUpload(selectedFile);
  }

  // File delete handling
  const handleFileDelete = (id) => {
    setFiles(files.filter((file) => file.id !== id));
  }

  // File upload handling
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const handleFileUpload = (file) => {
    if(file.size > MAX_FILE_SIZE) {
      alert('File size must be less than 10MB');
      return;
    }
    if(!fileTypes.includes(file.type)) {
      alert('File type must be pdf or docx');
      return;
    }

    const newFile = {
        id: files.length + 1,
        name: file.name,
        tag: file.tag,
        date: file.date,
        size: file.size,
        type: file.type,
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

          {/* Upload */}
          <div className="upload-section" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
            <div className="upload-icon">📁</div>
            <div className="upload-text">Drop files here or click to upload</div>
            <div className="upload-subtext">Supports PDF, DOC, DOCX, images</div>
            <input type = "file" onChange={handleFilePick} multiple id="file-input" style={{ display: 'none' }} />
            <button className="upload-btn" onClick={() => document.getElementById('file-input').click()}>Upload Files</button>
          </div>

          {/* Files Grid */}
          <div className="files-grid">
            <div className="file-card">
              <div className="file-header">
                <div className="file-icon">📄</div>
                <div className="file-info">
                  <div className="file-name">Thesis_Draft_1.pdf</div>
                  <div className="file-meta">1.2MB • Oct 3</div>
                  <div className="file-tags">
                    <span className="file-tag">Thesis</span>
                    <span className="file-tag">Spring 2025</span>
                  </div>
                </div>
              </div>
              <div className="file-actions">
                <button className="action-btn" onClick={() => handleFilePreview(file.id)}>Preview</button>
                <button className="action-btn" onClick={() => handleFileDownload(file.id)}>Download</button>
                <button className="action-btn delete" onClick={() => handleFileDelete(file.id)}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Documents;