const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: { origin: process.env.FRONTEND_URL || '*', methods: ['GET', 'POST'] }
});

app.set('io', io);
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/assessments', require('./routes/assessments'));
app.use('/api/revenue', require('./routes/revenue'));
app.use('/api/churn', require('./routes/churn'));
app.use('/api/leads', require('./routes/leads'));
app.use('/api/users', require('./routes/users'));

app.get('/', (req, res) => res.json({ message: 'CRO API', version: '1.0.0', realtime: 'Socket.io active' }));

let connectedUsers = 0;

io.on('connection', (socket) => {
  connectedUsers++;
  io.emit('users:count', { count: connectedUsers });
  console.log(`[WS] Connected: ${socket.id} | Total: ${connectedUsers}`);

  socket.on('join:dashboard', ({ userId }) => {
    socket.join('dashboard:all');
    socket.emit('joined', { room: 'dashboard', userId });
  });

  socket.on('ping', () => socket.emit('pong', { ts: Date.now() }));

  socket.on('disconnect', () => {
    connectedUsers--;
    io.emit('users:count', { count: connectedUsers });
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

module.exports = { app, io };
