import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

const SetupKeysSchema = z.object({
  encryptedPrivateKeys: z.string(),
  encryptionNonce: z.string(),
  masterKeySalt: z.string(),
  encryptionKeySalt: z.string(),
  encryptionPublicKey: z.string(),
  signingPublicKey: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in first' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validatedData = SetupKeysSchema.parse(body);

    const existingKeys = await prisma.userEncryptedKeys.findUnique({
      where: { userId: session.user.id },
    });

    if (existingKeys) {
      return NextResponse.json(
        { error: 'Encryption keys already set up for this user' },
        { status: 400 }
      );
    }

    const encryptedKeys = await prisma.userEncryptedKeys.create({
      data: {
        userId: session.user.id,
        ...validatedData,
      },
    });

    return NextResponse.json({
      success: true,
      publicKeys: {
        encryptionPublicKey: encryptedKeys.encryptionPublicKey,
        signingPublicKey: encryptedKeys.signingPublicKey,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data format', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Setup keys error:', error);
    return NextResponse.json(
      { error: 'Failed to setup encryption keys' },
      { status: 500 }
    );
  }
}