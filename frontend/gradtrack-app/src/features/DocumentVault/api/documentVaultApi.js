/*
This file contains the API calls for the Document Vault feature.
*/
import API_CONFIG from '../../../api/config';

const documentVaultApi = {
  // Fetch all documents for the authenticated user
  async getAllDocuments() {
    try {
      const response = await API_CONFIG.request(API_CONFIG.ENDPOINTS.DOCUMENTS, {
        method: 'GET',
      });
      return response.json();
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  },

  // Upload a document
  async uploadDocument(file, tag = 'Untagged', isRequired = false, requiredDocumentType = null) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('tag', tag);
      formData.append('is_required', isRequired ? '1' : '0');
      
      if (requiredDocumentType) {
        formData.append('required_document_type', requiredDocumentType);
      }

      const response = await API_CONFIG.request(API_CONFIG.ENDPOINTS.DOCUMENTS_UPLOAD, {
        method: 'POST',
        body: formData,
      });
      
      return response.json();
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  },

  // Download a document
  async downloadDocument(id, fileName) {
    try {
      const response = await API_CONFIG.request(
        API_CONFIG.ENDPOINTS.DOCUMENT_DOWNLOAD(id),
        { method: 'GET' }
      );
      
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
      console.error('Error downloading document:', error);
      throw error;
    }
  },

  // Delete a document
  async deleteDocument(id) {
    try {
      const response = await API_CONFIG.request(
        API_CONFIG.ENDPOINTS.DOCUMENT_DELETE(id),
        { method: 'DELETE' }
      );
      
      return response.json();
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  },

  // Get a single document's metadata
  async getDocument(id) {
    try {
      const response = await API_CONFIG.request(
        `/api/documents/${id}`,
        { method: 'GET' }
      );
      
      return response.json();
    } catch (error) {
      console.error('Error fetching document:', error);
      throw error;
    }
  },

  // Helper: Format file size for display
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Helper: Get file extension
  getFileExtension(filename) {
    return filename.split('.').pop().toLowerCase();
  },
};

export default documentVaultApi;