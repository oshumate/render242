const express = require('express');
const cors = require('cors');
const path = require('path');
const Joi = require('joi');
const mongoose = require('mongoose');

// Create an instance of express
const app = express();

// Middleware to enable CORS and JSON request parsing
app.use(cors());
app.use(express.json());

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// ------------------------------
// Database Connection Setup
// ------------------------------
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/reservations-app';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// ------------------------------
// Dishes Endpoints (Existing)
// ------------------------------

// Importing dishes data from data.js (assumed to be an in-memory array)
const dishes = require('./data.js');

app.get('/api/dishes', (req, res) => {
  res.json(dishes);
});

app.post('/api/dishes', (req, res) => {
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

// ------------------------------
// Reservations Endpoints (New)
// ------------------------------

// Define a Mongoose schema and model for Reservations
const reservationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true }
});
const Reservation = mongoose.model('Reservation', reservationSchema);

// Define a Joi schema for validating reservation input
const reservationJoiSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  date: Joi.string().required(),
  time: Joi.string().required()
});

// GET /api/reservations: Retrieve all reservations from the database
app.get('/api/reservations', async (req, res) => {
  try {
    const reservations = await Reservation.find();
    res.json({ reservations });
  } catch (err) {
    console.error('Error retrieving reservations:', err);
    res.status(500).json({ success: false, message: 'Error retrieving reservations' });
  }
});

// POST /api/reservations: Create a new reservation in the database
app.post('/api/reservations', async (req, res) => {
  const { error, value } = reservationJoiSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }
  
  try {
    const newReservation = new Reservation(value);
    await newReservation.save();
    res.json({ success: true, data: newReservation });
  } catch (err) {
    console.error('Error saving reservation:', err);
    res.status(500).json({ success: false, message: 'Could not save reservation' });
  }
});

// ------------------------------
// Serve the Main HTML File
// ------------------------------
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ------------------------------
// Start the Server
// ------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
