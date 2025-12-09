import React, { useState, useEffect, useContext } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './CalendarWidget.css';
import API_CONFIG from '../../api/config';
import { UserContext } from '../../context/UserContext';

export default function CalendarWidget() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [reminders, setReminders] = useState([]);
  const [selectedDateReminders, setSelectedDateReminders] = useState([]);
  const { user } = useContext(UserContext);

  useEffect(() => {
    const fetchReminders = async () => {
      if (!user) return;
      
      try {
        const response = await API_CONFIG.request('/api/reminders', {
          method: 'GET',
        });
        if (response.ok) {
          const data = await response.json();
          setReminders(data);
        }
      } catch (error) {
        console.error('Error fetching reminders for calendar:', error);
      }
    };

    fetchReminders();
  }, [user]);

  // Update selected date reminders when date changes
  useEffect(() => {
    if (!selectedDate || !reminders.length) {
      setSelectedDateReminders([]);
      return;
    }
    
    const dateStr = formatDateForComparison(selectedDate);
    const remindersForDate = reminders.filter(r => {
      const reminderDate = r.due_date ? r.due_date.split('T')[0] : null;
      return reminderDate === dateStr;
    });
    setSelectedDateReminders(remindersForDate);
  }, [selectedDate, reminders]);

  // Format date for comparison
  const formatDateForComparison = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Check if a date has reminders
  const hasReminders = (date) => {
    const dateStr = formatDateForComparison(date);
    return reminders.some(r => {
      const reminderDate = r.due_date ? r.due_date.split('T')[0] : null;
      return reminderDate === dateStr;
    });
  };

  // Get reminder count for a date
  const getReminderCount = (date) => {
    const dateStr = formatDateForComparison(date);
    return reminders.filter(r => {
      const reminderDate = r.due_date ? r.due_date.split('T')[0] : null;
      return reminderDate === dateStr;
    }).length;
  };

  // Get highest priority for a date (high > medium > low)
  const getHighestPriority = (date) => {
    const dateStr = formatDateForComparison(date);
    const dateReminders = reminders.filter(r => {
      const reminderDate = r.due_date ? r.due_date.split('T')[0] : null;
      return reminderDate === dateStr;
    });
    
    if (dateReminders.some(r => r.priority === 'high')) return 'high';
    if (dateReminders.some(r => r.priority === 'medium')) return 'medium';
    if (dateReminders.some(r => r.priority === 'low')) return 'low';
    return 'medium'; // default
  };

  // Handle date change/click
  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  // Custom tile content to show reminder indicators
  const tileContent = ({ date, view }) => {
    if (view === 'month' && hasReminders(date)) {
      const count = getReminderCount(date);
      const priority = getHighestPriority(date);
      return (
        <div className="reminder-indicator" title={`${count} reminder${count > 1 ? 's' : ''} - Click to view`}>
          <span className={`reminder-dot priority-${priority}`}></span>
        </div>
      );
    }
    return null;
  };


  return (
    <div className="calendar-widget">
      <h2>Calendar</h2>
      <Calendar
        onChange={handleDateChange}
        value={selectedDate}
        tileContent={tileContent}
      />
      <div className="selected-date-info">
        <p><strong>Selected Date:</strong> {selectedDate.toDateString()}</p>
        {selectedDateReminders.length > 0 && (
          <div className="date-reminders">
            <strong>Reminders for this date:</strong>
            <ul className="reminder-list-mini">
              {selectedDateReminders.map(r => (
                <li key={r.id} className={`priority-${r.priority}`}>
                  {r.text}
                  {r.created_by && (
                    <span className="reminder-sender"> - From: {r.created_by.first_name} {r.created_by.last_name}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

    </div>
  );
}
