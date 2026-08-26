const crypto = require('crypto');
const env = require('../config/env');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 128 bits
const AUTH_TAG_LENGTH = 16; // 128 bits

// Derive a 32-byte key from CREDENTIAL_ENCRYPTION_KEY
const getKey = () => {
  const secret = env.CREDENTIAL_ENCRYPTION_KEY || 'default_32_bytes_secret_key_1234567890';
  return crypto.createHash('sha256').update(String(secret)).digest();
};

/**
 * Encrypt plain text using AES-256-GCM
 * @param {string} text 
 * @returns {string} iv:authTag:encryptedContent in hex
 */
const encrypt = (text) => {
  if (!text) return null;
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
};

/**
 * Decrypt ciphertext encrypted with encrypt()
 * @param {string} encryptedPayload 
 * @returns {string} decrypted plain text
 */
const decrypt = (encryptedPayload) => {
  if (!encryptedPayload) return null;
  try {
    const parts = encryptedPayload.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted payload format');
    }
    const [ivHex, authTagHex, encryptedText] = parts;
    const key = getKey();
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('[Encryption] Decryption failed:', error.message);
    throw new Error('CREDENTIAL_DECRYPTION_FAILED');
  }
};

module.exports = { encrypt, decrypt };
