const integrationService = require('../services/integrationService');
const ApiResponse = require('../utils/apiResponse');
const env = require('../config/env');

class IntegrationController {
  async listIntegrations(req, res, next) {
    try {
      const integrations = await integrationService.getUserIntegrations(req.user.id);
      return ApiResponse.success(res, integrations, 'Integrations list retrieved');
    } catch (err) {
      next(err);
    }
  }

  async getIntegrationStatus(req, res, next) {
    try {
      const status = await integrationService.getIntegrationStatus(req.user.id);
      return ApiResponse.success(res, status, 'Integration provider status retrieved');
    } catch (err) {
      next(err);
    }
  }

  async startOAuth(req, res, next) {
    try {
      const { provider } = req.params;
      const authUrl = await integrationService.getAuthUrl(provider, req.user.id);
      return ApiResponse.success(res, { authUrl }, `OAuth URL generated for ${provider}`);
    } catch (err) {
      next(err);
    }
  }

  async oauthCallback(req, res, next) {
    try {
      const { provider } = req.params;
      const { code, state, error } = req.query;

      if (error) {
        return res.redirect(`${env.CLIENT_URL}/integrations?error=${encodeURIComponent(error)}`);
      }

      if (!code) {
        return res.redirect(`${env.CLIENT_URL}/integrations?error=No+authorization+code+received`);
      }

      await integrationService.handleOAuthCallback(provider, code, state);
      return res.redirect(`${env.CLIENT_URL}/integrations?success=${encodeURIComponent(provider)}`);
    } catch (err) {
      console.error('[Integration OAuth Callback Error]', err);
      return res.redirect(`${env.CLIENT_URL}/integrations?error=${encodeURIComponent(err.message)}`);
    }
  }

  async oauthError(req, res) {
    return ApiResponse.error(res, 'OAuth Authorization was denied or failed', 400);
  }

  async saveManualCredentials(req, res, next) {
    try {
      const { provider, apiKey, accessToken, botToken, webhookUrl, metadata } = req.body;
      const result = await integrationService.saveManualCredentials(req.user.id, {
        provider,
        apiKey,
        accessToken,
        botToken,
        webhookUrl,
        metadata,
      });
      return ApiResponse.success(res, result, `Credentials saved securely for ${provider}`);
    } catch (err) {
      next(err);
    }
  }

  async disconnect(req, res, next) {
    try {
      const { provider } = req.params;
      const result = await integrationService.disconnectIntegration(req.user.id, provider);
      return ApiResponse.success(res, result, `Integration ${provider} disconnected successfully`);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new IntegrationController();
