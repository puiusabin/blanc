import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@blanc/database";
import AWS from "aws-sdk";
import { gunzipSync } from "zlib";
import type { R2EmailDatagram } from "@/types/r2-datagram";

const s3 = new AWS.S3({
  endpoint: process.env.R2_ENDPOINT,
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  region: "auto",
  signatureVersion: "v4",
  s3ForcePathStyle: true,
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME || "mail-storage";

export async function POST(request: NextRequest) {
  try {
    // Validate R2 credentials
    const requiredEnvVars = {
      R2_ENDPOINT: process.env.R2_ENDPOINT,
      R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
      R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
      R2_BUCKET_NAME: process.env.R2_BUCKET_NAME,
    };

    const missing = Object.entries(requiredEnvVars)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missing.length > 0) {
      console.error("Missing R2 environment variables:", missing);
      return NextResponse.json(
        { error: `Missing R2 credentials: ${missing.join(", ")}` },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { emailIds } = body as { emailIds: string[] };

    if (!emailIds || !Array.isArray(emailIds) || emailIds.length === 0) {
      return NextResponse.json({ error: "emailIds array is required" }, { status: 400 });
    }

    const emails = await prisma.email.findMany({
      where: { id: { in: emailIds } },
      select: { id: true, r2DatagramPath: true },
    });

    if (emails.length === 0) {
      return NextResponse.json({ error: "No emails found with provided IDs" }, { status: 404 });
    }

    const results = await Promise.allSettled(
      emails.map(async (email) => {
        console.log("[R2] Fetching:", {
          bucket: BUCKET_NAME,
          key: email.r2DatagramPath,
          emailId: email.id,
        });

        const response = await s3
          .getObject({
            Bucket: BUCKET_NAME,
            Key: email.r2DatagramPath,
          })
          .promise();

        if (!response.Body) {
          throw new Error(`No body in R2 response for ${email.id}`);
        }

        const buffer = Buffer.isBuffer(response.Body)
          ? response.Body
          : Buffer.from(response.Body as string);

        const decompressed = gunzipSync(buffer);

        const datagram = JSON.parse(decompressed.toString("utf-8")) as R2EmailDatagram;

        return { id: email.id, datagram };
      })
    );

    const datagrams: Record<string, R2EmailDatagram> = {};
    const errors: Array<{ emailId: string; error: string }> = [];

    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        datagrams[result.value.id] = result.value.datagram;
      } else {
        const email = emails[index];
        errors.push({ emailId: email.id, error: result.reason.message });
        console.error(`Error fetching datagram for email ${email.id}:`, result.reason);
      }
    });

    return NextResponse.json({
      emails: datagrams,
      errors: errors.length > 0 ? errors : undefined,
      stats: {
        total: emails.length,
        success: Object.keys(datagrams).length,
        failed: errors.length,
      },
    });
  } catch (error) {
    console.error("Error fetching batch content:", error);
    return NextResponse.json({ error: "Failed to fetch batch content" }, { status: 500 });
  }
}
