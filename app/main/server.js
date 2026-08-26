const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const app = express();

// Загрузка переменных окружения из .env.local
dotenv.config({ path: require('path').resolve(__dirname, '../../.env.local') });

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined. Please set it in .env.local');
  process.exit(1);
}
mongoose.connect(MONGODB_URI, {});

const connection = mongoose.connection;
connection.once('open', () => {
  console.log('MongoDB database connection established successfully');
});

// Routes
const resultsLoadCountRouter = require('./routes/resultsLoadCount');
app.use('/api', resultsLoadCountRouter);

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
