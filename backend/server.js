require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users'); // require instead of import

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Next.js frontend
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI) // make sure env key matches
  .then(() => {
    console.log('MongoDB connected');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch(err => console.error(err));
