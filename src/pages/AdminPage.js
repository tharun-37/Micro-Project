import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Check, X, Calendar, Clock, Trash2, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './AdminPage.css';

const API_URL = 'http://localhost:5000/api';

function AdminPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/bookings`);
      setBookings(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatusGroup = async (ids, status) => {
    try {
      await Promise.all(ids.map(id => axios.put(`${API_URL}/bookings/${id}/status`, { status })));
      fetchBookings();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteBookingGroup = async (ids) => {
    if(window.confirm('Are you sure you want to delete this booking group?')) {
      try {
        await Promise.all(ids.map(id => axios.delete(`${API_URL}/bookings/${id}`)));
        fetchBookings();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Group bookings that have same user, event, resource, date and status
  const groupBookings = (bookingList) => {
    const groups = {};
    bookingList.forEach(b => {
      const key = `${b.user}-${b.eventName}-${b.resourceId}-${b.startDate}-${b.endDate}-${b.status}`;
      if (!groups[key]) {
        groups[key] = {
          idKey: key,
          user: b.user,
          rollNumber: b.rollNumber,
          eventName: b.eventName,
          reason: b.reason,
          resourceId: b.resourceId,
          startDate: b.startDate,
          endDate: b.endDate,
          status: b.status,
          slots: [],
          ids: []
        };
      }
      groups[key].slots.push(b.hour + 1);
      groups[key].ids.push(b._id);
    });
    
    return Object.values(groups).map(g => {
      g.slots.sort((a, b) => a - b);
      return g;
    });
  };

  const pendingBookings = groupBookings(bookings.filter(b => b.status === 'Pending'));
  const otherBookings = groupBookings(bookings.filter(b => b.status !== 'Pending'));

  // Calculate stats based on actual individual bookings (or groups if preferred)
  // Showing stats for total groups rather than individual slots is usually better for admins
  const totalRequests = groupBookings(bookings).length;
  const pendingRequests = pendingBookings.length;
  const approvedRequests = otherBookings.filter(b => b.status === 'Approved').length;
  const rejectedRequests = otherBookings.filter(b => b.status === 'Rejected').length;

  return (
    <div className="admin-container">
      <div className="top-nav">
        <button className="back-btn" onClick={() => navigate('/')}>
          <ChevronLeft size={20} /> Back
        </button>
        <h1>Admin Dashboard</h1>
        <div style={{width: '80px'}}></div>
      </div>

      <div className="dashboard-grid">
        <div className="stats-cards">
          <div className="stat-card">
            <h3>Total Requests</h3>
            <p className="stat-value">{totalRequests}</p>
          </div>
          <div className="stat-card pending">
            <h3>Pending Requests</h3>
            <p className="stat-value">{pendingRequests}</p>
          </div>
          <div className="stat-card approved">
            <h3>Approved</h3>
            <p className="stat-value">{approvedRequests}</p>
          </div>
          <div className="stat-card rejected">
            <h3>Rejected</h3>
            <p className="stat-value">{rejectedRequests}</p>
          </div>
        </div>

        <div className="main-content">
          <div className="table-container">
            <h2>Pending Requests</h2>
            {pendingBookings.length === 0 ? (
              <p className="empty-msg">No pending requests right now.</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Event Details</th>
                    <th>Date & Time</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {pendingBookings.map(g => (
                      <motion.tr 
                        key={g.idKey}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                      >
                        <td>
                          <div className="user-cell">
                            <strong>{g.user}</strong>
                            <span>{g.rollNumber}</span>
                          </div>
                        </td>
                        <td>
                          <div className="event-cell">
                            <strong>{g.eventName}</strong>
                            <span>{g.reason}</span>
                          </div>
                        </td>
                        <td>
                          <div className="date-cell">
                            <span><Calendar size={14}/> {g.startDate} to {g.endDate}</span>
                            <span><Layers size={14}/> Resource: {g.resourceId}</span>
                            <span className="slots-badge"><Clock size={14}/> Slots: {g.slots.join(', ')}</span>
                          </div>
                        </td>
                        <td>
                          <div className="action-btns">
                            <button className="approve-btn" onClick={() => updateStatusGroup(g.ids, 'Approved')}>
                              <Check size={16} /> Approve
                            </button>
                            <button className="reject-btn" onClick={() => updateStatusGroup(g.ids, 'Rejected')}>
                              <X size={16} /> Reject
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            )}
          </div>

          <div className="table-container mt-4">
            <h2>History</h2>
            <table className="admin-table history-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Event Details</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {otherBookings.map(g => (
                  <tr key={g.idKey}>
                    <td><strong>{g.user}</strong></td>
                    <td>{g.eventName}</td>
                    <td>
                      <div className="date-cell">
                        <span>{g.startDate}</span>
                        <span className="slots-badge">Slots: {g.slots.join(', ')}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${g.status.toLowerCase()}`}>{g.status}</span>
                    </td>
                    <td>
                      <button className="del-btn" onClick={() => deleteBookingGroup(g.ids)}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPage;
