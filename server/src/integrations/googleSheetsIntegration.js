const axios = require('axios');
const BaseIntegration = require('./baseIntegration');
const env = require('../config/env');

class GoogleSheetsIntegration extends BaseIntegration {
  constructor() {
    super('google-sheets');
  }

  getAuthUrl(state) {
    const clientId = env.OAUTH.GOOGLE_SHEETS.CLIENT_ID;
    const redirectUri = encodeURIComponent(env.OAUTH.GOOGLE_SHEETS.REDIRECT_URI);
    const scopes = encodeURIComponent('https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file');
    return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scopes}&access_type=offline&prompt=consent&state=${state || ''}`;
  }

  async handleCallback(code) {
    try {
      const response = await axios.post('https://oauth2.googleapis.com/token', {
        code,
        client_id: env.OAUTH.GOOGLE_SHEETS.CLIENT_ID,
        client_secret: env.OAUTH.GOOGLE_SHEETS.CLIENT_SECRET,
        redirect_uri: env.OAUTH.GOOGLE_SHEETS.REDIRECT_URI,
        grant_type: 'authorization_code',
      });

      const { access_token, refresh_token, expires_in } = response.data;
      return {
        accessToken: access_token,
        refreshToken: refresh_token || null,
        expiresAt: new Date(Date.now() + expires_in * 1000),
        scopes: ['spreadsheets', 'drive.file'],
      };
    } catch (error) {
      throw new Error(`Google Sheets OAuth failed: ${error.response?.data?.error_description || error.message}`);
    }
  }

  async testConnection(credentials) {
    if (!credentials || !credentials.accessToken) {
      return { connected: false, error: 'INTEGRATION_NOT_CONNECTED' };
    }

    try {
      // Test with Drive API about endpoint
      const res = await axios.get('https://www.googleapis.com/drive/v3/about?fields=user', {
        headers: { Authorization: `Bearer ${credentials.accessToken}` },
        timeout: 5000,
      });
      return { connected: true, accountEmail: res.data.user?.emailAddress };
    } catch (err) {
      if (credentials.isDemo || credentials.accessToken === 'demo_token') {
        return { connected: true, accountEmail: 'operator-sheets@agentflow.ai', isDemo: true };
      }
      const classified = this.classifyError(err);
      return { connected: false, error: classified.code, details: classified.message };
    }
  }

  async executeAction(action, params, credentials, context = {}) {
    if (!credentials || (!credentials.accessToken && !credentials.apiKey && !credentials.isDemo)) {
      const err = new Error('Google Sheets integration is not connected');
      err.code = 'INTEGRATION_NOT_CONNECTED';
      throw err;
    }

    const { spreadsheetId = 'default_sheet_101', range = 'Sheet1!A:Z', values = [] } = params;

    if (credentials.isDemo || credentials.accessToken === 'demo_token' || !env.OAUTH.GOOGLE_SHEETS.CLIENT_ID) {
      if (action === 'append_row') {
        return {
          status: 'appended',
          spreadsheetId,
          updatedRange: `${range}10`,
          updatedRows: 1,
          updatedColumns: Array.isArray(values) ? values.length : 1,
          values: values || ['Lead Name', 'email@test.com', 'High Priority', new Date().toISOString()],
          mode: 'sandbox_simulation',
        };
      }
      if (action === 'read_range') {
        return {
          spreadsheetId,
          range,
          values: [
            ['Name', 'Email', 'Status', 'Date'],
            ['John Doe', 'john@acme.corp', 'Qualified', '2026-08-25'],
            ['Alice Smith', 'alice@innovate.tech', 'Pending Call', '2026-08-26'],
          ],
          mode: 'sandbox_simulation',
        };
      }
    }

    switch (action) {
      case 'append_row': {
        if (!spreadsheetId) throw new Error('Missing spreadsheetId');
        const rowData = Array.isArray(values[0]) ? values : [values];

        const res = await axios.post(
          `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`,
          { values: rowData },
          { headers: { Authorization: `Bearer ${credentials.accessToken}` } }
        );

        return {
          status: 'appended',
          spreadsheetId,
          updatedRange: res.data.updates?.updatedRange,
          updatedRows: res.data.updates?.updatedRows,
        };
      }

      case 'read_range': {
        if (!spreadsheetId) throw new Error('Missing spreadsheetId');
        const res = await axios.get(
          `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`,
          { headers: { Authorization: `Bearer ${credentials.accessToken}` } }
        );

        return {
          spreadsheetId,
          range: res.data.range,
          values: res.data.values || [],
        };
      }

      default:
        throw new Error(`Unsupported Google Sheets action: ${action}`);
    }
  }
}

module.exports = new GoogleSheetsIntegration();
