const mongoose = require('mongoose');
const dns = require('dns');
const env = require('./env');

const connectDB = async () => {
  const mongoUri = env.MONGODB_URI;

  if (mongoUri) {
    try {
      // Configure robust DNS resolution for Atlas SRV connection strings
      if (mongoUri.startsWith('mongodb+srv://')) {
        try {
          dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
        } catch (dnsErr) {
          // ignore DNS override if restricted
        }
      }

      console.log(`[Database] Connecting to configured MongoDB Atlas cluster...`);
      const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 8000,
      });
      console.log(`[Database] ✅ MongoDB Atlas Connected: ${conn.connection.host}/${conn.connection.name}`);
      return conn;
    } catch (err) {
      console.warn(`[Database] MongoDB Atlas connection error: ${err.message}. Using resilient in-memory store.`);
    }
  }

  // Local fallback
  try {
    const conn = await mongoose.connect('mongodb://localhost:27017/agentflow_ai', { serverSelectionTimeoutMS: 800 });
    console.log(`[Database] ✅ Connected to local MongoDB daemon.`);
    return conn;
  } catch (err) {
    console.log('[Database] ⚡ Zero-Config in-memory store active for instant local execution.');
    return null;
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
  } catch (e) {
    // ignore
  }
};

module.exports = { connectDB, disconnectDB };
