import { useState, useEffect, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import Layout from '../components/layout/Layout';
import API_CONFIG from '../api/config';
import './RemindersPage.css';

export default function RemindersPage() {
  const { user } = useContext(UserContext);
  const [reminders, setReminders] = useState([]);
  const [newReminder, setNewReminder] = useState({ text: '', due_date: '', priority: 'medium' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReminders = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await API_CONFIG.request('/api/reminders', {
          method: 'GET',
        });
        if (!response.ok) {
          throw new Error('Failed to fetch reminders');
        }
        const data = await response.json();
        setReminders(data);
      } catch (err) {
        console.error('Error fetching reminders:', err);
        setError('Failed to load reminders');
      } finally {
        setLoading(false);
      }
    };

    fetchReminders();
  }, []);

  const addReminder = async () => {
    if (!newReminder.text.trim()) {
      setError('Please enter reminder text');
      return;
    }

    try {
      setError(null);
      const response = await API_CONFIG.request('/api/reminders', {
        method: 'POST',
        body: JSON.stringify(newReminder),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create reminder');
      }

      const data = await response.json();
      setReminders([data, ...reminders]);
      setNewReminder({ text: '', due_date: '', priority: 'medium' });
    } catch (err) {
      console.error('Error creating reminder:', err);
      setError(err.message || 'Failed to create reminder');
    }
  };

  const deleteReminder = async (id) => {
    if (!window.confirm('Are you sure you want to delete this reminder?')) {
      return;
    }

    try {
      setError(null);
      const response = await API_CONFIG.request(`/api/reminders/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete reminder');
      }

      setReminders(reminders.filter(r => r.id !== id));
    } catch (err) {
      console.error('Error deleting reminder:', err);
      setError(err.message || 'Failed to delete reminder');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <Layout>
      <div className="reminders-page">
        <h2>My Reminders</h2>

        {error && <div className="error-message" style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#fee', color: '#c33', borderRadius: '6px' }}>{error}</div>}

        <div className="reminder-form">
          <input
            type="text"
            placeholder="Reminder text"
            value={newReminder.text}
            onChange={e => setNewReminder({ ...newReminder, text: e.target.value })}
            maxLength={255}
          />
          <input
            type="date"
            value={newReminder.due_date}
            onChange={e => setNewReminder({ ...newReminder, due_date: e.target.value })}
          />
          <select
            value={newReminder.priority}
            onChange={e => setNewReminder({ ...newReminder, priority: e.target.value })}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <button onClick={addReminder}>Add Reminder</button>
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading reminders...</div>
        ) : reminders.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>No reminders yet. Create one above!</div>
        ) : (
          <ul className="reminder-list">
            {reminders.map(r => (
              <li key={r.id} className={`priority-${r.priority}`}>
                <div className="reminder-content">
                  <span className="reminder-text">{r.text}</span>
                  {r.due_date && (
                    <span className="due-date">Due: {formatDate(r.due_date)}</span>
                  )}
                  {r.created_by && (
                    <span className="created-by" style={{ fontSize: '0.85rem', color: '#666', fontStyle: 'italic' }}>
                      From: {r.created_by.first_name} {r.created_by.last_name}
                    </span>
                  )}
                </div>
                <button 
                  className="delete-reminder-btn" 
                  onClick={() => deleteReminder(r.id)}
                  aria-label="Delete reminder"
                  title="Delete reminder"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  );
}
