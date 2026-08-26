const mongoose = require('mongoose');
const ExecutionLog = require('../models/ExecutionLog');
const { emitExecutionEvent } = require('../config/socket');
const memoryStore = require('../utils/memoryStore');

class MonitoringAgent {
  isMongooseActive() {
    return mongoose.connection.readyState === 1;
  }

  async logEvent({ executionId, workflowId, nodeId = null, agent, level = 'info', message, metadata = {} }) {
    try {
      let log;
      const logData = {
        executionId,
        workflowId,
        nodeId,
        agent,
        level,
        message,
        metadata,
        timestamp: new Date(),
      };

      if (this.isMongooseActive()) {
        log = await ExecutionLog.create(logData);
      } else {
        log = await memoryStore.createExecutionLog(logData);
      }

      emitExecutionEvent(executionId ? executionId.toString() : 'demo', 'agent_event', {
        id: log._id || log.id,
        nodeId,
        agent,
        level,
        message,
        metadata,
        timestamp: log.timestamp,
      });

      return log;
    } catch (err) {
      console.error('[MonitoringAgent] Failed to persist/emit log event:', err.message);
      return null;
    }
  }
}

module.exports = new MonitoringAgent();
