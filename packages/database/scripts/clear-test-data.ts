import { config } from "dotenv";
import { resolve } from "path";
import { db, emails, threads } from "../src";

// Load .env from project root
config({ path: resolve(__dirname, "../../../.env") });

async function clearTestData() {
  console.log("Clearing test email data...");

  try {
    // Delete all emails (will cascade due to foreign keys in some cases)
    const deletedEmails = await db.delete(emails);
    console.log(`✓ Deleted all emails from database`);

    // Delete all threads
    const deletedThreads = await db.delete(threads);
    console.log(`✓ Deleted all threads from database`);

    console.log("\n✅ Test data cleared successfully!");
    console.log("\nNext steps:");
    console.log("1. Clear IndexedDB in browser DevTools:");
    console.log("   Application → IndexedDB → BlancEmailDB → Delete database");
    console.log("2. Send a test email via Haraka to testuser@blanc.is");
    console.log("3. Refresh the web app to see the new email");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error clearing test data:", error);
    process.exit(1);
  }
}

clearTestData();
