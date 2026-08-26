const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  MONGODB_URI: process.env.MONGODB_URI || '',
  REDIS_URL: process.env.REDIS_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || 'agentflow_jwt_secret_dev_key_super_secure_987654321',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CREDENTIAL_ENCRYPTION_KEY: process.env.CREDENTIAL_ENCRYPTION_KEY || 'e83921bf7a8e90c4871e23f9901d84a1e83921bf7a8e90c4871e23f9901d84a1',
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || '',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  OAUTH: {
    GMAIL: {
      CLIENT_ID: process.env.GMAIL_CLIENT_ID || '',
      CLIENT_SECRET: process.env.GMAIL_CLIENT_SECRET || '',
      REDIRECT_URI: process.env.GMAIL_REDIRECT_URI || 'http://localhost:5000/api/integrations/oauth/gmail/callback',
    },
    SLACK: {
      CLIENT_ID: process.env.SLACK_CLIENT_ID || '',
      CLIENT_SECRET: process.env.SLACK_CLIENT_SECRET || '',
      REDIRECT_URI: process.env.SLACK_REDIRECT_URI || 'http://localhost:5000/api/integrations/oauth/slack/callback',
    },
    DISCORD: {
      CLIENT_ID: process.env.DISCORD_CLIENT_ID || '',
      CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET || '',
      REDIRECT_URI: process.env.DISCORD_REDIRECT_URI || 'http://localhost:5000/api/integrations/oauth/discord/callback',
      BOT_TOKEN: process.env.DISCORD_BOT_TOKEN || '',
    },
    GOOGLE_SHEETS: {
      CLIENT_ID: process.env.GOOGLE_SHEETS_CLIENT_ID || '',
      CLIENT_SECRET: process.env.GOOGLE_SHEETS_CLIENT_SECRET || '',
      REDIRECT_URI: process.env.GOOGLE_SHEETS_REDIRECT_URI || 'http://localhost:5000/api/integrations/oauth/google-sheets/callback',
    },
  },
};

module.exports = env;
