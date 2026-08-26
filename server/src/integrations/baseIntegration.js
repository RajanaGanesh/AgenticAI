/**
 * Base Integration Class
 * Standardizes lifecycle, execution, and error shaping for external providers.
 */
class BaseIntegration {
  constructor(providerName) {
    if (!providerName) {
      throw new Error('Provider name is required');
    }
    this.provider = providerName;
  }

  /**
   * Generates OAuth authorization URL
   */
  getAuthUrl(state) {
    throw new Error(`getAuthUrl() not implemented for ${this.provider}`);
  }

  /**
   * Exchanges authorization code for tokens
   */
  async handleCallback(code) {
    throw new Error(`handleCallback() not implemented for ${this.provider}`);
  }

  /**
   * Tests whether the credentials are valid and live
   */
  async testConnection(credentials) {
    throw new Error(`testConnection() not implemented for ${this.provider}`);
  }

  /**
   * Executes a specific tool action
   * @param {string} action - action identifier
   * @param {object} params - action parameters
   * @param {object} credentials - decrypted credentials
   * @param {object} context - workflow run context
   */
  async executeAction(action, params, credentials, context = {}) {
    throw new Error(`executeAction() not implemented for ${this.provider}`);
  }

  /**
   * Normalizes error shapes into standard error classification
   */
  classifyError(error) {
    const message = error.message || String(error);
    const status = error.response?.status || error.statusCode || 500;

    if (status === 401 || status === 403 || message.includes('AUTH') || message.includes('token expired') || message.includes('invalid_grant')) {
      return { code: 'AUTH_EXPIRED', message: `Authentication expired or unauthorized for ${this.provider}`, raw: message };
    }
    if (status === 429 || message.includes('rate limit') || message.includes('quota')) {
      return { code: 'RATE_LIMIT', message: `Rate limit reached for ${this.provider}`, raw: message };
    }
    if (status >= 500 || message.includes('ECONNREFUSED') || message.includes('ETIMEDOUT') || message.includes('ENOTFOUND')) {
      return { code: 'API_FAILURE', message: `External API failure from ${this.provider}`, raw: message };
    }
    if (message.includes('missing') || message.includes('required') || status === 400) {
      return { code: 'MISSING_FIELDS', message: `Invalid input or missing fields for ${this.provider}: ${message}`, raw: message };
    }
    return { code: 'TRANSIENT', message: `Transient error in ${this.provider}: ${message}`, raw: message };
  }
}

module.exports = BaseIntegration;
