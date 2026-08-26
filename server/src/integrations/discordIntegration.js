const axios = require('axios');
const BaseIntegration = require('./baseIntegration');
const env = require('../config/env');

class DiscordIntegration extends BaseIntegration {
  constructor() {
    super('discord');
  }

  getAuthUrl(state) {
    const clientId = env.OAUTH.DISCORD.CLIENT_ID;
    const redirectUri = encodeURIComponent(env.OAUTH.DISCORD.REDIRECT_URI);
    const scopes = encodeURIComponent('bot messages.read webhook.incoming');
    return `https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=2048&scope=${scopes}&redirect_uri=${redirectUri}&response_type=code&state=${state || ''}`;
  }

  async handleCallback(code) {
    try {
      const response = await axios.post(
        'https://discord.com/api/oauth2/token',
        new URLSearchParams({
          client_id: env.OAUTH.DISCORD.CLIENT_ID,
          client_secret: env.OAUTH.DISCORD.CLIENT_SECRET,
          grant_type: 'authorization_code',
          code,
          redirect_uri: env.OAUTH.DISCORD.REDIRECT_URI,
        }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      const { access_token, refresh_token, expires_in, webhook } = response.data;
      return {
        accessToken: access_token,
        refreshToken: refresh_token || null,
        expiresAt: new Date(Date.now() + expires_in * 1000),
        metadata: {
          webhookUrl: webhook?.url || '',
          channelId: webhook?.channel_id || '',
        },
      };
    } catch (error) {
      throw new Error(`Discord OAuth failed: ${error.response?.data?.error_description || error.message}`);
    }
  }

  async testConnection(credentials) {
    if (!credentials || (!credentials.accessToken && !credentials.webhookUrl && !credentials.botToken)) {
      return { connected: false, error: 'INTEGRATION_NOT_CONNECTED' };
    }

    try {
      if (credentials.botToken || env.OAUTH.DISCORD.BOT_TOKEN) {
        const token = credentials.botToken || env.OAUTH.DISCORD.BOT_TOKEN;
        const res = await axios.get('https://discord.com/api/v10/users/@me', {
          headers: { Authorization: `Bot ${token}` },
          timeout: 5000,
        });
        return { connected: true, botUsername: res.data.username };
      }
      return { connected: true, configured: true };
    } catch (err) {
      if (credentials.isDemo || credentials.accessToken === 'demo_token') {
        return { connected: true, botUsername: 'AgentflowBot#0001', isDemo: true };
      }
      const classified = this.classifyError(err);
      return { connected: false, error: classified.code, details: classified.message };
    }
  }

  async executeAction(action, params, credentials, context = {}) {
    if (!credentials || (!credentials.accessToken && !credentials.webhookUrl && !credentials.botToken && !credentials.isDemo)) {
      const err = new Error('Discord integration is not connected');
      err.code = 'INTEGRATION_NOT_CONNECTED';
      throw err;
    }

    const { content = '', channelId = '', embeds = [] } = params;
    const messageContent = content || params.message || 'Agentflow Alert Notification';

    if (credentials.isDemo || credentials.accessToken === 'demo_token' || (!credentials.webhookUrl && !credentials.botToken && !env.OAUTH.DISCORD.BOT_TOKEN)) {
      return {
        status: 'delivered',
        messageId: `discord_sim_${Date.now()}`,
        channelId: channelId || 'default-channel',
        content: messageContent,
        mode: 'sandbox_simulation',
      };
    }

    switch (action) {
      case 'post_message':
      case 'send_webhook': {
        const webhookUrl = credentials.webhookUrl || credentials.metadata?.webhookUrl;
        if (webhookUrl) {
          const res = await axios.post(webhookUrl, {
            content: messageContent,
            embeds: embeds.length > 0 ? embeds : undefined,
          });
          return { status: 'delivered', response: res.data };
        }

        const botToken = credentials.botToken || env.OAUTH.DISCORD.BOT_TOKEN;
        const targetChannel = channelId || credentials.metadata?.channelId;
        if (!botToken || !targetChannel) {
          throw new Error('Discord requires botToken and channelId or a Webhook URL');
        }

        const res = await axios.post(
          `https://discord.com/api/v10/channels/${targetChannel}/messages`,
          {
            content: messageContent,
            embeds: embeds.length > 0 ? embeds : undefined,
          },
          { headers: { Authorization: `Bot ${botToken}` } }
        );

        return { status: 'delivered', messageId: res.data.id, channelId: res.data.channel_id };
      }

      default:
        throw new Error(`Unsupported Discord action: ${action}`);
    }
  }
}

module.exports = new DiscordIntegration();
