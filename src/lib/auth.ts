import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";
import { siwe } from "better-auth/plugins";
import { generateRandomString } from "better-auth/crypto";
import { verifyMessage } from "@wagmi/core";
import { wagmiConfig } from "./wagmi";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: false,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days in seconds
    updateAge: 60 * 60 * 24, // Update session every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes cache
    },
  },
  cookies: {
    sessionToken: {
      name: "better-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      },
    },
    csrfToken: {
      name: "better-auth.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax", 
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24, // 24 hours
      },
    },
  },
  csrf: {
    enabled: true,
    protection: "csrf",
  },
  rateLimit: {
    enabled: true,
    window: 60, // 1 minute window
    max: 100, // Max 100 requests per window
  },
  plugins: [
    // In auth.ts, ensure your SIWE config matches:
    siwe({
      domain: process.env.NEXT_PUBLIC_APP_URL?.replace(/https?:\/\//, '') || "localhost:3000",
      getNonce: async () => {
        return generateRandomString(32);
      },
      verifyMessage: async ({ message, signature, address }) => {
        try {
          console.log({ message, signature, address });
          const isValid = await verifyMessage(wagmiConfig, {
            address: address as `0x${string}`,
            message,
            signature: signature as `0x${string}`,
          });
          console.log("Verification result:", isValid);
          return isValid;
        } catch (error) {
          console.error("SIWE verification failed:", error);
          return false;
        }
      },
    }),
  ],
});
