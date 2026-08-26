const monitoringAgent = require('./monitoringAgent');
const notificationService = require('../services/notificationService');

class RecoveryAgent {
  /**
   * Classifies error and determines recovery strategy
   */
  async handleFailure(error, node, execution, workflow) {
    const executionId = execution._id;
    const workflowId = workflow._id;
    const nodeId = node ? node.id : null;
    const currentRetries = execution.retryCount || 0;
    const maxRetries = execution.maxRetries || 3;

    // 1. Classification
    const classification = this.classifyError(error);

    await monitoringAgent.logEvent({
      executionId,
      workflowId,
      nodeId,
      agent: 'recovery',
      level: 'warning',
      message: `Analyzing failure for node "${node?.data?.label || nodeId || 'workflow'}": classified as ${classification.category} (${classification.reason}).`,
      metadata: { classification, currentRetries, maxRetries },
    });

    // 2. Decide Strategy
    let action = 'escalate';
    let backoffDelayMs = 0;

    if (classification.recoverable && currentRetries < maxRetries) {
      action = 'retry_with_backoff';
      // Exponential backoff: 1s, 2s, 4s...
      backoffDelayMs = Math.min(1000 * Math.pow(2, currentRetries), 10000);

      await monitoringAgent.logEvent({
        executionId,
        workflowId,
        nodeId,
        agent: 'recovery',
        level: 'info',
        message: `Self-healing plan: Initiating retry ${currentRetries + 1}/${maxRetries} with ${backoffDelayMs}ms backoff.`,
        metadata: { nextRetry: currentRetries + 1, backoffDelayMs },
      });
    } else {
      action = 'escalate';
      await monitoringAgent.logEvent({
        executionId,
        workflowId,
        nodeId,
        agent: 'recovery',
        level: 'error',
        message: `Escalating failure to operator console. Reason: ${classification.reason} (Unrecoverable or retries exhausted).`,
        metadata: { classification, exhausted: currentRetries >= maxRetries },
      });

      // Send persistent notification to operator
      try {
        await notificationService.createNotification({
          owner: execution.owner,
          workflowId,
          executionId,
          type: 'escalation',
          title: `Workflow Run Failed: ${workflow.name}`,
          message: `Execution stopped at step "${node?.data?.label || nodeId}": ${classification.reason}`,
          link: `/executions/${executionId}`,
        });
      } catch (notifErr) {
        console.error('[RecoveryAgent] Notification failed:', notifErr.message);
      }
    }

    return {
      action, // 'retry_with_backoff' | 'escalate'
      category: classification.category,
      reason: classification.reason,
      backoffDelayMs,
    };
  }

  classifyError(error) {
    const msg = (error.message || String(error)).toLowerCase();
    const code = error.code || '';

    if (code === 'AUTH_EXPIRED' || msg.includes('auth') || msg.includes('token') || msg.includes('unauthorized') || msg.includes('401')) {
      return {
        category: 'AUTH_EXPIRED',
        reason: 'Authentication token expired or integration not authorized.',
        recoverable: false,
      };
    }

    if (code === 'INTEGRATION_NOT_CONNECTED' || msg.includes('not connected')) {
      return {
        category: 'AUTH_EXPIRED',
        reason: 'Integration credentials are not configured or connected.',
        recoverable: false,
      };
    }

    if (code === 'MISSING_FIELDS' || msg.includes('missing') || msg.includes('required') || msg.includes('invalid input')) {
      return {
        category: 'MISSING_FIELDS',
        reason: error.message || 'Required node parameters or output fields are missing.',
        recoverable: false,
      };
    }

    if (code === 'RATE_LIMIT' || msg.includes('rate limit') || msg.includes('429') || msg.includes('quota')) {
      return {
        category: 'RATE_LIMIT',
        reason: 'Provider rate limit or quota exceeded.',
        recoverable: true,
      };
    }

    if (code === 'API_FAILURE' || msg.includes('500') || msg.includes('502') || msg.includes('503') || msg.includes('econnrefused')) {
      return {
        category: 'API_FAILURE',
        reason: 'Downstream provider or API endpoint unreachable.',
        recoverable: true,
      };
    }

    return {
      category: 'TRANSIENT',
      reason: error.message || 'Transient execution exception encountered.',
      recoverable: true,
    };
  }
}

module.exports = new RecoveryAgent();
