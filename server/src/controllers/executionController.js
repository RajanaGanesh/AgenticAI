const executionService = require('../services/executionService');
const ApiResponse = require('../utils/apiResponse');

class ExecutionController {
  async listExecutions(req, res, next) {
    try {
      const { page = 1, limit = 15, workflowId, status } = req.query;
      const result = await executionService.listExecutions(req.user.id, { page, limit, workflowId, status });
      return ApiResponse.paginated(res, result.executions, result.total, page, limit, 'Executions retrieved');
    } catch (err) {
      next(err);
    }
  }

  async getExecutionById(req, res, next) {
    try {
      const execution = await executionService.getExecutionById(req.params.id, req.user.id);
      return ApiResponse.success(res, execution, 'Execution details retrieved');
    } catch (err) {
      next(err);
    }
  }

  async getExecutionTimeline(req, res, next) {
    try {
      const data = await executionService.getExecutionTimeline(req.params.id, req.user.id);
      return ApiResponse.success(res, data, 'Execution timeline logs retrieved');
    } catch (err) {
      next(err);
    }
  }

  async pauseExecution(req, res, next) {
    try {
      const execution = await executionService.pauseExecution(req.params.id, req.user.id);
      return ApiResponse.success(res, execution, 'Execution pause signal sent');
    } catch (err) {
      next(err);
    }
  }

  async resumeExecution(req, res, next) {
    try {
      const execution = await executionService.resumeExecution(req.params.id, req.user.id);
      return ApiResponse.success(res, execution, 'Execution resumed');
    } catch (err) {
      next(err);
    }
  }

  async cancelExecution(req, res, next) {
    try {
      const execution = await executionService.cancelExecution(req.params.id, req.user.id);
      return ApiResponse.success(res, execution, 'Execution cancelled');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ExecutionController();
