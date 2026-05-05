import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, Users, Building, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './UserPage.css';

const API_URL = 'http://localhost:5000/api';

function UserPage() {
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedResource, setSelectedResource] = useState(null);
  const [selectedHours, setSelectedHours] = useState([]);
  
  // Form fields
  const [userName, setUserName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [reason, setReason] = useState('');
  const [clubName, setClubName] = useState('');
  const [eventName, setEventName] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchResources();
    fetchBookings();
  }, []);

  const fetchResources = async () => {
    try {
      const res = await axios.get(`${API_URL}/resources`);
      setResources(res.data);
    } catch (err) {
      console.error(err);
      // Fallback if backend is not running
      setResources([
        { id: 'h1', name: 'Main Hall', type: 'Hall', capacity: 100, hours: 7 },
        { id: 'h2', name: 'Seminar Room A', type: 'Room', capacity: 30, hours: 7 },
        { id: 'h3', name: 'Conference Room', type: 'Room', capacity: 20, hours: 7 },
        { id: 'c1', name: 'Computer Center 1', type: 'Lab', capacity: 50, hours: 7 },
        { id: 'c2', name: 'Computer Center 2', type: 'Lab', capacity: 50, hours: 7 },
      ]);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await axios.get(`${API_URL}/bookings`);
      setBookings(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBook = async () => {
    if (!selectedResource || selectedHours.length === 0 || !userName || !rollNumber || !reason || !eventName || !startDate || !endDate) {
      alert('Please fill all required details including dates and timeslots');
      return;
    }

    setLoading(true);
    const newBookings = selectedHours.map(hour => ({
      resourceId: selectedResource.id,
      hour: hour,
      user: userName,
      rollNumber,
      reason,
      clubName,
      eventName,
      startDate,
      endDate,
      status: 'Pending'
    }));

    try {
      await axios.post(`${API_URL}/bookings`, newBookings);
      setSuccessMsg('Booking Request Submitted Successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
      
      // Reset form
      setUserName(''); setRollNumber(''); setReason(''); setClubName(''); setEventName('');
      setSelectedHours([]);
      fetchBookings(); // Refresh bookings
    } catch (err) {
      console.error(err);
      alert('Failed to book. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const getHourStatus = (resourceId, hourIndex) => {
    if (!startDate || !endDate) return { booked: false };
    const reqStart = new Date(startDate);
    const reqEnd = new Date(endDate);

    const booking = bookings.find(b => {
      if (b.resourceId !== resourceId || b.hour !== hourIndex) return false;
      const bStart = new Date(b.startDate);
      const bEnd = new Date(b.endDate);
      // Check overlap
      return reqStart <= bEnd && bStart <= reqEnd && b.status !== 'Rejected';
    });

    return booking ? { booked: true, user: booking.user, status: booking.status } : { booked: false };
  };

  const toggleHour = (i) => {
    setSelectedHours(prev =>
      prev.includes(i) ? prev.filter(h => h !== i) : [...prev, i]
    );
  };

  return (
    <div className="user-app-container">
      <div className="top-nav">
        <button className="back-btn" onClick={() => navigate('/')}>
          <ChevronLeft size={20} /> Back
        </button>
        <h1>Resource Booking</h1>
        <div style={{width: '80px'}}></div>
      </div>

      <div className="main-layout">
        <motion.div 
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="resource-list"
        >
          <h2>Available Resources</h2>
          <div className="resources-grid">
            {resources.map((res, idx) => (
              <motion.div
                key={res.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`resource-card ${selectedResource?.id === res.id ? 'active' : ''}`}
                onClick={() => {
                  setSelectedResource(res);
                  setSelectedHours([]);
                }}
              >
                <div className="res-icon">
                  {res.type === 'Hall' ? <Building size={24} /> : res.type === 'Room' ? <Users size={24} /> : <Clock size={24} />}
                </div>
                <div className="res-details">
                  <h3>{res.name}</h3>
                  <p>{res.type} &bull; {res.capacity} Seats</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="booking-section glass-panel"
        >
          {selectedResource ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedResource.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
              >
                <div className="booking-header">
                  <h2>{selectedResource.name}</h2>
                  <span className="badge">{selectedResource.type}</span>
                </div>

                <div className="booking-grid">
                  <div className="left-panel">
                    <div className="date-picker-group">
                      <div className="input-with-icon">
                        <CalendarIcon size={18} />
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                      </div>
                      <span className="to-text">to</span>
                      <div className="input-with-icon">
                        <CalendarIcon size={18} />
                        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                      </div>
                    </div>

                    <div className="slots-container">
                      <p className="section-label">Select Timeslots</p>
                      <div className="slots-grid">
                        {Array.from({ length: selectedResource.hours }).map((_, i) => {
                          const status = getHourStatus(selectedResource.id, i);
                          return (
                            <motion.div
                              whileHover={!status.booked ? { scale: 1.05 } : {}}
                              whileTap={!status.booked ? { scale: 0.95 } : {}}
                              key={i}
                              className={`slot ${status.booked ? (status.status === 'Approved' ? 'booked-approved' : 'booked-pending') : ''} ${selectedHours.includes(i) ? 'selected' : ''}`}
                              onClick={() => !status.booked && toggleHour(i)}
                            >
                              <span className="time-label">Slot {i + 1}</span>
                              {status.booked && (
                                <span className="slot-user" title={`${status.user} - ${status.status}`}>
                                  {status.user}
                                </span>
                              )}
                            </motion.div>
                          );
                        })}
                      </div>
                      <div className="legend">
                        <span className="leg-item"><div className="leg-box pending"></div> Pending</span>
                        <span className="leg-item"><div className="leg-box approved"></div> Approved</span>
                      </div>
                    </div>
                  </div>

                  <div className="right-panel">
                    <p className="section-label">Booking Details</p>
                    <div className="form-grid">
                      <input type="text" placeholder="Full Name" value={userName} onChange={(e) => setUserName(e.target.value)} />
                      <input type="text" placeholder="Roll Number" value={rollNumber} onChange={(e) => setRollNumber(e.target.value)} />
                      <input type="text" placeholder="Event Name" value={eventName} onChange={(e) => setEventName(e.target.value)} />
                      <input type="text" placeholder="Club Name (Optional)" value={clubName} onChange={(e) => setClubName(e.target.value)} />
                      <textarea placeholder="Reason for booking..." value={reason} onChange={(e) => setReason(e.target.value)} rows={3} />
                    </div>

                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleBook} 
                      className="submit-btn"
                      disabled={loading}
                    >
                      {loading ? 'Submitting...' : 'Submit Booking Request'}
                    </motion.button>
                    
                    <AnimatePresence>
                      {successMsg && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="success-msg"
                        >
                          <CheckCircle2 size={18} /> {successMsg}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="empty-state">
              <Building size={64} className="empty-icon" />
              <h3>Select a Resource</h3>
              <p>Choose a hall, room, or lab from the left to start booking.</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default UserPage;
