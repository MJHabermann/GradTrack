import React, { useState, useEffect } from 'react';
import './AdminDocumentReviewWidget.css';
import { Link } from 'react-router-dom';
import documentVaultApi from '../../features/DocumentVault/api/documentVaultApi';

const AdminDocumentReviewWidget = () => {
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPendingDocuments();
  }, []);

  const loadPendingDocuments = async () => {
    try {
      const documents = await documentVaultApi.getAllDocumentsForReview();
      const pending = documents.filter(doc => doc.status === 'Pending Review');
      setPendingCount(pending.length);
    } catch (error) {
      console.error('Error loading pending documents:', error);
      setPendingCount(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-review-widget">

      {loading ? (
        <p>Loading...</p>
      ) : pendingCount > 0 ? (
        <div className="review-alert">
          <span className="review-text">{pendingCount} documents need review</span>
        </div>
      ) : (
        <div className="review-clear">
          <span className="review-text">All documents reviewed</span>
        </div>
      )}

      <Link to="/admin/documents" className="review-link">Go to Review Queue →</Link>
    </div>
  );
};

export default AdminDocumentReviewWidget;
