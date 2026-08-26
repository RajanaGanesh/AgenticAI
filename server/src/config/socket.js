const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const env = require('./env');

let ioInstance = null;

const initSocket = (httpServer) => {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  ioInstance.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (token) {
      try {
        const decoded = jwt.verify(token, env.JWT_SECRET);
        socket.user = decoded;
      } catch (err) {
        // Allow unauthenticated connection or mark anonymous
        socket.user = null;
      }
    }
    next();
  });

  ioInstance.on('connection', (socket) => {
    const userId = socket.user?.id || socket.handshake.query?.userId;
    if (userId) {
      socket.join(`user:${userId}`);
    }

    socket.on('join:execution', (executionId) => {
      if (executionId) {
        socket.join(`execution:${executionId}`);
      }
    });

    socket.on('leave:execution', (executionId) => {
      if (executionId) {
        socket.leave(`execution:${executionId}`);
      }
    });

    socket.on('disconnect', () => {
      // Clean disconnect
    });
  });

  return ioInstance;
};

const getIO = () => {
  return ioInstance;
};

const emitExecutionEvent = (executionId, eventType, data) => {
  if (ioInstance) {
    ioInstance.to(`execution:${executionId}`).emit('agent:event', {
      executionId,
      eventType,
      ...data,
      timestamp: new Date().toISOString(),
    });
  }
};

const emitExecutionStatus = (executionId, statusData) => {
  if (ioInstance) {
    ioInstance.to(`execution:${executionId}`).emit('execution:status', {
      executionId,
      ...statusData,
      timestamp: new Date().toISOString(),
    });
  }
};

const emitNotification = (userId, notification) => {
  if (ioInstance && userId) {
    ioInstance.to(`user:${userId}`).emit('notification:new', notification);
  }
};

module.exports = {
  initSocket,
  getIO,
  emitExecutionEvent,
  emitExecutionStatus,
  emitNotification,
};
