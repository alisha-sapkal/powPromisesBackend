const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/database');
require('dotenv').config();

const app = express();

const rawOrigin = process.env.FRONTEND_URL || "https://pow-promises-ui-ncku.vercel.app";
const allowedOrigin = rawOrigin.endsWith('/') ? rawOrigin.slice(0, -1) : rawOrigin;
app.use(cors({
  origin: allowedOrigin,
  credentials: true
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

connectDB();

app.get('/', (req, res) => {
  res.send(`Welcome to the deployed backend!<br>Connected to frontend: ${allowedOrigin}`);
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/fundraisers', require('./routes/fundraiser'));
app.use('/api/donations', require('./routes/donation'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`CORS allowed origin: ${allowedOrigin}`);
});