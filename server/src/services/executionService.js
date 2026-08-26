const mongoose = require('mongoose');
const Execution = require('../models/Execution');
const ExecutionLog = require('../models/ExecutionLog');
const Workflow = require('../models/Workflow');
const workflowService = require('./workflowService');
const { addExecutionJob } = require('../queues/executionQueue');
const memoryStore = require('../utils/memoryStore');

class ExecutionService {
  isMongooseActive() {
    return mongoose.connection.readyState === 1;
  }

  async triggerExecution(workflowId, userId, { inputs = {}, triggerType = 'manual' } = {}) {
    const workflow = await workflowService.getWorkflowById(workflowId, userId);
    if (!workflow) {
      const err = new Error('Workflow not found');
      err.statusCode = 404;
      throw err;
    }

    if (!workflow.nodes || workflow.nodes.length === 0) {
      const err = new Error('Cannot execute workflow with zero nodes');
      err.statusCode = 400;
      throw err;
    }

    const workflowSnapshot = {
      _id: workflow._id || workflow.id,
      name: workflow.name,
      description: workflow.description,
      triggerConfig: workflow.triggerConfig,
      nodes: JSON.parse(JSON.stringify(workflow.nodes)),
      edges: JSON.parse(JSON.stringify(workflow.edges)),
      version: workflow.version,
    };

    let execution;
    if (this.isMongooseActive()) {
      execution = await Execution.create({
        workflowId: workflow._id,
        owner: userId,
        workflowSnapshot,
        status: 'PENDING',
        inputs,
        triggerType,
        retryCount: 0,
        completedNodes: [],
      });
    } else {
      execution = await memoryStore.createExecution({
        workflowId: workflow._id || workflow.id,
        owner: userId,
        workflowSnapshot,
        status: 'PENDING',
        inputs,
        triggerType,
      });
    }

    await addExecutionJob(execution._id ? execution._id.toString() : execution.id);
    return execution;
  }

  async listExecutions(userId, { page = 1, limit = 15, workflowId = null, status = null } = {}) {
    if (this.isMongooseActive()) {
      const query = { owner: userId };
      if (workflowId) query.workflowId = workflowId;
      if (status && status !== 'all') query.status = status;

      const skip = (page - 1) * limit;
      const [executions, total] = await Promise.all([
        Execution.find(query).populate('workflowId', 'name description').sort({ createdAt: -1 }).skip(skip).limit(limit),
        Execution.countDocuments(query),
      ]);
      return { executions, total };
    } else {
      return memoryStore.listExecutions(userId, { status, page, limit });
    }
  }

  async getExecutionById(id, userId) {
    if (this.isMongooseActive()) {
      const execution = await Execution.findOne({ _id: id, owner: userId }).populate('workflowId', 'name description');
      if (!execution) {
        const err = new Error('Execution not found');
        err.statusCode = 404;
        throw err;
      }
      return execution;
    } else {
      const execution = await memoryStore.getExecutionById(id, userId);
      if (!execution) {
        const err = new Error('Execution not found');
        err.statusCode = 404;
        throw err;
      }
      return execution;
    }
  }

  async getExecutionTimeline(id, userId) {
    const execution = await this.getExecutionById(id, userId);
    let logs = [];
    if (this.isMongooseActive()) {
      logs = await ExecutionLog.find({ executionId: id }).sort({ timestamp: 1 });
    } else {
      logs = await memoryStore.getExecutionLogs(id);
    }
    return { execution, logs };
  }

  async pauseExecution(id, userId) {
    const execution = await this.getExecutionById(id, userId);
    execution.isPaused = true;
    execution.status = 'PAUSED';
    await execution.save();
    return execution;
  }

  async resumeExecution(id, userId) {
    const execution = await this.getExecutionById(id, userId);
    execution.isPaused = false;
    execution.status = 'RUNNING';
    await execution.save();
    await addExecutionJob(id);
    return execution;
  }

  async cancelExecution(id, userId) {
    const execution = await this.getExecutionById(id, userId);
    execution.isCancelled = true;
    execution.status = 'CANCELLED';
    execution.endTime = new Date();
    await execution.save();
    return execution;
  }
}

module.exports = new ExecutionService();
