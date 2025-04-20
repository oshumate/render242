const express  = require('express');
const cors     = require('cors');
const path     = require('path');
const Joi      = require('joi');
const mongoose = require('mongoose');

const app = express();

// ─── Middleware ───────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─── MongoDB Connection ───────────────────────────────────────────
const MONGODB_URI = process.env.MONGODB_URI ||
  'mongodb+srv://charliovski2:test123@cluster0.kzvtq46.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('DB error:', err));

// ─── Dishes (unchanged) ───────────────────────────────────────────
const dishes = require('./data.js');
app.get('/api/dishes', (req, res) => res.json(dishes));
app.post('/api/dishes', (req, res) => {
  const schema = Joi.object({
    name:     Joi.string().required(),
    imageUrl: Joi.string().uri().required()
  });
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ success:false, error: error.details[0].message });
  dishes.push(value);
  res.json({ success:true, data:value });
});

// ─── Reservations Model + Joi ────────────────────────────────────
const reservationSchema = new mongoose.Schema({
  name:  { type:String, required:true },
  email: { type:String, required:true },
  phone: { type:String, required:true },
  date:  { type:String, required:true },
  time:  { type:String, required:true }
});
const Reservation = mongoose.model('Reservation', reservationSchema);

const valSchema = Joi.object({
  name:  Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  date:  Joi.string().required(),
  time:  Joi.string().required()
});

// ─── CRUD Endpoints ───────────────────────────────────────────────
// GET all
app.get('/api/reservations', async (req, res) => {
  try {
    const reservations = await Reservation.find();
    res.json({ reservations });
  } catch (err) {
    res.status(500).json({ success:false, message:'Fetch error', error:err.message });
  }
});

// POST create
app.post('/api/reservations', async (req, res) => {
  const { error, value } = valSchema.validate(req.body);
  if (error) return res.status(400).json({ success:false, message:error.details[0].message });

  try {
    const newR = await new Reservation(value).save();
    res.json({ success:true, data:newR });
  } catch (err) {
    res.status(500).json({ success:false, message:'Save error', error:err.message });
  }
});

// PUT update
app.put('/api/reservations/:id', async (req, res) => {
  const { error, value } = valSchema.validate(req.body);
  if (error) return res.status(400).json({ success:false, message:error.details[0].message });

  try {
    const updated = await Reservation.findByIdAndUpdate(req.params.id, value, { new:true });
    if (!updated) return res.status(404).json({ success:false, message:'Not found' });
    res.json({ success:true, data:updated });
  } catch (err) {
    res.status(500).json({ success:false, message:'Update error', error:err.message });
  }
});

// DELETE remove
app.delete('/api/reservations/:id', async (req, res) => {
  try {
    const deleted = await Reservation.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success:false, message:'Not found' });
    res.json({ success:true });
  } catch (err) {
    res.status(500).json({ success:false, message:'Delete error', error:err.message });
  }
});

// serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public','index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on ${PORT}`));
