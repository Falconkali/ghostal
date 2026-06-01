import crypto from "crypto";
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "";
// Helper to get a stable 32-byte key from the environment
function getKey(): Buffer {
  if (!ENCRYPTION_KEY) {
    // Graceful fallback for local development if ENCRYPTION_KEY is somehow omitted
    const fallbackSeed = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "ghostflow-fallback-salt";
    return crypto.scryptSync(fallbackSeed, "ghostflow-salt-key-derivation", 32);
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
  
  try {
    const iv = crypto.randomBytes(12);
    const key = getKey();
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
    
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    
    const authTag = cipher.getAuthTag().toString("hex");
    
    return `${iv.toString("hex")}:${authTag.toString()}:${encrypted}`;
  } catch (err) {
    console.error("Token encryption failed:", err);
    throw new Error("Failed to encrypt token");
  }
}
/**
 * Decrypts a cipher string in the format `ivHex:authTagHex:encryptedHex`.
 * Automatically falls back to returning the input if it's plaintext.
 */
export function decrypt(encryptedText: string): string {
  if (!encryptedText) return "";
  
  const parts = encryptedText.split(":");
  if (parts.length !== 3) {
    // Not in expected encrypted format. Treat as legacy plaintext token.
    return encryptedText;
  }
  
  try {
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
  } catch (err) {
    // If decryption fails (e.g. key mismatch), log warning and return original as fallback
    console.warn("Token decryption failed; returning value directly as fallback:", err);
    return encryptedText;
  }
}
