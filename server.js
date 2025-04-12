const express = require('express');
const cors = require('cors');
const path = require('path');
const Joi = require('joi');
const mongoose = require('mongoose');

const app = express();

// Middleware: Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// ---------------------------------
// Database Connection Setup
// ---------------------------------
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://charliovski2:test123@cluster0.kzvtq46.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

// ---------------------------------
// Dishes Endpoints (Using In-Memory Data)
// ---------------------------------
const dishes = require('./data.js');

app.get('/api/dishes', (req, res) => {
  console.log('GET /api/dishes: Fetching dishes.');
  res.json(dishes);
});

app.post('/api/dishes', (req, res) => {
  console.log('POST /api/dishes: Received dish data:', req.body);
  
  const dishSchema = Joi.object({
    name: Joi.string().required(),
    imageUrl: Joi.string().uri().required()
  });
  const { error, value } = dishSchema.validate(req.body);
  
  if (error) {
    console.error('Dish validation error:', error.details[0].message);
    return res.status(400).json({ success: false, error: error.details[0].message });
  }
  
  dishes.push(value);
  console.log('New dish saved:', value);
  res.json({ success: true, data: value });
});

// ---------------------------------
// Reservations Endpoints (Using MongoDB)
// ---------------------------------
const reservationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true }
});
const Reservation = mongoose.model('Reservation', reservationSchema);

const reservationJoiSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  date: Joi.string().required(),
  time: Joi.string().required()
});

// GET /api/reservations: Retrieve all reservations from MongoDB
app.get('/api/reservations', async (req, res) => {
  try {
    console.log('GET /api/reservations: Fetching reservations.');
    const reservations = await Reservation.find();
    console.log('Fetched reservations:', reservations);
    res.json({ reservations });
  } catch (err) {
    console.error('Error retrieving reservations:', err);
    res.status(500).json({ success: false, message: 'Error retrieving reservations', error: err.message });
  }
});

// POST /api/reservations: Save a new reservation to MongoDB
app.post('/api/reservations', async (req, res) => {
  console.log('POST /api/reservations: Received reservation data:', req.body);
  
  const { error, value } = reservationJoiSchema.validate(req.body);
  if (error) {
    console.error('Reservation validation error:', error.details[0].message);
    return res.status(400).json({ success: false, message: error.details[0].message });
  }
  
  try {
    const newReservation = new Reservation(value);
    await newReservation.save();
    console.log('New reservation saved:', newReservation);
    res.json({ success: true, data: newReservation });
  } catch (err) {
    console.error('Error saving reservation:', err);
    res.status(500).json({ success: false, message: 'Could not save reservation', error: err.message });
  }
});

// ---------------------------------
// Serve the Main HTML File
// ---------------------------------
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ---------------------------------
// Start the Server
// ---------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
