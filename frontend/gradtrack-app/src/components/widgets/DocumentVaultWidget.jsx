import React, { useState, useEffect } from 'react';
import './DocumentVaultWidget.css';
import {Link} from 'react-router-dom';
import documentVaultApi from '../../features/DocumentVault/api/documentVaultApi';


const DocumentVaultWidget = () => {
  const [formsNeeded, setFormsNeeded] = useState(0);
  const [loading, setLoading] = useState(true);
  const TOTAL_FORMS_NEEDED = 6; // 5 if international student, 6 if domestic student
  // TODO

  useEffect(() => {
    loadDocumentCount();
  }, []);

  const loadDocumentCount = async () => {
    try {
      const documents = await documentVaultApi.getAllDocuments();
      const requiredDocumentsCount = documents.filter(document => document.is_required).length;

      const missingDocumentsCount = TOTAL_FORMS_NEEDED - requiredDocumentsCount;
      setFormsNeeded(missingDocumentsCount);
      setLoading(false);
    } catch (error) {
      console.error('Error loading document count:', error);
      // If it's an auth error, assume all forms are needed
      if (error.message.includes('Unauthenticated') || error.message.includes('401')) {
        setFormsNeeded(TOTAL_FORMS_NEEDED);
      }
      setLoading(false);
    }
  };
  return (
    <div className="vault-widget">
      <h3>Documents</h3>

      {formsNeeded > 0 && (
        <div className="forms-needed">
          <span className="forms-needed-icon">⚠️</span>
          <span className="forms-needed-text">Required forms need attention</span>
        </div>
      )}
      {formsNeeded === 0 && (
        <div className="forms-needed-completed">
          <span className="forms-needed-icon">✅</span>
          <span className="forms-needed-text">Required forms completed</span>
        </div>
      )}
      <Link to="/documents" className="vault-link">See All Uploads →</Link>
    </div>
  );
};

export default DocumentVaultWidget;
