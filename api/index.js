const express = require('express');
const cors = require('cors');
const path = require('path');

const dictionaryRoutes = require('../routes/dictionary');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/dictionary', dictionaryRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Dictionary API is running' });
});

// Serve static files (fallback if filesystem handler doesn't work)
app.use(express.static(path.join(__dirname, '../public')));

// Serve index.html for root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message
  });
});

// 404 handler
app.use((req, res) => {
  // If it's an API route, return JSON
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Route not found' });
  }
  // Otherwise, try to serve index.html (for SPA routing)
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Export the Express app as a serverless function
module.exports = app;
