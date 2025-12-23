"use client";

import { useAuth } from "@/hooks/use-auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { userId, isLoading, error } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Initializing session...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-destructive">
          Auth error: {error.message}
          <br />
          <span className="text-sm text-muted-foreground">
            Check console for details or see apps/web/SETUP.md
          </span>
        </div>
      </div>
    );
  }

  if (!userId) {
    return null;
  }

  return <>{children}</>;
}
