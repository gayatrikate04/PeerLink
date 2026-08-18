require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
// const admin = require('firebase-admin');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Import and use routes
const setupRoutes = require('./routes');
setupRoutes(app);

// Firebase Admin setup
// const serviceAccount = require('../config/firebaseServiceAccount.json');
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// Socket.io chat handler
const chatSocketHandler = require('./controllers/chatSocket');
const videoSocketHandler = require('./controllers/videoSocket');
chatSocketHandler(io);
videoSocketHandler(io);

// Basic route
app.get('/', (req, res) => {
  res.send('L2 Platform Backend Running');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
