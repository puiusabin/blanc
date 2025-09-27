"use client";

import { useMutation } from "@tanstack/react-query";

interface WaitlistData {
  email: string;
}

interface WaitlistResponse {
  message: string;
  id: string;
}

export function useJoinWaitlist() {
  return useMutation({
    mutationFn: async (data: WaitlistData): Promise<WaitlistResponse> => {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(errorData.error || "Failed to join waitlist");
      }

      return response.json();
    },
  });
}
