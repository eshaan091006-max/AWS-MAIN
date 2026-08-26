#!/usr/bin/env node
/**
 * Creates or updates an admin account.
 *
 *   npm run admin:create -- <username> <password> ["Display Name"]
 *
 * The password is hashed locally and only the digest is sent to Supabase, so a
 * plaintext password never reaches the database, the network, or .env.
 */
import { readFileSync } from "fs";
import { randomBytes, scrypt } from "crypto";
import { promisify } from "util";
import { createClient } from "@supabase/supabase-js";

const scryptAsync = promisify(scrypt);

const MIN_PASSWORD_LENGTH = 10;
const USERNAME_RE = /^[a-z0-9_-]{3,32}$/;

function loadEnv() {
  // Read .env.local directly: this runs outside Next, which normally loads it.
  const env = {};
  try {
    for (const line of readFileSync(".env.local", "utf8").split("\n")) {
      const match = line.match(/^([A-Z_]+)\s*=\s*"?([^"]*)"?\s*$/);
      if (match) env[match[1]] = match[2];
    }
  } catch {
    fail("Could not read .env.local. Run this from the project root.");
  }
  return env;
}

function fail(message) {
  console.error(`\n  ✖ ${message}\n`);
  process.exit(1);
}

const [username, password, displayName] = process.argv.slice(2);

if (!username || !password) {
  fail('Usage: npm run admin:create -- <username> <password> ["Display Name"]');
}
if (!USERNAME_RE.test(username)) {
  fail("Username must be 3-32 characters, lowercase letters, digits, dash or underscore only.");
}
if (password.length < MIN_PASSWORD_LENGTH) {
  fail(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
}

const env = loadEnv();
const url = env.SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  fail("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local.");
}

const salt = randomBytes(16).toString("hex");
const derived = await scryptAsync(password, salt, 64);
const passwordHash = `scrypt:${salt}:${derived.toString("hex")}`;

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { error } = await supabase.from("admin_users").upsert(
  {
    username,
    password_hash: passwordHash,
    display_name: displayName || username,
    is_active: true,
  },
  { onConflict: "username" }
);

if (error) {
  if (error.code === "42P01") {
    fail("The admin_users table does not exist. Run supabase/schema.sql first.");
  }
  fail(`Supabase rejected the write: ${error.message}`);
}

console.log(`\n  ✔ Admin account ready: ${username}`);
console.log("    Sign in at /admin/login\n");
