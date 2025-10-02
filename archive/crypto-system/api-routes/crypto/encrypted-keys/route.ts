import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const encryptedKeys = await prisma.userEncryptedKeys.findUnique({
      where: { userId: session.user.id },
    });

    if (!encryptedKeys) {
      return NextResponse.json(
        { error: 'Encryption keys not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      encryptedPrivateKeys: encryptedKeys.encryptedPrivateKeys,
      encryptionNonce: encryptedKeys.encryptionNonce,
      masterKeySalt: encryptedKeys.masterKeySalt,
      encryptionKeySalt: encryptedKeys.encryptionKeySalt,
      publicKeys: {
        encryptionPublicKey: encryptedKeys.encryptionPublicKey,
        signingPublicKey: encryptedKeys.signingPublicKey,
      },
    });
  } catch (error) {
    console.error('Get encrypted keys error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve encrypted keys' },
      { status: 500 }
    );
  }
}