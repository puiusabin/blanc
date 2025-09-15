"use client";

import React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Disable static generation for this page since it uses client-side authentication
export const dynamic = "force-dynamic";
import { useWagmiAuth } from "@/hooks/use-wagmi-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/navbar";
import { Copy, Eye, EyeOff, Key, Shield, Mail } from "lucide-react";

export default function MailPage() {
  const { isAuthenticated, userKeys, isLoading } = useWagmiAuth();
  const router = useRouter();
  const [showPrivateKeys, setShowPrivateKeys] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Redirect to /auth if not authenticated (but only after loading is complete)
  useEffect(() => {
    console.log("📧 Mail page: Auth state check", {
      isLoading,
      isAuthenticated,
      hasUserKeys: !!userKeys,
    });

    if (!isLoading && !isAuthenticated) {
      console.log(
        "📧 Mail page: Not authenticated after loading complete, redirecting to /auth",
      );
      router.push("/auth");
    }
  }, [isLoading, isAuthenticated, userKeys, router]);

  const copyToClipboard = async (text: string, keyType: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(keyType);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20">
          <div className="flex items-center justify-center space-y-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">
                Checking authentication...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Don't render anything while redirecting (but loading is complete)
  if (!isAuthenticated || !userKeys) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20">
          <div className="flex items-center justify-center">
            <p className="text-muted-foreground">
              Redirecting to authentication...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Mail className="size-8 text-primary" />
              <h1 className="text-3xl font-bold">Blanc Mail</h1>
            </div>
            <p className="text-muted-foreground">
              Your encrypted email interface with zero-knowledge encryption
            </p>
            <Badge variant="secondary" className="text-sm">
              🔐 End-to-End Encrypted
            </Badge>
          </div>

          {/* Encryption Keys Section */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Encryption Key Pair */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="size-5" />
                  Encryption Key Pair
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Public Key</label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(
                          userKeys.encryptionKeyPair.publicKey,
                          "encryption-public",
                        )
                      }
                    >
                      <Copy className="size-4" />
                    </Button>
                  </div>
                  <div className="relative">
                    <code className="block text-xs bg-muted p-3 rounded-md break-all font-mono">
                      {userKeys.encryptionKeyPair.publicKey}
                    </code>
                    {copiedKey === "encryption-public" && (
                      <div className="absolute top-1 right-1 bg-green-500 text-white text-xs px-2 py-1 rounded">
                        Copied!
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Private Key</label>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPrivateKeys(!showPrivateKeys)}
                      >
                        {showPrivateKeys ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </Button>
                      {showPrivateKeys && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(
                              userKeys.encryptionKeyPair.privateKey,
                              "encryption-private",
                            )
                          }
                        >
                          <Copy className="size-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="relative">
                    <code className="block text-xs bg-muted p-3 rounded-md break-all font-mono">
                      {showPrivateKeys
                        ? userKeys.encryptionKeyPair.privateKey
                        : "•".repeat(64)}
                    </code>
                    {copiedKey === "encryption-private" && (
                      <div className="absolute top-1 right-1 bg-green-500 text-white text-xs px-2 py-1 rounded">
                        Copied!
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Signing Key Pair */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="size-5" />
                  Signing Key Pair
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Public Key</label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(
                          userKeys.signingKeyPair.publicKey,
                          "signing-public",
                        )
                      }
                    >
                      <Copy className="size-4" />
                    </Button>
                  </div>
                  <div className="relative">
                    <code className="block text-xs bg-muted p-3 rounded-md break-all font-mono">
                      {userKeys.signingKeyPair.publicKey}
                    </code>
                    {copiedKey === "signing-public" && (
                      <div className="absolute top-1 right-1 bg-green-500 text-white text-xs px-2 py-1 rounded">
                        Copied!
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Private Key</label>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPrivateKeys(!showPrivateKeys)}
                      >
                        {showPrivateKeys ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </Button>
                      {showPrivateKeys && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(
                              userKeys.signingKeyPair.privateKey,
                              "signing-private",
                            )
                          }
                        >
                          <Copy className="size-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="relative">
                    <code className="block text-xs bg-muted p-3 rounded-md break-all font-mono">
                      {showPrivateKeys
                        ? userKeys.signingKeyPair.privateKey
                        : "•".repeat(64)}
                    </code>
                    {copiedKey === "signing-private" && (
                      <div className="absolute top-1 right-1 bg-green-500 text-white text-xs px-2 py-1 rounded">
                        Copied!
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Security Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="size-5" />
                Security Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="size-2 bg-green-500 rounded-full"></div>
                  <span>Keys derived from wallet signature</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="size-2 bg-green-500 rounded-full"></div>
                  <span>XSalsa20-Poly1305 encryption</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="size-2 bg-green-500 rounded-full"></div>
                  <span>Ed25519 digital signatures</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="size-2 bg-green-500 rounded-full"></div>
                  <span>Zero-knowledge architecture</span>
                </div>
              </div>
              <div className="pt-3 border-t">
                <p className="text-xs text-muted-foreground">
                  ⚠️ <strong>Important:</strong> These keys are
                  deterministically generated from your wallet signature. Keep
                  your wallet secure as it controls access to your encryption
                  keys and encrypted data.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Mail Interface Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="size-5" />
                Mail Interface
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Mail className="size-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">
                  Mail Interface Coming Soon
                </h3>
                <p className="text-sm max-w-md mx-auto">
                  The encrypted email interface is under development. Your
                  encryption keys are ready and waiting!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
