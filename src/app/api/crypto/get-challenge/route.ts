import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { walletAddress?: string };
    const { walletAddress } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    // Get or create secure random challenge for this wallet
    // This challenge is separate from SIWE auth and never expires
    // Used for consistent key derivation across sessions
    let challengeRecord = await prisma.keyDerivationChallenge.findUnique({
      where: { walletAddress },
    });

    if (!challengeRecord) {
      // Generate completely random challenge string - 64 bytes (512 bits) for maximum security
      // The challenge is purely random and contains no predictable information
      const challenge = randomBytes(64).toString("hex");

      challengeRecord = await prisma.keyDerivationChallenge.create({
        data: {
          challenge,
          walletAddress,
        },
      });
    }

    return NextResponse.json({ challenge: challengeRecord.challenge });
  } catch (error) {
    console.error("Get challenge error:", error);
    return NextResponse.json(
      { error: "Failed to get challenge" },
      { status: 500 }
    );
  }
}
