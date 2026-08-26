const axios = require('axios');
const BaseIntegration = require('./baseIntegration');
const env = require('../config/env');

class GmailIntegration extends BaseIntegration {
  constructor() {
    super('gmail');
  }

  getAuthUrl(state) {
    const clientId = env.OAUTH.GMAIL.CLIENT_ID;
    const redirectUri = encodeURIComponent(env.OAUTH.GMAIL.REDIRECT_URI);
    const scopes = encodeURIComponent('https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly');
    return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scopes}&access_type=offline&prompt=consent&state=${state || ''}`;
  }

  async handleCallback(code) {
    try {
      const response = await axios.post('https://oauth2.googleapis.com/token', {
        code,
        client_id: env.OAUTH.GMAIL.CLIENT_ID,
        client_secret: env.OAUTH.GMAIL.CLIENT_SECRET,
        redirect_uri: env.OAUTH.GMAIL.REDIRECT_URI,
        grant_type: 'authorization_code',
      });

      const { access_token, refresh_token, expires_in } = response.data;
      
      // Fetch user profile info
      let accountEmail = 'operator@agentflow.ai';
      try {
        const profileRes = await axios.get('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
          headers: { Authorization: `Bearer ${access_token}` },
        });
        accountEmail = profileRes.data.emailAddress || accountEmail;
      } catch (pErr) {
        // Fallback email
      }

      return {
        accessToken: access_token,
        refreshToken: refresh_token || null,
        expiresAt: new Date(Date.now() + expires_in * 1000),
        metadata: { accountEmail },
        scopes: ['gmail.send', 'gmail.readonly'],
      };
    } catch (error) {
      throw new Error(`Gmail OAuth exchange failed: ${error.response?.data?.error_description || error.message}`);
    }
  }

  async testConnection(credentials) {
    if (!credentials || !credentials.accessToken) {
      return { connected: false, error: 'INTEGRATION_NOT_CONNECTED' };
    }

    try {
      const res = await axios.get('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
        headers: { Authorization: `Bearer ${credentials.accessToken}` },
        timeout: 5000,
      });
      return { connected: true, accountEmail: res.data.emailAddress };
    } catch (err) {
      if (credentials.accessToken === 'demo_token' || credentials.isDemo) {
        return { connected: true, accountEmail: 'demo-operator@gmail.com', isDemo: true };
      }
      const classified = this.classifyError(err);
      return { connected: false, error: classified.code, details: classified.message };
    }
  }

  async executeAction(action, params, credentials, context = {}) {
    if (!credentials || (!credentials.accessToken && !credentials.apiKey && !credentials.isDemo)) {
      const err = new Error('Gmail integration is not connected');
      err.code = 'INTEGRATION_NOT_CONNECTED';
      throw err;
    }

    const { to, subject, body, query = 'is:unread', maxResults = 5 } = params;

    // Support simulation/demo credentials for offline local sandbox mode
    if (credentials.isDemo || credentials.accessToken === 'demo_token' || !env.OAUTH.GMAIL.CLIENT_ID) {
      if (action === 'send_email') {
        return {
          status: 'sent',
          messageId: `gmail_sim_${Date.now()}`,
          to: to || 'operator@example.com',
          subject: subject || 'Agentflow Automation Notification',
          bodySnippet: (body || '').substring(0, 100),
          deliveredAt: new Date().toISOString(),
          mode: 'sandbox_simulation',
        };
      }
      if (action === 'read_emails') {
        return {
          messages: [
            {
              id: 'msg_sim_101',
              threadId: 'thread_sim_01',
              from: 'lead@enterprise.com',
              subject: 'Urgent: High Priority Enterprise Inquiry',
              snippet: 'Hello, we would like to schedule an automated demo for 500 seats.',
              date: new Date().toISOString(),
            },
            {
              id: 'msg_sim_102',
              threadId: 'thread_sim_02',
              from: 'billing@vendor.io',
              subject: 'Invoice #84920 for Monthly Cloud Infrastructure',
              snippet: 'Please find attached the invoice for services rendered in August.',
              date: new Date().toISOString(),
            },
          ],
          count: 2,
          mode: 'sandbox_simulation',
        };
      }
    }

    // Live execution
    switch (action) {
      case 'send_email': {
        if (!to) throw new Error('Missing required parameter: "to" address');
        const utf8Subject = `=?utf-8?B?${Buffer.from(subject || '').toString('base64')}?=`;
        const messageParts = [
          `To: ${to}`,
          'Content-Type: text/html; charset=utf-8',
          'MIME-Version: 1.0',
          `Subject: ${utf8Subject}`,
          '',
          body || '',
        ];
        const message = messageParts.join('\n');
        const encodedMessage = Buffer.from(message)
          .toString('base64')
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '');

        const res = await axios.post(
          'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
          { raw: encodedMessage },
          { headers: { Authorization: `Bearer ${credentials.accessToken}` } }
        );

        return { status: 'sent', messageId: res.data.id, threadId: res.data.threadId, to, subject };
      }

      case 'read_emails': {
        const listRes = await axios.get('https://gmail.googleapis.com/gmail/v1/users/me/messages', {
          headers: { Authorization: `Bearer ${credentials.accessToken}` },
          params: { q: query, maxResults },
        });

        const messages = listRes.data.messages || [];
        const detailedMessages = await Promise.all(
          messages.slice(0, 5).map(async (m) => {
            const msgRes = await axios.get(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}`, {
              headers: { Authorization: `Bearer ${credentials.accessToken}` },
            });
            return {
              id: m.id,
              threadId: m.threadId,
              snippet: msgRes.data.snippet,
              headers: msgRes.data.payload?.headers || [],
            };
          })
        );

        return { count: detailedMessages.length, messages: detailedMessages };
      }

      default:
        throw new Error(`Unsupported Gmail action: ${action}`);
    }
  }
}

module.exports = new GmailIntegration();
