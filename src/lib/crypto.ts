import crypto from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "";

// Helper to get a stable 32-byte key from the environment
function getKey(): Buffer {
  if (!ENCRYPTION_KEY) {
    // Fail closed — never derive from public data
    throw new Error(
      "ENCRYPTION_KEY environment variable is not configured. Token encryption/decryption is unavailable."
    );
  }

  if (ENCRYPTION_KEY.length === 64) {
    try {
      return Buffer.from(ENCRYPTION_KEY, "hex");
    } catch {
      // If parsing hex fails, fall back to scrypt derivation
    }
  }

  return crypto.scryptSync(ENCRYPTION_KEY, "ghostflow-salt-key-derivation", 32);
}

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * Returns the format `ivHex:authTagHex:encryptedHex`.
 */
export function encrypt(text: string): string {
  if (!text) return "";

  const iv = crypto.randomBytes(12);
  const key = getKey();
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag().toString("hex");

  return `${iv.toString("hex")}:${authTag.toString()}:${encrypted}`;
}

/**
 * Decrypts a cipher string in the format `ivHex:authTagHex:encryptedHex`.
 * Throws on decryption failure or if the input is not in the expected format.
 * This enforces that all tokens in the database are properly encrypted.
 */
export function decrypt(encryptedText: string): string {
  if (!encryptedText) return "";

  const parts = encryptedText.split(":");
  if (parts.length !== 3) {
    // Reject plaintext tokens — they must be re-encrypted before use.
    // If you have legacy plaintext tokens in the DB, run a one-time migration
    // to encrypt them with the encrypt() function before deploying.
    throw new Error(
      "[crypto] decrypt: input is not in encrypted format (ivHex:authTagHex:encryptedHex). " +
      "This token must be re-encrypted. Please run a migration or reconnect Instagram."
    );
  }

  const [ivHex, authTagHex, encryptedHex] = parts;
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const encrypted = Buffer.from(encryptedHex, "hex");
  const key = getKey();

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, undefined, "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
