const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');

const app = express();

// ── Core middleware ───────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',        require('./routes/auth'));        // login, me
app.use('/api/users',       require('./routes/users'));       // intern CRUD, avatar
app.use('/api/tasks',       require('./routes/tasks'));       // task CRUD + /my
app.use('/api/updates',     require('./routes/updates'));     // submissions + /my
app.use('/api/super-admin', require('./routes/superAdmin')); // super admin

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) =>
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
);

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'File too large. Max: images 5 MB, documents 20 MB' });
  }
  if (err.message) {
    return res.status(400).json({ message: err.message });
  }
  res.status(500).json({ message: 'Internal server error' });
});

// ── Connect DB → Start server ─────────────────────────────────────────────────
connectDB().then(() => {
  app.listen(
    process.env.PORT || 5000,
    () => console.log(`Server running on port ${process.env.PORT || 5000} 🚀`)
  );
});