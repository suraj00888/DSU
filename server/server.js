const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const { protect, adminProtect } = require('./middleware/authMiddleware');
const { scheduleStatusUpdates } = require('./middleware/eventMiddleware');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log('MongoDB connected');
  
  // Schedule event status updates every 30 minutes
  scheduleStatusUpdates(30);
})
.catch(err => console.error('MongoDB connection error:', err));

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const eventRoutes = require('./routes/events');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/events', eventRoutes);

// Example of a protected route
app.get('/api/protected', protect, (req, res) => {
  res.send('This is a protected route');
});

// Example of an admin protected route
app.get('/api/admin', protect, adminProtect, (req, res) => {
  res.send('This is an admin protected route');
});

// Basic route
app.get('/', (req, res) => {
  res.send('Welcome to DSUConnect');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 