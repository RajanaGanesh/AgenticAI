const axios = require('axios');
const BaseIntegration = require('./baseIntegration');
const env = require('../config/env');

class SlackIntegration extends BaseIntegration {
  constructor() {
    super('slack');
  }

  getAuthUrl(state) {
    const clientId = env.OAUTH.SLACK.CLIENT_ID;
    const redirectUri = encodeURIComponent(env.OAUTH.SLACK.REDIRECT_URI);
    const scopes = encodeURIComponent('chat:write,chat:write.public,channels:read,incoming-webhook');
    return `https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=${scopes}&redirect_uri=${redirectUri}&state=${state || ''}`;
  }

  async handleCallback(code) {
    try {
      const response = await axios.post(
        'https://slack.com/api/oauth.v2.access',
        new URLSearchParams({
          code,
          client_id: env.OAUTH.SLACK.CLIENT_ID,
          client_secret: env.OAUTH.SLACK.CLIENT_SECRET,
          redirect_uri: env.OAUTH.SLACK.REDIRECT_URI,
        }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      if (!response.data.ok) {
        throw new Error(response.data.error || 'Slack OAuth failed');
      }

      return {
        accessToken: response.data.access_token,
        scopes: response.data.scope ? response.data.scope.split(',') : [],
        metadata: {
          teamName: response.data.team?.name || 'Slack Workspace',
          teamId: response.data.team?.id,
          botUserId: response.data.bot_user_id,
          webhookUrl: response.data.incoming_webhook?.url || '',
        },
      };
    } catch (error) {
      throw new Error(`Slack OAuth error: ${error.message}`);
    }
  }

  async testConnection(credentials) {
    if (!credentials || (!credentials.accessToken && !credentials.webhookUrl)) {
      return { connected: false, error: 'INTEGRATION_NOT_CONNECTED' };
    }

    try {
      if (credentials.accessToken) {
        const res = await axios.post(
          'https://slack.com/api/auth.test',
          {},
          { headers: { Authorization: `Bearer ${credentials.accessToken}` }, timeout: 5000 }
        );
        return { connected: res.data.ok, teamName: res.data.team, user: res.data.user };
      }
      return { connected: true, webhookConfigured: true };
    } catch (err) {
      if (credentials.isDemo || credentials.accessToken === 'demo_token') {
        return { connected: true, teamName: 'Agentflow Ops Team', isDemo: true };
      }
      const classified = this.classifyError(err);
      return { connected: false, error: classified.code, details: classified.message };
    }
  }

  async executeAction(action, params, credentials, context = {}) {
    if (!credentials || (!credentials.accessToken && !credentials.apiKey && !credentials.webhookUrl && !credentials.isDemo)) {
      const err = new Error('Slack integration is not connected');
      err.code = 'INTEGRATION_NOT_CONNECTED';
      throw err;
    }

    const { channel = '#general', text = '', blocks = null, message = '' } = params;
    const content = text || message || 'Agentflow Automation Alert';

    if (credentials.isDemo || credentials.accessToken === 'demo_token' || (!env.OAUTH.SLACK.CLIENT_ID && !credentials.webhookUrl)) {
      return {
        status: 'posted',
        ts: `${Date.now() / 1000}`,
        channel: channel || '#general',
        text: content,
        mode: 'sandbox_simulation',
      };
    }

    switch (action) {
      case 'post_message':
      case 'send_notification': {
        if (credentials.webhookUrl) {
          const res = await axios.post(credentials.webhookUrl, { text: content });
          return { status: 'posted', response: res.data };
        }

        const res = await axios.post(
          'https://slack.com/api/chat.postMessage',
          {
            channel: channel.startsWith('#') ? channel : `#${channel}`,
            text: content,
            blocks: blocks || undefined,
          },
          { headers: { Authorization: `Bearer ${credentials.accessToken}` } }
        );

        if (!res.data.ok) {
          throw new Error(`Slack API error: ${res.data.error}`);
        }
        return { status: 'posted', channel: res.data.channel, ts: res.data.ts };
      }

      default:
        throw new Error(`Unsupported Slack action: ${action}`);
    }
  }
}

module.exports = new SlackIntegration();
