'use strict';

const express = require('express');
const userRoutes = require('./routes/userRoutes');
const familyRoutes = require('./routes/familyRoutes');

const app = express();

app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/users', familyRoutes);

// Generic 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found.' });
});

module.exports = app;
