const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  resourceId: { type: String, required: true },
  hour: { type: Number, required: true },
  user: { type: String, required: true },
  rollNumber: { type: String, required: true },
  reason: { type: String, required: true },
  clubName: { type: String },
  eventName: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  status: { type: String, default: 'Pending' } // Pending, Approved, Rejected
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
