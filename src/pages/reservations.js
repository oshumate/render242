const express = require('express');
const Joi = require('joi');
const mongoose = require('mongoose');
const router = express.Router();

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

router.get('/', async (req, res) => {
  try {
    const reservations = await Reservation.find();
    res.json({ reservations });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error retrieving reservations' });
  }
});

router.post('/', async (req, res) => {
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
    res.status(500).json({ success: false, message: 'Could not save reservation' });
  }
});

module.exports = router;
