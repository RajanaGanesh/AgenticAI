import { io } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

let socketInstance = null;

export const getSocket = () => {
  if (!socketInstance && typeof window !== 'undefined') {
    let token = null;
    try {
      const authStorage = localStorage.getItem('agentflow_auth');
      if (authStorage) {
        token = JSON.parse(authStorage)?.state?.token;
      }
    } catch (e) {
      // ignore
    }

    socketInstance = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketInstance.on('connect', () => {
      console.log('[Socket] Connected to Agentflow real-time server');
    });

    socketInstance.on('connect_error', (err) => {
      console.warn('[Socket] Connection warning:', err.message);
    });
  }

  return socketInstance;
};

export const subscribeToExecution = (executionId, { onAgentEvent, onStatusUpdate }) => {
  const socket = getSocket();
  if (!socket || !executionId) return () => {};

  socket.emit('join:execution', executionId);

  const handleAgentEvent = (data) => {
    if (data.executionId === executionId && onAgentEvent) {
      onAgentEvent(data);
    }
  };

  const handleStatusUpdate = (data) => {
    if (data.executionId === executionId && onStatusUpdate) {
      onStatusUpdate(data);
    }
  };

  socket.on('agent:event', handleAgentEvent);
  socket.on('execution:status', handleStatusUpdate);

  return () => {
    socket.emit('leave:execution', executionId);
    socket.off('agent:event', handleAgentEvent);
    socket.off('execution:status', handleStatusUpdate);
  };
};

export const subscribeToNotifications = (onNotification) => {
  const socket = getSocket();
  if (!socket) return () => {};

  socket.on('notification:new', onNotification);
  return () => {
    socket.off('notification:new', onNotification);
  };
};
