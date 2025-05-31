const express = require('express');
const cors = require('cors');
const path = require('path');
const sequelize = require('./config/database');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

sequelize.authenticate()
  .then(() => {
    console.log('Database connection has been established successfully.');
    return sequelize.sync({ alter: true }); 
  })
  .then(() => {
    console.log('Database synchronized successfully');
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });

app.get('/', (req, res) => {
  res.send('Welcome to backend');
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/fundraisers', require('./routes/fundraiser'));
app.use('/api/donations', require('./routes/donation'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 