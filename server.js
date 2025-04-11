const express = require('express');
const cors = require('cors');
const path = require('path');
const Joi = require('joi');
const dishes = require('./data.js');
const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

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

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
});
