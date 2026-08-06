import crypto from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(crypto.scrypt);

// Password hashing with a per-user random salt (no external dependencies).
export async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = await scrypt(password, salt, 64);
  return `${salt}:${hash.toString("hex")}`;
}

export async function verifyPassword(password, stored) {
  const [salt, key] = String(stored || "").split(":");
  if (!salt || !key) return false;
  const hash = await scrypt(password, salt, 64);
  const a = Buffer.from(key, "hex");
  const b = Buffer.from(hash.toString("hex"), "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// Never leak the password hash to the client.
export function publicUser(user) {
  if (!user) return null;
  const { passwordHash, ...safe } = user;
  return safe;
}
