import React, { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import './AdminDocumentReview.css';
import documentVaultApi from '../features/DocumentVault/api/documentVaultApi';

const AdminDocumentReview = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [searchString, setSearchString] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const docs = await documentVaultApi.getAllDocuments();
      const mapped = docs.map(doc => ({
        id: doc.id,
        name: doc.file_name,
        url: doc.file_path,
        size: formatFileSize(doc.file_size),
        type: doc.file_type,
        date: new Date(doc.created_at).toLocaleDateString(),
        tag: doc.tag,
        status: doc.status,
        uploadedBy: doc.uploaded_by,
      }));
      setDocuments(mapped);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handlePreview = (url) => {
    window.open(url, '_blank');
  };

  const handleDownload = async (id, name) => {
    try {
      await documentVaultApi.downloadDocument(id, name);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download document');
    }
  };

  const filteredDocs = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchString.toLowerCase())
  );

  return (
    <>
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Navbar />
      <main style={{ paddingLeft: sidebarOpen ? '230px' : '0' }}>
        <div className="admin-docs-container">
          <div className="admin-docs-header">
            <h1>Document Review Queue</h1>
            <p>Review and manage all uploaded documents across the system</p>
          </div>

          <div className="search-wrapper">
            <input
              type="text"
              placeholder="Search by file name..."
              className="search-input"
              value={searchString}
              onChange={(e) => setSearchString(e.target.value)}
            />
          </div>

          {loading ? (
            <p>Loading documents...</p>
          ) : (
            <div className="document-list">
              {filteredDocs.map(doc => (
                <div key={doc.id} className="document-card">
                  <div className="doc-info">
                    <h4>{doc.name}</h4>
                    <p><strong>Uploaded by:</strong> {doc.uploadedBy}</p>
                    <p><strong>Date:</strong> {doc.date}</p>
                    <p><strong>Size:</strong> {doc.size}</p>
                    <p><strong>Status:</strong> {doc.status}</p>
                  </div>
                  <div className="doc-actions">
                    <button onClick={() => handlePreview(doc.url)}>Preview</button>
                    <button onClick={() => handleDownload(doc.id, doc.name)}>Download</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default AdminDocumentReview;
