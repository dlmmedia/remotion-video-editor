import { neon } from "@neondatabase/serverless";

/**
 * Returns a Neon SQL tagged template function.
 * Uses the DATABASE_URL environment variable.
 * Each call creates a one-shot HTTP query — no persistent connection pool needed.
 */
export function getDb() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL environment variable is not set. " +
        "Please add your Neon connection string to .env",
    );
  }
  return neon(databaseUrl);
}
