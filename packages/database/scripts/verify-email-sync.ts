import { config } from "dotenv";
import { resolve } from "path";
import { db, emails, threads } from "../src";

config({ path: resolve(__dirname, "../../../.env") });

async function verifyEmailSync() {
  console.log("🔍 Verifying email data synchronization...\n");

  try {
    // Check threads
    const allThreads = await db.select().from(threads);
    console.log(`📬 Threads in database: ${allThreads.length}`);

    if (allThreads.length > 0) {
      console.log("\nThread details:");
      allThreads.slice(0, 5).forEach((thread) => {
        console.log(`  - ${thread.id}: "${thread.subject}" (${thread.messageCount} messages)`);
      });
    }

    // Check emails
    const allEmails = await db.select().from(emails);
    console.log(`\n📧 Emails in database: ${allEmails.length}`);

    if (allEmails.length > 0) {
      console.log("\nEmail details:");
      allEmails.slice(0, 5).forEach((email) => {
        console.log(`  - ${email.id}`);
        console.log(`    Thread: ${email.threadId}`);
        console.log(`    R2 Path: ${email.r2DatagramPath}`);
        console.log(`    Date: ${email.dateReceived}`);
        console.log("");
      });

      console.log("\n⚠️  Note: R2 paths should follow format:");
      console.log("   {userId}/YYYY/MM/{emailId}.json.gz");
      console.log("\n   Example:");
      console.log("   4af3cbff-f8fa-4736-965a-bca85939d86c/2025/12/5e49979d-ba52-49b6-a456-bc349f36c44e.json.gz");
    }

    if (allThreads.length === 0 && allEmails.length === 0) {
      console.log("\n✅ Database is clean! Ready to receive fresh emails.");
      console.log("\nNext steps:");
      console.log("1. Ensure Haraka is running: cd services/haraka && npm run dev");
      console.log("2. Send test email to testuser@blanc.is");
      console.log("3. Refresh web app to see the email");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error verifying sync:", error);
    process.exit(1);
  }
}

verifyEmailSync();
