import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { env } from '@libs/configs';

/**
 * Encrypts a given text using the provided key, IV, and encryption method.
 *
 * @param {string} text - Plain text to encrypt.
 * @param {string} secretKey - Secret key for encryption.
 * @param {string} secretIv - Initialization vector.
 * @param {string} [encryptionMethod=env.ENCRYPTION_METHOD] - Encryption
 *   algorithm (e.g., 'aes-256-cbc'). Default is `env.ENCRYPTION_METHOD`
 * @returns {string} Encrypted text in base64 format.
 */
function encrypt(
  text: string,
  secretKey: string,
  secretIv: string,
  encryptionMethod: string = env.ENCRYPTION_METHOD,
): string {
  console.log({
    text,
    secretKey,
    secretIv,
    encryptionMethod,
  });
  const key = crypto.createHash('sha256').update(secretKey).digest();
  const iv = crypto
    .createHash('sha256')
    .update(secretIv)
    .digest()
    .subarray(0, 16);
  const cipher = crypto.createCipheriv(encryptionMethod, key, iv);
  return Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]).toString(
    'base64',
  );
}

/**
 * Decrypts a given encrypted text using the provided key, IV, and encryption
 * method.
 *
 * @param {string} encryptedText - Encrypted text in base64 format.
 * @param {string} secretKey - Secret key for decryption.
 * @param {string} secretIv - Initialization vector.
 * @param {string} [encryptionMethod=env.ENCRYPTION_METHOD] - Encryption
 *   algorithm. Default is `env.ENCRYPTION_METHOD`
 * @returns {string} Decrypted plain text.
 */
function decrypt(
  encryptedText: string,
  secretKey: string,
  secretIv: string,
  encryptionMethod: string = env.ENCRYPTION_METHOD,
): string {
  console.log({
    encryptedText,
    secretKey,
    secretIv,
    encryptionMethod,
  });
  const key = crypto.createHash('sha256').update(secretKey).digest();
  const iv = crypto
    .createHash('sha256')
    .update(secretIv)
    .digest()
    .subarray(0, 16);
  const decipher = crypto.createDecipheriv(encryptionMethod, key, iv);
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedText, 'base64')),
    decipher.final(),
  ]).toString('utf8');
}

/**
 * This is used to hash string passed to it as argument,
 *
 * @param text - Text to hash
 * @param salt - Salt to use for hashing, defaults to `env.HASH_SALT`
 */
function hash(text: string, salt: number = env.HASH_SALT): string {
  return bcrypt.hashSync(text, bcrypt.genSaltSync(salt));
}

export default { encrypt, decrypt, hash };
