const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const predictorRoutes = require('./routes/predictorRoutes');

dotenv.config();
connectDB();

const app = express();

app.use(cors({ origin: '*' })); // Replace '*' with your Vercel URL during deployment
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/predict', predictorRoutes);
if (process.env.NODE_ENV === 'production') {
  // Point to the 'build' folder created by npm run build in the frontend
  app.use(express.static(path.join(__dirname, '../frontend/build')));

  // For any route that isn't /api, send index.html
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/build', 'index.html'));
  });
}
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));