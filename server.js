const express = require('express');
const path = require('path');
const dishes = require('./data.js');    // your data file in project root
const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/dishes', (req, res) => {
  res.json(dishes);
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(process.env.PORT || 3000);
