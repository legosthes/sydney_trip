// Stateless HMAC-signed auth tokens (Web Crypto, no dependencies).
// Token format: `${username}.${expiryEpochSeconds}.${hmacHex}`

const enc = new TextEncoder();

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function signToken(
  username: string,
  maxAgeSeconds: number,
  secret: string
): Promise<string> {
  const expiry = Math.floor(Date.now() / 1000) + maxAgeSeconds;
  const payload = `${username}.${expiry}`;
  const key = await hmacKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  const sigHex = [...new Uint8Array(sig)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${payload}.${sigHex}`;
}

/** Returns the username if the token is valid and unexpired, else null. */
export async function verifyToken(
  token: string,
  secret: string
): Promise<string | null> {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [username, expiryStr, sigHex] = parts;
  const expiry = Number(expiryStr);
  if (!Number.isFinite(expiry) || expiry * 1000 < Date.now()) return null;
  const sigBytes = sigHex.match(/.{2}/g)?.map((h) => parseInt(h, 16));
  if (!sigBytes || sigBytes.some(Number.isNaN)) return null;
  const key = await hmacKey(secret);
  // crypto.subtle.verify is constant-time
  const ok = await crypto.subtle.verify(
    "HMAC",
    key,
    new Uint8Array(sigBytes),
    enc.encode(`${username}.${expiry}`)
  );
  return ok ? username : null;
}
