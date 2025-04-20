const express = require('express');
const cors    = require('cors');
const path    = require('path');
const Joi     = require('joi');
const mongoose = require('mongoose');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database
const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://charliovski2:test123@cluster0.kzvtq46.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// === Dishes Endpoints (from data.js) ===
const dishes = require('./data.js');

app.get('/api/dishes', (req, res) => {
  console.log('GET /api/dishes');
  res.json(dishes);
});

app.post('/api/dishes', (req, res) => {
  console.log('POST /api/dishes:', req.body);
  const dishSchema = Joi.object({
    name: Joi.string().required(),
    imageUrl: Joi.string().uri().required()
  });
  const { error, value } = dishSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, error: error.details[0].message });
  }
  dishes.push(value);
  res.json({ success: true, data: value });
});

// === Reservation Model & Validation ===
const reservationSchema = new mongoose.Schema({
  name:  { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  date:  { type: String, required: true },
  time:  { type: String, required: true }
});
const Reservation = mongoose.model('Reservation', reservationSchema);

const reservationJoiSchema = Joi.object({
  name:  Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  date: Joi.string().required(),
  time: Joi.string().required()
});

// GET all reservations
app.get('/api/reservations', async (req, res) => {
  try {
    console.log('GET /api/reservations');
    const reservations = await Reservation.find();
    res.json({ reservations });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Error retrieving reservations',
      error: err.message
    });
  }
});

// POST create reservation
app.post('/api/reservations', async (req, res) => {
  console.log('POST /api/reservations:', req.body);
  const { error, value } = reservationJoiSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }
  try {
    const newReservation = new Reservation(value);
    await newReservation.save();
    res.json({ success: true, data: newReservation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Could not save reservation', error: err.message });
  }
});

// PUT update reservation
app.put('/api/reservations/:id', async (req, res) => {
  console.log('PUT /api/reservations/' + req.params.id, req.body);
  const { error, value } = reservationJoiSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }
  try {
    const updated = await Reservation.findByIdAndUpdate(req.params.id, value, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Could not update reservation' });
  }
});

// DELETE reservation
app.delete('/api/reservations/:id', async (req, res) => {
  console.log('DELETE /api/reservations/' + req.params.id);
  try {
    const deleted = await Reservation.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Could not delete reservation' });
  }
});

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
