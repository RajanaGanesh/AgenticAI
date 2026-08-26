const mongoose = require('mongoose');
const Integration = require('../models/Integration');
const { encrypt, decrypt } = require('../utils/encryption');
const memoryStore = require('../utils/memoryStore');
const gmailIntegration = require('../integrations/gmailIntegration');
const slackIntegration = require('../integrations/slackIntegration');
const discordIntegration = require('../integrations/discordIntegration');
const googleSheetsIntegration = require('../integrations/googleSheetsIntegration');

const PROVIDERS = {
  gmail: gmailIntegration,
  slack: slackIntegration,
  discord: discordIntegration,
  'google-sheets': googleSheetsIntegration,
};

class IntegrationService {
  isMongooseActive() {
    return mongoose.connection.readyState === 1;
  }

  getProviderHandler(provider) {
    const handler = PROVIDERS[provider];
    if (!handler) {
      throw new Error(`Unsupported integration provider: ${provider}`);
    }
    return handler;
  }

  async getUserIntegrations(userId) {
    let records = [];
    if (this.isMongooseActive()) {
      records = await Integration.find({ owner: userId });
    } else {
      records = await memoryStore.getIntegrations(userId);
    }

    const allProviders = ['gmail', 'slack', 'discord', 'google-sheets', 'openrouter', 'gemini'];
    return allProviders.map((p) => {
      const found = records.find((r) => r.provider === p);
      return {
        provider: p,
        isConnected: found ? found.isConnected : false,
        metadata: found?.metadata || {},
        scopes: found?.scopes || [],
        expiresAt: found?.expiresAt || null,
        lastTestedAt: found?.lastTestedAt || null,
        updatedAt: found?.updatedAt || null,
      };
    });
  }

  async getIntegrationStatus(userId) {
    const integrations = await this.getUserIntegrations(userId);
    const health = {};

    for (const item of integrations) {
      if (['openrouter', 'gemini'].includes(item.provider)) {
        health[item.provider] = {
          connected: item.isConnected,
          status: item.isConnected ? 'READY' : 'NOT_CONFIGURED',
        };
      } else {
        const handler = PROVIDERS[item.provider];
        if (handler && item.isConnected) {
          try {
            const creds = await this.getDecryptedCredentials(userId, item.provider);
            const testResult = await handler.testConnection(creds);
            health[item.provider] = {
              connected: testResult.connected,
              status: testResult.connected ? 'ACTIVE' : (testResult.error || 'ERROR'),
              details: testResult,
            };
          } catch (err) {
            health[item.provider] = { connected: false, status: 'AUTH_EXPIRED', error: err.message };
          }
        } else {
          health[item.provider] = { connected: false, status: 'NOT_CONNECTED' };
        }
      }
    }

    return health;
  }

  async getAuthUrl(provider, userId) {
    const handler = this.getProviderHandler(provider);
    const state = Buffer.from(JSON.stringify({ userId, provider, timestamp: Date.now() })).toString('base64');
    return handler.getAuthUrl(state);
  }

  async handleOAuthCallback(provider, code, state) {
    let userId = null;
    try {
      if (state) {
        const parsed = JSON.parse(Buffer.from(state, 'base64').toString('utf8'));
        userId = parsed.userId;
      }
    } catch (e) {
      // state parse fallback
    }

    if (!userId) {
      throw new Error('Invalid OAuth state: Missing user context');
    }

    const handler = this.getProviderHandler(provider);
    const tokenData = await handler.handleCallback(code);

    const updateDoc = {
      isConnected: true,
      encryptedAccessToken: tokenData.accessToken ? encrypt(tokenData.accessToken) : null,
      encryptedRefreshToken: tokenData.refreshToken ? encrypt(tokenData.refreshToken) : null,
      scopes: tokenData.scopes || [],
      metadata: tokenData.metadata || {},
      expiresAt: tokenData.expiresAt || null,
      lastTestedAt: new Date(),
    };

    if (this.isMongooseActive()) {
      const doc = await Integration.findOneAndUpdate(
        { owner: userId, provider },
        updateDoc,
        { upsert: true, new: true }
      );
      return { provider, isConnected: doc.isConnected, metadata: doc.metadata };
    } else {
      const doc = await memoryStore.upsertIntegration(userId, provider, updateDoc);
      return { provider, isConnected: doc.isConnected, metadata: doc.metadata };
    }
  }

  async saveManualCredentials(userId, { provider, apiKey, accessToken, botToken, webhookUrl, metadata = {} }) {
    const updateDoc = {
      isConnected: true,
      metadata: { ...metadata, webhookUrl: webhookUrl || metadata.webhookUrl || '' },
      lastTestedAt: new Date(),
    };

    if (apiKey) updateDoc.encryptedApiKey = encrypt(apiKey);
    if (accessToken) updateDoc.encryptedAccessToken = encrypt(accessToken);
    if (botToken) updateDoc.encryptedRefreshToken = encrypt(botToken);

    if (this.isMongooseActive()) {
      const doc = await Integration.findOneAndUpdate(
        { owner: userId, provider },
        updateDoc,
        { upsert: true, new: true }
      );
      return { provider: doc.provider, isConnected: doc.isConnected, metadata: doc.metadata };
    } else {
      const doc = await memoryStore.upsertIntegration(userId, provider, updateDoc);
      return { provider: doc.provider, isConnected: doc.isConnected, metadata: doc.metadata };
    }
  }

  async getDecryptedCredentials(userId, provider) {
    let doc = null;
    if (this.isMongooseActive()) {
      doc = await Integration.findOne({ owner: userId, provider });
    } else {
      doc = await memoryStore.getIntegration(userId, provider);
    }

    if (!doc || !doc.isConnected) {
      return null;
    }

    return {
      accessToken: doc.encryptedAccessToken ? decrypt(doc.encryptedAccessToken) : null,
      refreshToken: doc.encryptedRefreshToken ? decrypt(doc.encryptedRefreshToken) : null,
      apiKey: doc.encryptedApiKey ? decrypt(doc.encryptedApiKey) : null,
      botToken: doc.encryptedRefreshToken ? decrypt(doc.encryptedRefreshToken) : null,
      webhookUrl: doc.metadata?.webhookUrl || null,
      metadata: doc.metadata || {},
      scopes: doc.scopes || [],
    };
  }

  async disconnectIntegration(userId, provider) {
    if (this.isMongooseActive()) {
      await Integration.findOneAndDelete({ owner: userId, provider });
    } else {
      await memoryStore.removeIntegration(userId, provider);
    }
    return { provider, isConnected: false };
  }
}

module.exports = new IntegrationService();
