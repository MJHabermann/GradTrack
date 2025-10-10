import { useEffect, useState } from 'react';
import axios from 'axios';
import './MajorCompletionWidget.css';

const MajorCompletionWidget = ({ studentId }) => {
  const [completion, setCompletion] = useState(null);

  useEffect(() => {
    axios.get(`/api/major-completion/${studentId}`)
      .then(res => setCompletion(res.data))
      .catch(err => console.error(err));
  }, [studentId]);

  if (!completion) return <div className="major-widget">Loading...</div>;

  return (
    <div className="major-widget">
      <h3>Major Completion</h3>
<div className="circle-container">
  <svg className="progress-circle" viewBox="0 0 100 100" fill="none">
    <circle className="bg" cx="50" cy="50" r="40" />
    <circle
      className="fill"
      cx="50"
      cy="50"
      r="40"
      strokeDasharray="251.2"
      strokeDashoffset={251.2 - (completion.percentage / 100) * 251.2}
    />
    <text
      x="50%"
      y="50%"
      dominantBaseline="middle"
      textAnchor="middle"
    >
      {completion.percentage}%
    </text>
  </svg>
</div>
<p className="progress-text">
  {completion.completed} / {completion.required} credits
</p>

      </div>
  );
};

export default MajorCompletionWidget;
