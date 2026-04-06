import React, { useState } from 'react';
import './App.css';

const RESOURCES = [
  { id: 'h1', name: 'Main Hall', type: 'Hall', capacity: 100, hours: 7 },
  { id: 'h2', name: 'Seminar Room A', type: 'Room', capacity: 30, hours: 7 },
  { id: 'h3', name: 'Conference Room', type: 'Room', capacity: 20, hours: 7 },
  { id: 'c1', name: 'Computer Center 1', type: 'Lab', capacity: 50, hours: 7 },
  { id: 'c2', name: 'Computer Center 2', type: 'Lab', capacity: 50, hours: 7 },
];

function App() {
  const [bookings, setBookings] = useState([]);
  const [selectedResource, setSelectedResource] = useState(null);
  const [selectedHours, setSelectedHours] = useState([]);
  const [userName, setUserName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [reason, setReason] = useState('');
  const [clubName, setClubName] = useState('');
  const [eventName, setEventName] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const handleBook = () => {
    if (!selectedResource || selectedHours.length === 0 || !userName || !rollNumber || !reason || !eventName || !startDate || !endDate) {
      alert('Please fill all required details including dates');
      return;
    }

    const newBookings = selectedHours.map(hour => ({
      id: Date.now() + Math.random(),
      resourceId: selectedResource.id,
      hour: hour,
      user: userName,
      rollNumber,
      reason,
      clubName,
      eventName,
      startDate,
      endDate
    }));

    setBookings([...bookings, ...newBookings]);
    setUserName('');
    setRollNumber('');
    setReason('');
    setClubName('');
    setEventName('');
    setStartDate('');
    setEndDate('');
    setSelectedResource(null);
    setSelectedHours([]);
    alert('Booking Successful!');
  };

  const getHourStatus = (resourceId, hourIndex) => {
    if (!startDate || !endDate) return { booked: false };
    const reqStart = new Date(startDate);
    const reqEnd = new Date(endDate);

    const booking = bookings.find(b => {
      if (b.resourceId !== resourceId || b.hour !== hourIndex) return false;
      const bStart = new Date(b.startDate);
      const bEnd = new Date(b.endDate);
      return reqStart <= bEnd && bStart <= reqEnd;
    });

    return booking ? { booked: true, user: booking.user } : { booked: false };
  };

  const getBookingsInRange = () => {
    if (!startDate || !endDate || !selectedResource) return [];
    
    const reqStart = new Date(startDate);
    const reqEnd = new Date(endDate);
    
    return bookings.filter(b => {
      if (b.resourceId !== selectedResource.id) return false;
      const bStart = new Date(b.startDate);
      const bEnd = new Date(b.endDate);
      return reqStart <= bEnd && bStart <= reqEnd;
    });
  };

  const toggleHour = (i) => {
    setSelectedHours(prev =>
      prev.includes(i) ? prev.filter(h => h !== i) : [...prev, i]
    );
  };

  return (
    <div className="app-container">
      <h1>College Resource Management</h1>

      <div className="main-layout">
        <div className="resource-list">
          <h2>Available Resources</h2>
          {RESOURCES.map(res => (
            <div
              key={res.id}
              className={`resource-card ${selectedResource?.id === res.id ? 'active' : ''}`}
              onClick={() => {
                setSelectedResource(res);
                setSelectedHours([]);
              }}
            >
              <h3>{res.name}</h3>
              <p>{res.type} | Cap: {res.capacity}</p>
            </div>
          ))}
        </div>

        <div className="booking-section">
          {selectedResource ? (
            <>
              <h2>Booking for {selectedResource.name}</h2>
              <div className="time-date-selection">
                <div className="hours-container">
                  <p className="hint">Select hours</p>
                  <div className="slots-grid">
                    {Array.from({ length: selectedResource.hours }).map((_, i) => {
                      const status = getHourStatus(selectedResource.id, i);
                      return (
                        <div
                          key={i}
                          className={`slot ${status.booked ? 'booked' : ''} ${selectedHours.includes(i) ? 'selected' : ''}`}
                          onClick={() => !status.booked && toggleHour(i)}
                        >
                          Hour {i + 1}
                          {status.booked && <span className="user-tag">{status.user}</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="dates-container-wrapper">
                  <div className="dates-container">
                    <div className="date-input-group">
                      <label>Starting Date</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                    <div className="date-input-group">
                      <label>End Date</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="booking-content">
                <div className="form-group">
                  <h3>Fill in the details</h3>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Roll Number"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Reason for booking"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Club Name (optional)"
                    value={clubName}
                    onChange={(e) => setClubName(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Event Name"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                  />

                  <button onClick={handleBook} className="book-btn">Confirm Booking</button>
                </div>

                <div className="seating-arrangement">
                  <h3>Seating Layout Preview ({selectedResource.capacity} Seats)</h3>
                  <div
                    className="seats-grid"
                    style={{
                      gridTemplateColumns: `repeat(${Math.ceil(Math.min(selectedResource.capacity, 100) / 10)}, 1fr)`
                    }}
                  >
                    {Array.from({ length: Math.min(selectedResource.capacity, 100) }).map((_, i) => (
                      <div key={i} className="seat-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M4 18v3h3v-3h10v3h3v-3c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2V5c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v2c-1.1 0-2 .9-2 2v7c0 1.1.9 2 2 2zM6 5h12v2H6V5zm-2 4h16v7H4V9z" />
                        </svg>
                      </div>
                    ))}
                    {selectedResource.capacity > 100 && (
                      <div className="more-seats">+{selectedResource.capacity - 100} more seats</div>
                    )}
                  </div>
                  <div className="stage">FRONT / STAGE</div>
                </div>
              </div>

              <div className="booked-slots-bottom">
                <h3>Booked Slots ({startDate} to {endDate})</h3>
                <div className="booked-slots-bottom-list">
                  {(() => {
                    const overlap = getBookingsInRange();
                    if (overlap.length === 0) {
                      return <div className="inline-no-bookings">No slots booked.</div>;
                    }
                    return overlap.map(b => (
                      <div key={b.id} className="inline-booked-card">
                        <span className="hour-pill">Hour {b.hour + 1}</span>
                        <span className="user-info">{b.user} ({b.eventName})</span>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </>
          ) : (
            <div className="placeholder">Select a resource to see available slots</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
