const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  // Middleware: Only allow authenticated users to connect
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Authentication error"));

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return next(new Error("Authentication error"));
      socket.userId = decoded.id; // Attach user ID to the socket
      next();
    });
  });

  io.on('connection', (socket) => {
    console.log(`📡 User Connected: ${socket.userId}`);

    // Join a private room based on their User ID
    socket.join(socket.userId);

    socket.on('disconnect', () => {
      console.log('🔌 User Disconnected');
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized!");
  return io;
};

module.exports = { initSocket, getIO };