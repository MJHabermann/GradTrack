import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import Layout from '../components/layout/Layout';
import './RemindersPage.css';

export default function RemindersPage() {
  const { user } = useContext(UserContext);
  const [reminders, setReminders] = useState([]);
  const [newReminder, setNewReminder] = useState({ text: '', due_date: '', priority: 'medium' });

  useEffect(() => {
    axios.get('/api/reminders').then(res => setReminders(res.data));
  }, []);

  const addReminder = () => {
    axios.post('/api/reminders', newReminder).then(res => {
      setReminders([...reminders, res.data]);
      setNewReminder({ text: '', due_date: '', priority: 'medium' });
    });
  };

  return (
    <Layout>
    <div className="reminders-page">
      <h2>My Reminders</h2>

      <div className="reminder-form">
        <input
          type="text"
          placeholder="Reminder text"
          value={newReminder.text}
          onChange={e => setNewReminder({ ...newReminder, text: e.target.value })}
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

      <ul className="reminder-list">
        {reminders.map(r => (
          <li key={r.id} className={`priority-${r.priority}`}>
            <span>{r.text}</span>
            {r.due_date && <span className="due-date">Due: {r.due_date}</span>}
          </li>
        ))}
      </ul>
    </div>
    </Layout>
  );
}
