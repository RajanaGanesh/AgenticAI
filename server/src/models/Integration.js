const mongoose = require('mongoose');

const integrationSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    provider: {
      type: String,
      enum: ['gmail', 'slack', 'discord', 'google-sheets', 'openrouter', 'gemini'],
      required: true,
    },
    isConnected: {
      type: Boolean,
      default: false,
    },
    scopes: {
      type: [String],
      default: [],
    },
    encryptedAccessToken: {
      type: String,
      default: null,
    },
    encryptedRefreshToken: {
      type: String,
      default: null,
    },
    encryptedApiKey: {
      type: String,
      default: null,
    },
    metadata: {
      accountEmail: { type: String, default: '' },
      teamName: { type: String, default: '' },
      botUsername: { type: String, default: '' },
      channelId: { type: String, default: '' },
      webhookUrl: { type: String, default: '' },
      customConfig: { type: mongoose.Schema.Types.Mixed, default: {} },
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    lastTestedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

integrationSchema.index({ owner: 1, provider: 1 }, { unique: true });

module.exports = mongoose.model('Integration', integrationSchema);
