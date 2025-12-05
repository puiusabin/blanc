import { NextResponse } from "next/server";
import { prisma } from "@blanc/database";

const TEST_USER_EMAIL = "testuser@blanc.is";
const FREE_PLAN_QUOTA = BigInt(2 * 1024 * 1024 * 1024); // 2GB

export async function GET() {
  try {
    let user = await prisma.user.findUnique({
      where: { email: TEST_USER_EMAIL },
      select: {
        id: true,
        email: true,
        planType: true,
        quotaBytes: true,
        usedBytes: true,
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: TEST_USER_EMAIL,
          planType: "FREE",
          quotaBytes: FREE_PLAN_QUOTA,
          active: true,
        },
        select: {
          id: true,
          email: true,
          planType: true,
          quotaBytes: true,
          usedBytes: true,
        },
      });
    }

    return NextResponse.json({
      userId: user.id,
      email: user.email,
      planType: user.planType,
      quotaBytes: user.quotaBytes.toString(),
      usedBytes: user.usedBytes.toString(),
    });
  } catch (error) {
    console.error("Error getting/creating test user:", error);
    return NextResponse.json({ error: "Failed to get/create test user" }, { status: 500 });
  }
}
