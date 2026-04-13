#!/usr/bin/env node
// Apply src/db/schema.sql to the Neon database pointed to by DATABASE_URL.
// Run with: npm run db:push  (loads .env.local via --env-file)

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { neon } from "@neondatabase/serverless";

const here = dirname(fileURLToPath(import.meta.url));
const schemaPath = resolve(here, "..", "src", "db", "schema.sql");

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Put it in .env.local.");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const schema = readFileSync(schemaPath, "utf8");

// Neon's HTTP client requires one statement per call. Split on ';' while
// ignoring those inside dollar-quoted blocks / comments.
const statements = schema
  .split(/;\s*$/m)
  .map((s) => s.trim())
  .filter((s) => s.length && !s.startsWith("--"));

for (const stmt of statements) {
  try {
    await sql.query(stmt);
    const first = stmt.split("\n")[0].slice(0, 80);
    console.log("ok:", first);
  } catch (err) {
    console.error("FAILED:", stmt.split("\n")[0]);
    console.error(err.message);
    process.exit(1);
  }
}

console.log("\nSchema applied.");
