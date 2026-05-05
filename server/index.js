require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Booking = require('./models/Booking');

const app = express();
app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://tharun:nopassword@react.yqvjk2l.mongodb.net/?appName=REACT";

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const RESOURCES = [
  { id: 'h1', name: 'Main Hall', type: 'Hall', capacity: 100, hours: 7 },
  { id: 'h2', name: 'Seminar Room A', type: 'Room', capacity: 30, hours: 7 },
  { id: 'h3', name: 'Conference Room', type: 'Room', capacity: 20, hours: 7 },
  { id: 'c1', name: 'Computer Center 1', type: 'Lab', capacity: 50, hours: 7 },
  { id: 'c2', name: 'Computer Center 2', type: 'Lab', capacity: 50, hours: 7 },
];

app.get('/api/resources', (req, res) => {
  res.json(RESOURCES);
});

app.get('/api/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/bookings', async (req, res) => {
  try {
    const newBookings = req.body; // Expect an array
    const savedBookings = await Booking.insertMany(newBookings);
    res.status(201).json(savedBookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/bookings/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/bookings/:id', async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: 'Booking deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
