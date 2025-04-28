require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const Joi = require('joi');
const mongoose = require('mongoose');
const multer = require('multer');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, 'public/uploads')),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

const MONGODB_URI = process.env.MONGODB_URI ||
  'mongodb+srv://charliovski2:test123@cluster0.kzvtq46.mongodb.net/?retryWrites=true&w=majority';
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('DB error:', err));

const dishes = require('./data.js');
app.get('/api/dishes', (req, res) => res.json(dishes));
app.post('/api/dishes', (req, res) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    imageUrl: Joi.string().uri().required()
  });
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ success: false, error: error.details[0].message });
  dishes.push(value);
  res.json({ success: true, data: value });
});

const reservationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  pictureUrl: { type: String }
});
const Reservation = mongoose.model('Reservation', reservationSchema);

const valSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  date: Joi.string().required(),
  time: Joi.string().required()
});

app.get('/api/reservations', async (req, res) => {
  try {
    const reservations = await Reservation.find();
    res.json({ reservations });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Fetch error', error: err.message });
  }
});

app.post('/api/reservations', upload.single('picture'), async (req, res) => {
  const { error, value } = valSchema.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });
  if (req.file) {
    value.pictureUrl = `/uploads/${req.file.filename}`;
  }
  try {
    const newR = await new Reservation(value).save();
    res.json({ success: true, data: newR });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Save error', error: err.message });
  }
});

app.put('/api/reservations/:id', upload.single('picture'), async (req, res) => {
  const { error, value } = valSchema.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });
  if (req.file) {
    value.pictureUrl = `/uploads/${req.file.filename}`;
  }
  try {
    const updated = await Reservation.findByIdAndUpdate(req.params.id, value, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Update error', error: err.message });
  }
});

app.delete('/api/reservations/:id', async (req, res) => {
  try {
    const deleted = await Reservation.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Delete error', error: err.message });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on ${PORT}`));
