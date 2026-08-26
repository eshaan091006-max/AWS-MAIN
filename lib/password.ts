import { randomBytes, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: string,
  keylen: number
) => Promise<Buffer>;

const SALT_BYTES = 16;
const KEY_BYTES = 64;
const SCHEME = "scrypt";

/**
 * Hashes an admin password for storage.
 *
 * scrypt rather than a plain SHA digest: it is deliberately slow and
 * memory-hard, so a stolen `admin_users` table cannot be run through a
 * dictionary at GPU speed. It ships with Node, so this costs no dependency.
 *
 * Format: `scrypt:<saltHex>:<hashHex>`. The salt is per-password and stored
 * alongside the digest, so two officers who pick the same password still get
 * different rows.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES).toString("hex");
  const derived = await scryptAsync(password, salt, KEY_BYTES);
  return `${SCHEME}:${salt}:${derived.toString("hex")}`;
}

/**
 * Checks a password against a stored hash.
 *
 * Returns false for anything malformed rather than throwing: this runs on the
 * login path, and a corrupt row should read as "wrong password", never as a
 * 500 that tells an attacker they found something interesting.
 */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  if (!stored) return false;

  const parts = stored.split(":");
  if (parts.length !== 3) return false;

  const [scheme, salt, expectedHex] = parts;
  if (scheme !== SCHEME) return false;
  if (!/^[0-9a-f]+$/.test(salt) || !/^[0-9a-f]+$/.test(expectedHex)) return false;

  const expected = Buffer.from(expectedHex, "hex");
  if (expected.length !== KEY_BYTES) return false;

  try {
    const derived = await scryptAsync(password, salt, KEY_BYTES);
    return timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}
