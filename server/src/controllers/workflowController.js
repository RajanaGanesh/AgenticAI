const workflowService = require('../services/workflowService');
const aiService = require('../services/aiService');
const executionService = require('../services/executionService');
const ApiResponse = require('../utils/apiResponse');

class WorkflowController {
  async getDashboardStats(req, res, next) {
    try {
      const stats = await workflowService.getDashboardStats(req.user.id);
      return ApiResponse.success(res, stats, 'Dashboard metrics retrieved');
    } catch (err) {
      next(err);
    }
  }

  async listWorkflows(req, res, next) {
    try {
      const { page = 1, limit = 10, search = '', status = '', tag = '' } = req.query;
      const result = await workflowService.listWorkflows(req.user.id, { page, limit, search, status, tag });
      return ApiResponse.paginated(res, result.workflows, result.total, page, limit, 'Workflows retrieved');
    } catch (err) {
      next(err);
    }
  }

  async createWorkflow(req, res, next) {
    try {
      const workflow = await workflowService.createWorkflow(req.user.id, req.body);
      return ApiResponse.success(res, workflow, 'Workflow created successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  async generateWorkflow(req, res, next) {
    try {
      const { prompt, apiKey } = req.body;
      const generatedGraph = await aiService.generateWorkflow(prompt, apiKey);
      return ApiResponse.success(res, generatedGraph, 'Workflow generated successfully from prompt');
    } catch (err) {
      next(err);
    }
  }

  async getWorkflowById(req, res, next) {
    try {
      const workflow = await workflowService.getWorkflowById(req.params.id, req.user.id);
      return ApiResponse.success(res, workflow, 'Workflow retrieved');
    } catch (err) {
      next(err);
    }
  }

  async updateWorkflow(req, res, next) {
    try {
      const workflow = await workflowService.updateWorkflow(req.params.id, req.user.id, req.body);
      return ApiResponse.success(res, workflow, 'Workflow updated successfully');
    } catch (err) {
      next(err);
    }
  }

  async duplicateWorkflow(req, res, next) {
    try {
      const duplicated = await workflowService.duplicateWorkflow(req.params.id, req.user.id);
      return ApiResponse.success(res, duplicated, 'Workflow cloned successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  async executeWorkflow(req, res, next) {
    try {
      const execution = await executionService.triggerExecution(req.params.id, req.user.id, {
        inputs: req.body.inputs || {},
        triggerType: req.body.triggerType || 'manual',
      });
      return ApiResponse.success(res, execution, 'Execution triggered successfully', 202);
    } catch (err) {
      next(err);
    }
  }

  async deleteWorkflow(req, res, next) {
    try {
      await workflowService.deleteWorkflow(req.params.id, req.user.id);
      return ApiResponse.success(res, null, 'Workflow deleted successfully');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new WorkflowController();
