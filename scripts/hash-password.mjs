#!/usr/bin/env node
/**
 * Prints a password hash for pasting into a SQL INSERT.
 *
 *   npm run admin:hash
 *
 * Reads the password from stdin rather than argv so it never lands in shell
 * history, and prints only the digest — the plaintext is never written
 * anywhere. Output format matches lib/password.ts: scrypt:<saltHex>:<hashHex>
 */
import { randomBytes, scrypt } from "crypto";
import { promisify } from "util";
import { createInterface } from "readline";

const scryptAsync = promisify(scrypt);
const MIN_PASSWORD_LENGTH = 10;

function ask(question) {
  const rl = createInterface({ input: process.stdin, output: process.stderr });
  return new Promise((resolve) => rl.question(question, (answer) => { rl.close(); resolve(answer); }));
}

const password = (await ask("Password (min 10 chars): ")).trim();

if (password.length < MIN_PASSWORD_LENGTH) {
  console.error(`\n  ✖ Password must be at least ${MIN_PASSWORD_LENGTH} characters.\n`);
  process.exit(1);
}

const salt = randomBytes(16).toString("hex");
const derived = await scryptAsync(password, salt, 64);

console.log(`scrypt:${salt}:${derived.toString("hex")}`);
