const express = require('express');
const cors    = require('cors');
const http    = require('http');
const { Server } = require('socket.io');
const jwt     = require('jsonwebtoken');
require('dotenv').config();

const connectDB = require('./config/db');

const app    = express();
const server = http.createServer(app);

// Socket.IO setup 
const io = new Server(server, {
  cors: {
    origin:  process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// Make `io` available to controllers via app.locals
app.locals.io = io;

// Socket auth: each connected client joins their personal room  user:<userId>
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('No token'));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  socket.join(`user:${socket.userId}`);
  console.log(`[Socket.IO] User ${socket.userId} connected`);

  socket.on('disconnect', () => {
    console.log(`[Socket.IO] User ${socket.userId} disconnected`);
  });
});

// Core middleware
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

// API Routes 
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/users',         require('./routes/users'));
app.use('/api/tasks',         require('./routes/tasks'));
app.use('/api/updates',       require('./routes/updates'));
app.use('/api/super-admin',   require('./routes/superAdmin'));
app.use('/api/notifications', require('./routes/notifications'));

// Health check 
app.get('/api/health', (req, res) =>
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
);

// Global error handler 
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE')
    return res.status(400).json({ message: 'File too large. Max: images 5 MB, documents 20 MB' });
  if (err.message)
    return res.status(400).json({ message: err.message });
  res.status(500).json({ message: 'Internal server error' });
});

//  Connect DB → Start server
connectDB().then(() => {
  // Start cron after DB is ready
  const { startDeadlineReminderCron } = require('./cron/deadlineReminder');
  startDeadlineReminderCron(io);

  server.listen(
    process.env.PORT || 5000,
    () => console.log(`Server running on port ${process.env.PORT || 5000} 🚀`)
  );
});
