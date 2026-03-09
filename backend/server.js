const express = require('express');
const cors = require('cors');
require('dotenv').config();

const createTables = require('./db/schema');
const seedAdmin = require('./db/seed');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const employeeRoutes = require('./routes/employees');
const visitorRoutes = require('./routes/visitors');
const logRoutes = require('./routes/logs');

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/visitors', visitorRoutes);
app.use('/api/logs', logRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: '✅ Access Management API is running!' });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  await createTables();
  await seedAdmin();
});
