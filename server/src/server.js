const http = require('http');
const app = require('./app');
const env = require('./config/env');
const { connectDB } = require('./config/db');
const { initSocket } = require('./config/socket');
const { initQueue } = require('./queues/executionQueue');

const startServer = async () => {
  try {
    // 1. Connect to Database (auto fallback to in-memory MongoDB)
    await connectDB();

    // 2. Initialize HTTP server
    const server = http.createServer(app);

    // 3. Attach Socket.IO for real-time streaming
    const io = initSocket(server);
    console.log('[Socket.IO] Real-time communication server initialized.');

    // 4. Initialize Background Queue (BullMQ or in-memory fallback)
    initQueue();

    // 5. Start listening
    server.listen(env.PORT, () => {
      console.log(`====================================================`);
      console.log(`🚀 Agentflow_AI Server running on port ${env.PORT}`);
      console.log(`📡 Client URL: ${env.CLIENT_URL}`);
      console.log(`🛡️  Environment: ${env.NODE_ENV}`);
      console.log(`🤖 5-Agent Multi-Agent Orchestrator Ready`);
      console.log(`====================================================`);
    });
  } catch (error) {
    console.error('[Server Startup Fatal Error]', error);
    process.exit(1);
  }
};

startServer();
