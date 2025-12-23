import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

declare const process: { env: { DATABASE_URL?: string } };

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Create postgres connection
const client = postgres(process.env.DATABASE_URL);

// Create drizzle instance with schema
export const db = drizzle(client, { schema });
