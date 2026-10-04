require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    "https://l2-96kieu6k1-atharvas-projects-3da064f2.vercel.app",
    'https://l2-fe.vercel.app'
  ],
  credentials: true
}));
app.use((req, res, next) => {
  console.log("Origin:", req.headers.origin);
  next();
});
app.use(express.json());
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const setupRoutes = require('./routes');
setupRoutes(app);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

const chatSocketHandler = require('./controllers/chatSocket');
const videoSocketHandler = require('./controllers/videoSocket');
chatSocketHandler(io);
videoSocketHandler(io);

app.get('/', (req, res) => {
  res.send('L2 Platform Backend Running');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
