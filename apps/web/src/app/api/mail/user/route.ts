import { NextResponse } from "next/server";
import { db, users, eq } from "@blanc/database";

const TEST_USER_EMAIL = "testuser@blanc.is";
const FREE_PLAN_QUOTA = BigInt(2 * 1024 * 1024 * 1024); // 2GB

export async function GET() {
  try {
    let user = await db.query.users.findFirst({
      where: eq(users.email, TEST_USER_EMAIL),
      columns: {
        id: true,
        email: true,
        planType: true,
        quotaBytes: true,
        usedBytes: true,
      },
    });

    if (!user) {
      const [newUser] = await db
        .insert(users)
        .values({
          email: TEST_USER_EMAIL,
          planType: "FREE",
          quotaBytes: FREE_PLAN_QUOTA,
          active: true,
        })
        .returning({
          id: users.id,
          email: users.email,
          planType: users.planType,
          quotaBytes: users.quotaBytes,
          usedBytes: users.usedBytes,
        });
      user = newUser;
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

    // Check for PostgreSQL errors
    if (error && typeof error === "object" && "code" in error) {
      const pgError = error as { code: string; message: string };

      // PostgreSQL error codes
      if (pgError.code === "42P01") {
        return NextResponse.json(
          {
            error: "Database tables not initialized",
            details: "Run: npm run db:push",
            code: pgError.code,
          },
          { status: 500 }
        );
      }
      if (pgError.code === "ECONNREFUSED" || pgError.code === "ETIMEDOUT") {
        return NextResponse.json(
          {
            error: "Cannot reach database server",
            details: "Check DATABASE_URL in .env",
            code: pgError.code,
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      {
        error: "Failed to get/create test user",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
