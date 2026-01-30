import { randomBytes } from "crypto";
import { createHash } from "crypto";

export function generateApiKey(): string {
  const bytes = randomBytes(32);
  return bytes.toString("base64url");
}

export function hashApiKey(plaintextKey: string): string {
  const pepper = process.env.API_KEY_PEPPER || "";
  const combined = plaintextKey + pepper;
  return createHash("sha256").update(combined).digest("hex");
}

export function verifyApiKey(plaintextKey: string, storedHash: string): boolean {
  const computedHash = hashApiKey(plaintextKey);
  return constantTimeCompare(computedHash, storedHash);
}

function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

