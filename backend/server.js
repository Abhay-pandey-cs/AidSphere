const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/aidsphere')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Socket.io connection
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Basic Route
app.get('/api/health', (req, res) => {
  const status = mongoose.connection.readyState === 1 ? 'PROTECTED' : 'UNSTABLE';
  res.json({ status, db: mongoose.connection.readyState });
});

app.get('/', (req, res) => {
  res.send('AidSphere API is running...');
});

// Middleware to attach io to req
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Import Routes
const authRoutes = require('./routes/authRoutes');
const sosRoutes = require('./routes/sosRoutes');
const fundraisingRoutes = require('./routes/fundraisingRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const socialMonitorRoutes = require('./routes/socialMonitorRoutes');
const userRoutes = require('./routes/userRoutes');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/fundraising', fundraisingRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/social-monitor', socialMonitorRoutes);
app.use('/api/users', userRoutes);

app.use('/api/stats', require('./routes/statsRoutes'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.error('CRITICAL_REJECTION:', err.message);
});

process.on('uncaughtException', (err) => {
  console.error('CRITICAL_EXCEPTION:', err.message);
});
