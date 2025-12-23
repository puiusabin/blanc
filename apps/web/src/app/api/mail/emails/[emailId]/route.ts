import { NextRequest, NextResponse } from "next/server";
import { db, emails, eq, emailFolderEnum } from "@blanc/database";
import { validateUUID, validateFolder } from "@/lib/api/validation";
import { APIError, handleAPIError } from "@/lib/api/error";

type EmailFolder = (typeof emailFolderEnum.enumValues)[number];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ emailId: string }> }
) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      throw new APIError(401, "Unauthorized");
    }

    const { emailId } = await params;

    if (!validateUUID(emailId)) {
      throw new APIError(400, "Invalid email ID format");
    }

    const body = await request.json();
    const { isRead, isStarred, folder } = body as {
      isRead?: boolean;
      isStarred?: boolean;
      folder?: EmailFolder;
    };

    const updateData: Record<string, unknown> = {};

    if (isRead !== undefined) {
      if (typeof isRead !== "boolean") {
        throw new APIError(400, "isRead must be boolean");
      }
      updateData.isRead = isRead;
    }

    if (isStarred !== undefined) {
      if (typeof isStarred !== "boolean") {
        throw new APIError(400, "isStarred must be boolean");
      }
      updateData.isStarred = isStarred;
    }

    if (folder !== undefined) {
      const validFolder = validateFolder(folder);
      updateData.folder = validFolder as EmailFolder;
    }

    if (Object.keys(updateData).length === 0) {
      throw new APIError(400, "No valid fields to update");
    }

    const email = await db.query.emails.findFirst({
      where: eq(emails.id, emailId),
      columns: { userId: true },
    });

    if (!email) {
      throw new APIError(404, "Email not found");
    }

    if (email.userId !== userId) {
      throw new APIError(403, "Forbidden");
    }

    const [updatedEmail] = await db
      .update(emails)
      .set(updateData)
      .where(eq(emails.id, emailId))
      .returning({
        id: emails.id,
        isRead: emails.isRead,
        isStarred: emails.isStarred,
        folder: emails.folder,
      });

    return NextResponse.json({
      success: true,
      email: updatedEmail,
    });
  } catch (error) {
    return handleAPIError(error);
  }
}
