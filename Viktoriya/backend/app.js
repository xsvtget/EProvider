require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db/connection');

// Import routes
const employeeRoutes = require('./routes/employees');
const systemRoutes = require('./routes/systems');
const serviceRoutes = require('./routes/services');
const qualificationRoutes = require('./routes/qualifications');
const accessRoutes = require('./routes/access');
const actionsRoutes = require('./routes/actions');
const configRoutes = require('./routes/config');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'API is running', timestamp: new Date() });
});

// Routes
app.use('/api/employees', employeeRoutes);
app.use('/api/systems', systemRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/qualifications', qualificationRoutes);
app.use('/api/access', accessRoutes);
app.use('/api/actions', actionsRoutes);
app.use('/api/config', configRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    status: err.status || 500
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

const PORT = process.env.BACKEND_PORT || 3000;

// Test database connection before starting server
db.query('SELECT 1', (err, results) => {
  if (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }
  
  console.log('✓ Database connected');
  
  app.listen(PORT, () => {
    console.log(`✓ API server running on port ${PORT}`);
    console.log(`✓ CORS enabled for: ${process.env.CORS_ORIGIN || '*'}`);
  });
});

module.exports = app;
