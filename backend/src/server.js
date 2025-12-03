const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const eventRoutes = require('./routes/events');
const priorityRoutes = require('./routes/priorities');
const messageRoutes = require('./routes/messages');
const authRoutes = require('./routes/auth');
const scenarioRoutes = require('./routes/scenarios');
const googleRoutes = require('./routes/google');

// Use routes
app.use('/api/events', eventRoutes);
app.use('/api/priorities', priorityRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/scenarios', scenarioRoutes);
app.use('/api/google', googleRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Server is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test database connection endpoint
app.get('/api/test-db', async (req, res) => {
  try {
    const db = require('./config/database');
    const [rows] = await db.query('SELECT 1 + 1 AS result');
    res.json({ 
      success: true, 
      message: 'Database connected successfully!',
      result: rows[0].result,
      database: process.env.DB_NAME
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 CalendarAI Backend running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`\nAPI Endpoints:`);
  console.log(`  - GET  http://localhost:${PORT}/api/health`);
  console.log(`  - GET  http://localhost:${PORT}/api/test-db`);
  console.log(`  - GET  http://localhost:${PORT}/api/events`);
  console.log(`  - GET  http://localhost:${PORT}/api/priorities`);
  console.log(`  - GET  http://localhost:${PORT}/api/messages/:sessionId\n`);
});

