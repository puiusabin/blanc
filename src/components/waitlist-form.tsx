"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, Loader2 } from "lucide-react";
import { useJoinWaitlist } from "@/hooks/api/use-waitlist";

interface WaitlistFormProps {
  className?: string;
}

export function WaitlistForm({ className }: WaitlistFormProps) {
  const [email, setEmail] = useState("");
  const joinWaitlistMutation = useJoinWaitlist();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    joinWaitlistMutation.mutate(
      { email },
      {
        onSuccess: () => {
          setEmail("");
        },
      },
    );
  };

  if (joinWaitlistMutation.isSuccess) {
    return (
      <div
        className={`flex items-center justify-center gap-2 text-green-600 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg py-3 px-4 ${className}`}
      >
        <CheckCircle className="h-5 w-5" />
        <span className="font-medium">You&apos;re on the waitlist!</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={joinWaitlistMutation.isPending}
            className="w-full bg-background/50 backdrop-blur-sm border-border/50 focus:border-blue-500/50 transition-colors h-12"
          />
          {joinWaitlistMutation.error && (
            <p className="text-sm text-red-600 mt-1">
              {joinWaitlistMutation.error.message}
            </p>
          )}
        </div>
        <Button
          type="submit"
          disabled={joinWaitlistMutation.isPending || !email.trim()}
          className="whitespace-nowrap bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          size="lg"
        >
          {joinWaitlistMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Joining...
            </>
          ) : (
            "Join Waitlist"
          )}
        </Button>
      </div>
    </form>
  );
}
