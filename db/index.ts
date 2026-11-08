import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

/**
 * ==============================================================================
 * CineSphere OS - Database Connection Client (Neon PostgreSQL + Drizzle ORM)
 * Fully typed, connection-pooled serverless database instance
 * ==============================================================================
 */

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:password@localhost:5432/cinesphere_db?sslmode=require";

// Initialize Neon HTTP query driver
const sql = neon(connectionString);

// Initialize Drizzle ORM with full relational schema
export const db = drizzle(sql, { schema });

// Export schema barrel and types
export * from "./schema";
export * from "./types";
export * from "./helpers/tenant";
export * from "./helpers/audit";
