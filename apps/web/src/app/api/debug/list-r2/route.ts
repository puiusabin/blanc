import AWS from "aws-sdk";
import { NextResponse } from "next/server";

const s3 = new AWS.S3({
  endpoint: process.env.R2_ENDPOINT,
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  region: "auto",
  signatureVersion: "v4",
  s3ForcePathStyle: true,
});

export async function GET() {
  try {
    const result = await s3
      .listObjectsV2({
        Bucket: process.env.R2_BUCKET_NAME || "mail-storage",
        MaxKeys: 20,
      })
      .promise();

    return NextResponse.json({
      count: result.Contents?.length || 0,
      objects:
        result.Contents?.map((obj) => ({
          key: obj.Key,
          size: obj.Size,
          lastModified: obj.LastModified,
        })) || [],
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
      },
      { status: 500 }
    );
  }
}
