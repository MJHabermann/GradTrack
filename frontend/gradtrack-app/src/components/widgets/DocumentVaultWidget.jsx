import React from 'react';
import './DocumentVaultWidget.css';
import {Link} from 'react-router-dom';


const DocumentVaultWidget = () => {
  const recentFiles = [];

  return (
    <div className="vault-widget">
      <h3>Documents</h3>
      <ul className="vault-list">
        {recentFiles.map((file, index) => (
          <li key={index} className="vault-item">
            <span className="file-name">{file.name}</span>
            <span className="file-tag">{file.tag}</span>
            <span className="file-date">{file.date}</span>
          </li>
        ))}
      </ul>
      <Link to="/documents" className="vault-link">See All Uploads →</Link>
    </div>
  );
};

export default DocumentVaultWidget;
