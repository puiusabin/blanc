"use client";

import { CustomWalletConnect } from '@/components/wallet-connect';

// Disable static generation for this page
export const dynamic = 'force-dynamic';

export default function AuthPage() {
  return <CustomWalletConnect />;
}