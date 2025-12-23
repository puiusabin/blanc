import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";
import * as path from "path";

// Load .env from monorepo root (two directories up from this file)
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL environment variable is required. " +
      "Make sure you have a .env file in the project root with DATABASE_URL set."
  );
}

export default {
  schema: "./src/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
} satisfies Config;
