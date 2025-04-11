const express = require('express');
const cors = require('cors');
const path = require('path');
const Joi = require('joi');
const dishes = require('./data.js');  // existing dishes data
const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

// ------------------------------
// Dishes endpoints (existing)
// ------------------------------
app.get('/api/dishes', (req, res) => {
  res.json(dishes);
});

app.post('/api/dishes', (req, res) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    imageUrl: Joi.string().uri().required()
  });

  const { error, value } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, error: error.details[0].message });
  }

  dishes.push(value);
  res.json({ success: true, data: value });
});

// ------------------------------
// Reservations endpoints (new)
// ------------------------------

// In-memory storage for reservations
const reservations = [];

// GET /api/reservations: Retrieve all reservations
app.get('/api/reservations', (req, res) => {
  res.json({ reservations });
});

// POST /api/reservations: Add a new reservation
const reservationSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  date: Joi.string().required(),
  time: Joi.string().required()
});

app.post('/api/reservations', (req, res) => {
  const { error, value } = reservationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }
  reservations.push(value);
  res.json({ success: true, data: value });
});

// Serve the main HTML file for any other routes.
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server.
app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
});
