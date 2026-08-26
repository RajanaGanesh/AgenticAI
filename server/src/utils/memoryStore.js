const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const generateId = () => crypto.randomBytes(12).toString('hex');

class MemoryStore {
  constructor() {
    this.users = [];
    this.workflows = [];
    this.executions = [];
    this.executionLogs = [];
    this.integrations = [];
    this.notifications = [];
    this.agentMemories = [];
  }

  // USERS
  async findUserByEmail(email, includePassword = false) {
    const user = this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return null;
    const clone = { ...user };
    if (!includePassword) delete clone.password;
    clone.comparePassword = async (pass) => bcrypt.compare(pass, user.password);
    return clone;
  }

  async findUserById(id) {
    const user = this.users.find((u) => u._id === id || u.id === id);
    if (!user) return null;
    const clone = { ...user };
    delete clone.password;
    return clone;
  }

  async createUser({ name, email, password, role = 'operator' }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      _id: generateId(),
      id: null,
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      lastLogin: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    user.id = user._id;
    this.users.push(user);
    const clone = { ...user };
    delete clone.password;
    clone.comparePassword = async (pass) => bcrypt.compare(pass, user.password);
    return clone;
  }

  // WORKFLOWS
  async createWorkflow(data) {
    const doc = {
      _id: generateId(),
      id: null,
      name: data.name || 'Untitled Workflow',
      description: data.description || '',
      owner: data.owner,
      status: data.status || 'draft',
      triggerConfig: data.triggerConfig || { type: 'manual' },
      nodes: data.nodes || [],
      edges: data.edges || [],
      tags: data.tags || [],
      version: data.version || 1,
      promptSource: data.promptSource || '',
      executionCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    doc.id = doc._id;
    this.workflows.push(doc);
    return doc;
  }

  async listWorkflows(ownerId, { search = '', status = '', tag = '', page = 1, limit = 10 } = {}) {
    let list = this.workflows.filter((w) => String(w.owner) === String(ownerId));

    if (search) {
      const q = search.toLowerCase();
      list = list.filter((w) => (w.name || '').toLowerCase().includes(q) || (w.description || '').toLowerCase().includes(q));
    }
    if (status && status !== 'all') {
      list = list.filter((w) => w.status === status);
    }
    if (tag) {
      list = list.filter((w) => (w.tags || []).includes(tag));
    }

    const total = list.length;
    const skip = (page - 1) * limit;
    const workflows = list.slice(skip, skip + limit);
    return { workflows, total };
  }

  async getWorkflowById(id, ownerId) {
    return this.workflows.find((w) => (w._id === id || w.id === id) && String(w.owner) === String(ownerId)) || null;
  }

  async updateWorkflow(id, ownerId, updateData) {
    const idx = this.workflows.findIndex((w) => (w._id === id || w.id === id) && String(w.owner) === String(ownerId));
    if (idx === -1) return null;
    const current = this.workflows[idx];
    const updated = {
      ...current,
      ...updateData,
      version: (current.version || 1) + 1,
      updatedAt: new Date(),
    };
    this.workflows[idx] = updated;
    return updated;
  }

  async deleteWorkflow(id, ownerId) {
    const idx = this.workflows.findIndex((w) => (w._id === id || w.id === id) && String(w.owner) === String(ownerId));
    if (idx === -1) return null;
    const removed = this.workflows.splice(idx, 1)[0];
    return removed;
  }

  // EXECUTIONS
  async createExecution(data) {
    const doc = {
      _id: generateId(),
      id: null,
      workflowId: data.workflowId,
      owner: data.owner,
      workflowSnapshot: data.workflowSnapshot,
      status: data.status || 'PENDING',
      currentNode: null,
      completedNodes: [],
      startTime: new Date(),
      endTime: null,
      duration: 0,
      inputs: data.inputs || {},
      outputs: {},
      nodeResults: {},
      error: null,
      retryCount: 0,
      maxRetries: 3,
      confidenceScore: 1.0,
      triggerType: data.triggerType || 'manual',
      isPaused: false,
      isCancelled: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      save: async function () { return this; },
    };
    doc.id = doc._id;
    this.executions.push(doc);
    return doc;
  }

  async getExecutionById(id, ownerId = null) {
    const exec = this.executions.find((e) => (e._id === id || e.id === id) && (!ownerId || String(e.owner) === String(ownerId)));
    if (!exec) return null;
    // Populate workflow name if needed
    const wf = this.workflows.find((w) => String(w._id) === String(exec.workflowId));
    exec.workflowId = wf ? { _id: wf._id, name: wf.name, description: wf.description } : exec.workflowId;
    exec.save = async function () { return this; };
    return exec;
  }

  async listExecutions(ownerId, { status = null, page = 1, limit = 15 } = {}) {
    let list = this.executions.filter((e) => String(e.owner) === String(ownerId));
    if (status && status !== 'all') {
      list = list.filter((e) => e.status === status);
    }
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const total = list.length;
    const skip = (page - 1) * limit;
    const executions = list.slice(skip, skip + limit).map((exec) => {
      const wf = this.workflows.find((w) => String(w._id) === String(exec.workflowId?._id || exec.workflowId));
      return {
        ...exec,
        workflowId: wf ? { _id: wf._id, name: wf.name, description: wf.description } : exec.workflowId,
      };
    });
    return { executions, total };
  }

  // EXECUTION LOGS
  async createExecutionLog(data) {
    const doc = {
      _id: generateId(),
      id: null,
      executionId: data.executionId,
      workflowId: data.workflowId,
      nodeId: data.nodeId || null,
      agent: data.agent,
      level: data.level || 'info',
      message: data.message,
      metadata: data.metadata || {},
      timestamp: data.timestamp || new Date(),
    };
    doc.id = doc._id;
    this.executionLogs.push(doc);
    return doc;
  }

  async getExecutionLogs(executionId) {
    return this.executionLogs
      .filter((l) => String(l.executionId) === String(executionId))
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }

  // INTEGRATIONS
  async getIntegrations(ownerId) {
    return this.integrations.filter((i) => String(i.owner) === String(ownerId));
  }

  async getIntegration(ownerId, provider) {
    return this.integrations.find((i) => String(i.owner) === String(ownerId) && i.provider === provider) || null;
  }

  async upsertIntegration(ownerId, provider, updateData) {
    const idx = this.integrations.findIndex((i) => String(i.owner) === String(ownerId) && i.provider === provider);
    if (idx >= 0) {
      this.integrations[idx] = { ...this.integrations[idx], ...updateData, updatedAt: new Date() };
      return this.integrations[idx];
    }
    const doc = {
      _id: generateId(),
      owner: ownerId,
      provider,
      ...updateData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.integrations.push(doc);
    return doc;
  }

  async removeIntegration(ownerId, provider) {
    const idx = this.integrations.findIndex((i) => String(i.owner) === String(ownerId) && i.provider === provider);
    if (idx >= 0) {
      return this.integrations.splice(idx, 1)[0];
    }
    return null;
  }

  // NOTIFICATIONS
  async createNotification(data) {
    const doc = {
      _id: generateId(),
      id: null,
      owner: data.owner,
      workflowId: data.workflowId || null,
      executionId: data.executionId || null,
      type: data.type || 'info',
      title: data.title,
      message: data.message,
      link: data.link || '',
      isRead: false,
      createdAt: new Date(),
    };
    doc.id = doc._id;
    this.notifications.push(doc);
    return doc;
  }

  async getNotifications(ownerId, limit = 20) {
    return this.notifications
      .filter((n) => String(n.owner) === String(ownerId))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  }

  async markNotificationRead(id, ownerId) {
    const notif = this.notifications.find((n) => (n._id === id || n.id === id) && String(n.owner) === String(ownerId));
    if (notif) notif.isRead = true;
    return notif;
  }

  async markAllNotificationsRead(ownerId) {
    this.notifications.forEach((n) => {
      if (String(n.owner) === String(ownerId)) n.isRead = true;
    });
  }

  async getUnreadNotificationCount(ownerId) {
    return this.notifications.filter((n) => String(n.owner) === String(ownerId) && !n.isRead).length;
  }
}

module.exports = new MemoryStore();
