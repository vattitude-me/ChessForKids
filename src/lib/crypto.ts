const SALT = "chess-for-kids-pii-v1";

async function deriveKey(uid: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(uid),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: encoder.encode(SALT), iterations: 100000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptPii(value: string, uid: string): Promise<string> {
  if (!value) return "";
  const key = await deriveKey(uid);
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(value)
  );
  const combined = new Uint8Array(iv.length + new Uint8Array(encrypted).length);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);
  return btoa(String.fromCharCode(...combined));
}

export async function decryptPii(encoded: string, uid: string): Promise<string> {
  if (!encoded) return "";
  try {
    const key = await deriveKey(uid);
    const raw = Uint8Array.from(atob(encoded), c => c.charCodeAt(0));
    const iv = raw.slice(0, 12);
    const data = raw.slice(12);
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      data
    );
    return new TextDecoder().decode(decrypted);
  } catch {
    return encoded;
  }
}
