import { useState, useEffect, useMemo } from "react";
import type { Email, EmailFolder } from "@/types/email";
import { getMockEmailsByFolder } from "@/lib/mock-emails";

export type ReadStateMode = "alternating" | "all-read" | "all-unread" | "mixed";

export interface UseEmailsOptions {
  folder: EmailFolder;
  search?: string;
  isRead?: boolean;
  readStateMode?: ReadStateMode;
}

export interface UseEmailsResult {
  emails: Email[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook to fetch and manage emails
 * In development, loads from .eml files via /api/mock-emails
 * In production, uses hardcoded mock data (or real API when available)
 *
 * @example
 * const { emails, isLoading } = useEmails({ folder: 'inbox' })
 */
export function useEmails({
  folder,
  search,
  isRead,
  readStateMode,
}: UseEmailsOptions): UseEmailsResult {
  const [emails, setEmails] = useState<Email[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  useEffect(() => {
    const loadEmails = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (process.env.NODE_ENV === "development") {
          // Development: Load from .eml files
          const response = await fetch("/api/mock-emails");

          if (!response.ok) {
            throw new Error(`Failed to fetch emails: ${response.statusText}`);
          }

          const data = (await response.json()) as Email[];
          setEmails(data);
        } else {
          // Production: Use hardcoded mock data (replace with real API later)
          setEmails(getMockEmailsByFolder(folder));
        }
      } catch (err) {
        console.error("Failed to load emails:", err);
        setError(err instanceof Error ? err : new Error("Failed to load emails"));
        setEmails([]); // Show empty inbox on error
      } finally {
        setIsLoading(false);
      }
    };

    loadEmails();
  }, [folder, refetchTrigger]);

  // Filter emails based on search and isRead
  const filteredEmails = useMemo(() => {
    let filtered = emails;

    // Filter by folder
    filtered = filtered.filter((email) => email.folder === folder);

    // Apply read state mode if specified
    if (readStateMode && readStateMode !== "mixed") {
      filtered = filtered.map((email, index) => ({
        ...email,
        isRead:
          readStateMode === "all-read"
            ? true
            : readStateMode === "all-unread"
              ? false
              : index % 2 === 0, // alternating
      }));
    }

    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (email) =>
          email.subject.toLowerCase().includes(searchLower) ||
          email.from.name.toLowerCase().includes(searchLower) ||
          email.bodyText.toLowerCase().includes(searchLower)
      );
    }

    // Filter by isRead
    if (isRead !== undefined) {
      filtered = filtered.filter((email) => email.isRead === isRead);
    }

    return filtered;
  }, [emails, folder, search, isRead, readStateMode]);

  const refetch = () => {
    setRefetchTrigger((prev) => prev + 1);
  };

  return {
    emails: filteredEmails,
    isLoading,
    error,
    refetch,
  };
}
