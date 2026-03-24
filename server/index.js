const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

require('./models/User');
require('./models/Organization');
require('./models/Lead');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  }
});

// Middleware FIRST
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

// Routes AFTER middleware
const authRoutes = require('./Routes/authRoutes');
app.use('/api/auth', authRoutes);

const leadRoutes = require('./Routes/leadRoutes');
app.use('/api/leads', leadRoutes)

app.get('/', (req, res) => {
  res.json({ message: 'SmartCRM API is running' });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    server.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch(err => console.log('DB error:', err));

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  socket.on('join_workspace', (workspaceId) => {
    socket.join(workspaceId);
  });
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

module.exports = { io };