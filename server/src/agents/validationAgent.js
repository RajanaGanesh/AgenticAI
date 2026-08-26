const monitoringAgent = require('./monitoringAgent');

class ValidationAgent {
  /**
   * Validates the execution results produced by ExecutionAgent for a given node
   */
  async validateNodeOutput(node, output, executionContext, execution, workflow) {
    const executionId = execution._id;
    const workflowId = workflow._id;
    const nodeId = node.id;
    const provider = node.data?.provider || 'system';
    const action = node.data?.action || '';

    await monitoringAgent.logEvent({
      executionId,
      workflowId,
      nodeId,
      agent: 'validation',
      level: 'info',
      message: `Validating execution schema and invariants for node "${node.data?.label || nodeId}" (${provider}/${action}).`,
      metadata: { provider, action },
    });

    const errors = [];

    if (output === undefined || output === null) {
      errors.push('Node output is undefined or null');
    }

    // Provider specific invariant checks
    if (provider === 'gmail') {
      if (action === 'send_email' && (!output || (!output.status && !output.messageId))) {
        errors.push('Gmail send_email failed to return delivery status or messageId');
      }
      if (action === 'read_emails' && (!output || !Array.isArray(output.messages))) {
        errors.push('Gmail read_emails output missing messages array');
      }
    } else if (provider === 'slack') {
      if ((action === 'post_message' || action === 'send_notification') && (!output || (!output.status && !output.response))) {
        errors.push('Slack post_message failed to confirm delivery');
      }
    } else if (provider === 'discord') {
      if (action === 'post_message' && (!output || !output.status)) {
        errors.push('Discord message dispatch failed to return delivery confirmation');
      }
    } else if (provider === 'google-sheets') {
      if (action === 'append_row' && (!output || !output.status)) {
        errors.push('Google Sheets append failed to return update status');
      }
    } else if (provider === 'ai') {
      if (!output || (!output.summary && !output.result && !output.text)) {
        errors.push('AI transform did not generate valid summary or result payload');
      }
    }

    if (errors.length > 0) {
      await monitoringAgent.logEvent({
        executionId,
        workflowId,
        nodeId,
        agent: 'validation',
        level: 'warning',
        message: `Validation detected issues in node output: ${errors.join(', ')}`,
        metadata: { errors, output },
      });
      return { valid: false, errors };
    }

    await monitoringAgent.logEvent({
      executionId,
      workflowId,
      nodeId,
      agent: 'validation',
      level: 'success',
      message: `Node "${node.data?.label || nodeId}" output validated successfully against schema.`,
      metadata: { fieldsVerified: Object.keys(output || {}) },
    });

    return { valid: true, errors: [] };
  }
}

module.exports = new ValidationAgent();
