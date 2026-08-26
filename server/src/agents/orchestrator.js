const mongoose = require('mongoose');
const Execution = require('../models/Execution');
const Workflow = require('../models/Workflow');
const plannerAgent = require('./plannerAgent');
const executionAgent = require('./executionAgent');
const validationAgent = require('./validationAgent');
const recoveryAgent = require('./recoveryAgent');
const monitoringAgent = require('./monitoringAgent');
const { emitExecutionStatus } = require('../config/socket');
const notificationService = require('../services/notificationService');
const memoryStore = require('../utils/memoryStore');

class Orchestrator {
  isMongooseActive() {
    return mongoose.connection.readyState === 1;
  }

  checkLangGraphStatus() {
    try {
      require.resolve('@langchain/langgraph');
      return 'available';
    } catch (e) {
      return 'not-installed';
    }
  }

  async getExecutionDoc(id) {
    if (this.isMongooseActive()) {
      return Execution.findById(id);
    }
    return memoryStore.getExecutionById(id);
  }

  async runExecution(executionId) {
    const langGraphStatus = this.checkLangGraphStatus();
    let execution = await this.getExecutionDoc(executionId);
    if (!execution) {
      throw new Error(`Execution ${executionId} not found`);
    }

    const workflow = execution.workflowSnapshot;
    const workflowId = execution.workflowId?._id || execution.workflowId;
    const startTime = Date.now();

    execution.status = 'RUNNING';
    execution.startTime = new Date(startTime);
    await execution.save();

    emitExecutionStatus(executionId.toString(), {
      status: 'RUNNING',
      langGraph: langGraphStatus,
      currentNode: null,
    });

    await monitoringAgent.logEvent({
      executionId,
      workflowId,
      agent: 'monitoring',
      level: 'info',
      message: `Orchestrator initialized execution run for "${workflow.name}". LangGraph substrate status: [${langGraphStatus}].`,
      metadata: { langGraph: langGraphStatus, triggerType: execution.triggerType },
    });

    try {
      // 1. Planner Agent
      const plan = await plannerAgent.createPlan(workflow, execution);
      execution.confidenceScore = plan.confidenceScore;
      await execution.save();

      const executionContext = {
        workflowName: workflow.name,
        initialInputs: execution.inputs || {},
        nodeOutputs: {},
        lastOutput: null,
      };

      const nodeMap = new Map();
      (workflow.nodes || []).forEach((n) => nodeMap.set(n.id, n));

      // 2. Step Sequence
      for (const nodeId of plan.sequence) {
        const currentExec = await this.getExecutionDoc(executionId);
        if (!currentExec) break;

        if (currentExec.isCancelled) {
          execution.status = 'CANCELLED';
          execution.endTime = new Date();
          execution.duration = Date.now() - startTime;
          await execution.save();
          emitExecutionStatus(executionId.toString(), { status: 'CANCELLED' });
          return execution;
        }

        if (currentExec.isPaused) {
          execution.status = 'PAUSED';
          execution.currentNode = nodeId;
          await execution.save();
          emitExecutionStatus(executionId.toString(), { status: 'PAUSED', currentNode: nodeId });
          return execution;
        }

        const node = nodeMap.get(nodeId);
        if (!node) continue;

        execution.currentNode = nodeId;
        await execution.save();
        emitExecutionStatus(executionId.toString(), { status: 'RUNNING', currentNode: nodeId });

        let stepSuccess = false;
        let stepOutput = null;

        while (!stepSuccess) {
          try {
            stepOutput = await executionAgent.executeNode(node, executionContext, execution, workflow);
            const validation = await validationAgent.validateNodeOutput(node, stepOutput, executionContext, execution, workflow);
            if (!validation.valid) {
              throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
            }
            stepSuccess = true;
          } catch (stepError) {
            const recoveryDecision = await recoveryAgent.handleFailure(stepError, node, execution, workflow);

            if (recoveryDecision.action === 'retry_with_backoff') {
              execution.status = 'RETRYING';
              execution.retryCount = (execution.retryCount || 0) + 1;
              await execution.save();

              emitExecutionStatus(executionId.toString(), {
                status: 'RETRYING',
                retryCount: execution.retryCount,
                currentNode: nodeId,
              });

              await new Promise((res) => setTimeout(res, recoveryDecision.backoffDelayMs));
              execution.status = 'RUNNING';
              await execution.save();
            } else {
              execution.status = 'FAILED';
              execution.error = {
                message: stepError.message,
                category: recoveryDecision.category,
                nodeId,
                failedAt: new Date().toISOString(),
              };
              execution.endTime = new Date();
              execution.duration = Date.now() - startTime;
              await execution.save();

              emitExecutionStatus(executionId.toString(), {
                status: 'FAILED',
                error: execution.error,
              });
              return execution;
            }
          }
        }

        executionContext.nodeOutputs[nodeId] = stepOutput;
        executionContext.lastOutput = stepOutput;
        if (node.data?.action === 'ai_transform' && stepOutput.summary) {
          executionContext.ai = { summary: stepOutput.summary };
        }

        execution.completedNodes.push(nodeId);
        execution.nodeResults = executionContext.nodeOutputs;
        await execution.save();
      }

      // Complete
      const endTime = Date.now();
      execution.status = 'COMPLETED';
      execution.endTime = new Date(endTime);
      execution.duration = endTime - startTime;
      execution.currentNode = null;
      execution.outputs = executionContext.lastOutput || executionContext.nodeOutputs;
      await execution.save();

      if (this.isMongooseActive()) {
        await Workflow.findByIdAndUpdate(workflowId, { $inc: { executionCount: 1 } });
      }

      await monitoringAgent.logEvent({
        executionId,
        workflowId,
        agent: 'monitoring',
        level: 'success',
        message: `Workflow "${workflow.name}" completed successfully in ${execution.duration}ms.`,
        metadata: { duration: execution.duration, finalOutput: execution.outputs },
      });

      try {
        await notificationService.createNotification({
          owner: execution.owner,
          workflowId,
          executionId,
          type: 'success',
          title: `Execution Completed: ${workflow.name}`,
          message: `All ${execution.completedNodes.length} nodes executed successfully in ${execution.duration}ms.`,
          link: `/executions/${executionId}`,
        });
      } catch (nErr) {
        // non-blocking
      }

      emitExecutionStatus(executionId.toString(), {
        status: 'COMPLETED',
        duration: execution.duration,
        outputs: execution.outputs,
      });

      return execution;
    } catch (fatalError) {
      console.error('[Orchestrator] Fatal error during workflow execution:', fatalError);
      execution.status = 'FAILED';
      execution.error = { message: fatalError.message, stack: fatalError.stack };
      execution.endTime = new Date();
      execution.duration = Date.now() - startTime;
      await execution.save();

      emitExecutionStatus(executionId.toString(), {
        status: 'FAILED',
        error: execution.error,
      });
      return execution;
    }
  }
}

module.exports = new Orchestrator();
