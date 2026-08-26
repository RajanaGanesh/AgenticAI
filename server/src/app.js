const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

const env = require('./config/env');
const authRoutes = require('./routes/authRoutes');
const workflowRoutes = require('./routes/workflowRoutes');
const executionRoutes = require('./routes/executionRoutes');
const integrationRoutes = require('./routes/integrationRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const errorHandler = require('./middlewares/errorHandler');
const ApiResponse = require('./utils/apiResponse');

const app = express();

// Security and performance middlewares
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

// Robust CORS for Render <-> Vercel deployments & localhost
app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser callers (curl, postman, cron, mobile)
    if (!origin) return callback(null, true);
    
    // In dev or if CLIENT_URL is *, allow all
    if (env.NODE_ENV !== 'production' || !env.CLIENT_URL || env.CLIENT_URL === '*') {
      return callback(null, true);
    }

    // Allow configured CLIENT_URL, all Vercel previews (*.vercel.app), and localhost
    if (
      origin === env.CLIENT_URL ||
      origin.endsWith('.vercel.app') ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1')
    ) {
      return callback(null, true);
    }

    // Allow origin dynamically
    return callback(null, true);
  },
  credentials: true,
}));

app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check API (used by Render health checks & uptime monitors)
app.get('/api/health', (req, res) => {
  return ApiResponse.success(res, {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: env.NODE_ENV,
    version: '1.0.0',
    orchestratorAgents: ['planner', 'execution', 'validation', 'recovery', 'monitoring'],
  }, 'Agentflow AI platform is operational');
});

// API Routes Mount
app.use('/api/auth', authRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/executions', executionRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/notifications', notificationRoutes);

// 404 Route Handler
app.use((req, res) => {
  return ApiResponse.error(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
});

// Centralized Error Handling Middleware
app.use(errorHandler);

module.exports = app;
