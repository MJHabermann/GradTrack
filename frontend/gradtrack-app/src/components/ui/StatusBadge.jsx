import React from 'react';

const StatusBadge = ({ status }) => {
  const getBadge = () => {
    switch (status) {
      case 'complete':
        return <span style={{ color: 'green' }}>✅ Complete</span>;
      case 'in-progress':
        return <span style={{ color: 'orange' }}>⏳ In Progress</span>;
      case 'pending':
        return <span style={{ color: 'red' }}>❌ Pending</span>;
      default:
        return <span>Unknown</span>;
    }
  };

  return <div>{getBadge()}</div>;
};

export default StatusBadge;
