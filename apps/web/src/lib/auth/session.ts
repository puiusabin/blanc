import { getIronSession, IronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  userId: string;
  issuedAt: number;
  expiresAt: number;
}

const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: "blanc_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  },
};

export async function getSession(): Promise<IronSession<SessionData>> {
  return await getIronSession<SessionData>(await cookies(), sessionOptions);
}

export async function createSession(userId: string): Promise<void> {
  const session = await getSession();
  const now = Date.now();

  session.userId = userId;
  session.issuedAt = now;
  session.expiresAt = now + 7 * 24 * 60 * 60 * 1000;

  await session.save();
}

export async function destroySession(): Promise<void> {
  const session = await getSession();
  session.destroy();
}

export async function validateSession(): Promise<string | null> {
  const session = await getSession();

  if (!session.userId || !session.expiresAt) {
    return null;
  }

  if (Date.now() > session.expiresAt) {
    await session.destroy();
    return null;
  }

  return session.userId;
}
