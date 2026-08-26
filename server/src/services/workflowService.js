const mongoose = require('mongoose');
const Workflow = require('../models/Workflow');
const Execution = require('../models/Execution');
const ExecutionLog = require('../models/ExecutionLog');
const memoryStore = require('../utils/memoryStore');

class WorkflowService {
  isMongooseActive() {
    return mongoose.connection.readyState === 1;
  }

  async createWorkflow(userId, data) {
    const { name, description, triggerConfig, nodes, edges, tags, promptSource, status } = data;
    if (this.isMongooseActive()) {
      return Workflow.create({
        name: name || 'Untitled Workflow',
        description: description || '',
        owner: userId,
        status: status || 'draft',
        triggerConfig: triggerConfig || { type: 'manual' },
        nodes: nodes || [],
        edges: edges || [],
        tags: tags || [],
        promptSource: promptSource || '',
        version: 1,
      });
    } else {
      return memoryStore.createWorkflow({
        name: name || 'Untitled Workflow',
        description: description || '',
        owner: userId,
        status: status || 'draft',
        triggerConfig: triggerConfig || { type: 'manual' },
        nodes: nodes || [],
        edges: edges || [],
        tags: tags || [],
        promptSource: promptSource || '',
        version: 1,
      });
    }
  }

  async listWorkflows(userId, { page = 1, limit = 10, search = '', status = '', tag = '' } = {}) {
    if (this.isMongooseActive()) {
      const query = { owner: userId };
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ];
      }
      if (status && status !== 'all') query.status = status;
      if (tag) query.tags = tag;

      const skip = (page - 1) * limit;
      const [workflows, total] = await Promise.all([
        Workflow.find(query).sort({ updatedAt: -1 }).skip(skip).limit(limit),
        Workflow.countDocuments(query),
      ]);
      return { workflows, total };
    } else {
      return memoryStore.listWorkflows(userId, { search, status, tag, page, limit });
    }
  }

  async getWorkflowById(id, userId) {
    if (this.isMongooseActive()) {
      const workflow = await Workflow.findOne({ _id: id, owner: userId });
      if (!workflow) {
        const err = new Error('Workflow not found');
        err.statusCode = 404;
        throw err;
      }
      return workflow;
    } else {
      const workflow = await memoryStore.getWorkflowById(id, userId);
      if (!workflow) {
        const err = new Error('Workflow not found');
        err.statusCode = 404;
        throw err;
      }
      return workflow;
    }
  }

  async updateWorkflow(id, userId, data) {
    if (this.isMongooseActive()) {
      const workflow = await this.getWorkflowById(id, userId);
      if (data.name !== undefined) workflow.name = data.name;
      if (data.description !== undefined) workflow.description = data.description;
      if (data.status !== undefined) workflow.status = data.status;
      if (data.triggerConfig !== undefined) workflow.triggerConfig = data.triggerConfig;
      if (data.nodes !== undefined) workflow.nodes = data.nodes;
      if (data.edges !== undefined) workflow.edges = data.edges;
      if (data.tags !== undefined) workflow.tags = data.tags;
      workflow.version += 1;
      await workflow.save();
      return workflow;
    } else {
      const updated = await memoryStore.updateWorkflow(id, userId, data);
      if (!updated) {
        const err = new Error('Workflow not found');
        err.statusCode = 404;
        throw err;
      }
      return updated;
    }
  }

  async duplicateWorkflow(id, userId) {
    const original = await this.getWorkflowById(id, userId);
    return this.createWorkflow(userId, {
      name: `${original.name} (Copy)`,
      description: original.description,
      status: 'draft',
      triggerConfig: original.triggerConfig,
      nodes: original.nodes,
      edges: original.edges,
      tags: original.tags,
    });
  }

  async deleteWorkflow(id, userId) {
    if (this.isMongooseActive()) {
      const workflow = await Workflow.findOneAndDelete({ _id: id, owner: userId });
      if (!workflow) {
        const err = new Error('Workflow not found');
        err.statusCode = 404;
        throw err;
      }
      return workflow;
    } else {
      const removed = await memoryStore.deleteWorkflow(id, userId);
      if (!removed) {
        const err = new Error('Workflow not found');
        err.statusCode = 404;
        throw err;
      }
      return removed;
    }
  }

  async getDashboardStats(userId) {
    if (this.isMongooseActive()) {
      const [
        totalWorkflows,
        activeWorkflows,
        totalExecutions,
        completedExecutions,
        failedExecutions,
        recentExecutions,
        recentLogs,
      ] = await Promise.all([
        Workflow.countDocuments({ owner: userId }),
        Workflow.countDocuments({ owner: userId, status: 'active' }),
        Execution.countDocuments({ owner: userId }),
        Execution.countDocuments({ owner: userId, status: 'COMPLETED' }),
        Execution.countDocuments({ owner: userId, status: 'FAILED' }),
        Execution.find({ owner: userId }).populate('workflowId', 'name').sort({ createdAt: -1 }).limit(6),
        ExecutionLog.find().sort({ timestamp: -1 }).limit(10),
      ]);

      const successRate = totalExecutions > 0 ? Math.round((completedExecutions / totalExecutions) * 100) : 100;
      return {
        metrics: { totalWorkflows, activeWorkflows, totalExecutions, completedExecutions, failedExecutions, successRate, activeAgentsCount: 5 },
        recentExecutions,
        recentLogs,
      };
    } else {
      const userWorkflows = memoryStore.workflows.filter((w) => String(w.owner) === String(userId));
      const userExecs = memoryStore.executions.filter((e) => String(e.owner) === String(userId));
      const completed = userExecs.filter((e) => e.status === 'COMPLETED').length;
      const failed = userExecs.filter((e) => e.status === 'FAILED').length;
      const successRate = userExecs.length > 0 ? Math.round((completed / userExecs.length) * 100) : 100;

      const recentExecutions = userExecs.slice(-6).reverse().map((e) => {
        const wf = userWorkflows.find((w) => String(w._id) === String(e.workflowId));
        return { ...e, workflowId: wf ? { name: wf.name } : { name: 'Workflow' } };
      });

      const recentLogs = memoryStore.executionLogs.slice(-10).reverse();

      return {
        metrics: {
          totalWorkflows: userWorkflows.length,
          activeWorkflows: userWorkflows.filter((w) => w.status === 'active').length,
          totalExecutions: userExecs.length,
          completedExecutions: completed,
          failedExecutions: failed,
          successRate,
          activeAgentsCount: 5,
        },
        recentExecutions,
        recentLogs,
      };
    }
  }
}

module.exports = new WorkflowService();
