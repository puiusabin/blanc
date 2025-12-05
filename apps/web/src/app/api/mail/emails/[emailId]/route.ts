import { NextRequest, NextResponse } from "next/server";
import { prisma, EmailFolder } from "@blanc/database";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ emailId: string }> }
) {
  try {
    const { emailId } = await params;
    const body = await request.json();
    const { isRead, isStarred, folder } = body as {
      isRead?: boolean;
      isStarred?: boolean;
      folder?: EmailFolder;
    };

    const updateData: any = {};
    if (isRead !== undefined) updateData.isRead = isRead;
    if (isStarred !== undefined) updateData.isStarred = isStarred;
    if (folder !== undefined) updateData.folder = folder;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const updatedEmail = await prisma.email.update({
      where: { id: emailId },
      data: updateData,
      select: {
        id: true,
        isRead: true,
        isStarred: true,
        folder: true,
      },
    });

    return NextResponse.json({
      success: true,
      email: updatedEmail,
    });
  } catch (error) {
    console.error("Error updating email:", error);
    return NextResponse.json({ error: "Failed to update email" }, { status: 500 });
  }
}
