import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './CalendarWidget.css';

export default function CalendarWidget() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <div className="calendar-widget">
      <h2>Calendar</h2>
      <Calendar
        onChange={setSelectedDate}
        value={selectedDate}
      />
      <p>Selected Date: {selectedDate.toDateString()}</p>
    </div>
  );
}
