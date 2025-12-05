import { NextRequest, NextResponse } from "next/server";
import { signImageUrl } from "@/lib/security/sign-image-url";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { urls } = (await req.json()) as { urls: string[] };

    if (!Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ error: "Invalid urls array" }, { status: 400 });
    }

    // Sign all URLs in parallel
    const signatures = await Promise.all(
      urls.map(async (url) => {
        const signature = await signImageUrl(url);
        return {
          url,
          signature,
          proxiedUrl: `/api/image-proxy?url=${encodeURIComponent(url)}&s=${signature}`,
        };
      })
    );

    return NextResponse.json({ signatures });
  } catch (error) {
    console.error("[Sign URLs API] Error:", error);
    return NextResponse.json({ error: "Failed to sign URLs" }, { status: 500 });
  }
}
