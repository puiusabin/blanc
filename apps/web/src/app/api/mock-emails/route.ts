import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { parseEml } from "@/lib/email/eml-parser";
import type { Email } from "@/types/email";

// Disable in production
if (process.env.NODE_ENV === "production") {
  throw new Error("mock-emails API route should not be included in production builds");
}

const MOCK_EMAILS_DIR = path.join(process.cwd(), "mock-emails");
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Cache parsed emails to avoid re-parsing on every request
let emailsCache: Email[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 5000; // 5 seconds

export async function GET(request: NextRequest) {
  try {
    // Return cached emails if still valid
    const now = Date.now();
    if (emailsCache && now - cacheTimestamp < CACHE_TTL) {
      return NextResponse.json(emailsCache);
    }

    // Check if mock-emails directory exists
    try {
      await fs.access(MOCK_EMAILS_DIR);
    } catch {
      // Directory doesn't exist - return empty array
      console.warn("mock-emails directory not found, returning empty array");
      emailsCache = [];
      cacheTimestamp = now;
      return NextResponse.json([]);
    }

    // Read all files in the directory
    const files = await fs.readdir(MOCK_EMAILS_DIR);

    // Filter for .eml files only
    const emlFiles = files.filter((file) => file.endsWith(".eml"));

    if (emlFiles.length === 0) {
      console.warn("No .eml files found in mock-emails directory");
      emailsCache = [];
      cacheTimestamp = now;
      return NextResponse.json([]);
    }

    // Parse each .eml file
    const emails: Email[] = [];
    for (const file of emlFiles) {
      try {
        const filePath = path.join(MOCK_EMAILS_DIR, file);

        // Check file size
        const stats = await fs.stat(filePath);
        if (stats.size > MAX_FILE_SIZE) {
          console.warn(`Skipping ${file}: file too large (${stats.size} bytes)`);
          continue;
        }

        // Read file content
        const content = await fs.readFile(filePath, "utf-8");

        // Parse EML
        const email = await parseEml(content);

        emails.push(email);
      } catch (error) {
        console.error(`Error parsing ${file}:`, error);
        // Skip invalid files
        continue;
      }
    }

    // Update cache
    emailsCache = emails;
    cacheTimestamp = now;

    return NextResponse.json(emails);
  } catch (error) {
    console.error("Error loading mock emails:", error);
    return NextResponse.json({ error: "Failed to load mock emails" }, { status: 500 });
  }
}
