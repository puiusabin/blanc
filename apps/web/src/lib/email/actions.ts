import { db } from "@/lib/db";
import type { EmailFolder } from "@/types/email";

async function updateEmailInApi(
  emailId: string,
  updates: { isRead?: boolean; isStarred?: boolean; folder?: EmailFolder }
): Promise<void> {
  const response = await fetch(`/api/mail/emails/${emailId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error(`Failed to update email: ${response.statusText}`);
  }
}

export async function markEmailAsRead(emailId: string, isRead: boolean): Promise<void> {
  const email = await db.emails.get(emailId);
  if (!email) {
    throw new Error(`Email ${emailId} not found in local cache`);
  }

  const previousState = email.isRead;

  try {
    await db.emails.update(emailId, { isRead });

    await updateEmailInApi(emailId, { isRead });
  } catch (error) {
    await db.emails.update(emailId, { isRead: previousState });
    throw error;
  }
}

export async function toggleEmailStar(emailId: string): Promise<void> {
  const email = await db.emails.get(emailId);
  if (!email) {
    throw new Error(`Email ${emailId} not found in local cache`);
  }

  const previousState = email.isStarred || false;
  const newState = !previousState;

  try {
    await db.emails.update(emailId, { isStarred: newState });

    await updateEmailInApi(emailId, { isStarred: newState });
  } catch (error) {
    await db.emails.update(emailId, { isStarred: previousState });
    throw error;
  }
}

export async function moveEmailToFolder(emailId: string, folder: EmailFolder): Promise<void> {
  const email = await db.emails.get(emailId);
  if (!email) {
    throw new Error(`Email ${emailId} not found in local cache`);
  }

  const previousFolder = email.folder;

  try {
    await db.emails.update(emailId, { folder });

    await updateEmailInApi(emailId, { folder });
  } catch (error) {
    await db.emails.update(emailId, { folder: previousFolder });
    throw error;
  }
}
