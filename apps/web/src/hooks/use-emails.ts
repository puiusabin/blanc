import { useMemo } from "react"
import type { Email, EmailFolder } from "@/types/email"
import { getMockEmailsByFolder } from "@/lib/mock-emails"

export interface UseEmailsOptions {
  folder: EmailFolder
  search?: string
  isRead?: boolean
}

export interface UseEmailsResult {
  emails: Email[]
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

/**
 * Hook to fetch and manage emails
 * Currently uses mock data, but structured for easy TanStack Query migration
 *
 * @example
 * const { emails, isLoading } = useEmails({ folder: 'inbox' })
 */
export function useEmails({ folder, search, isRead }: UseEmailsOptions): UseEmailsResult {
  // TODO: Replace with TanStack Query when API is ready
  // return useQuery({
  //   queryKey: ['emails', folder, search, isRead],
  //   queryFn: () => fetchEmails({ folder, search, isRead }),
  // })

  const emails = useMemo(() => {
    let filtered = getMockEmailsByFolder(folder)

    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(
        (email) =>
          email.subject.toLowerCase().includes(searchLower) ||
          email.from.name.toLowerCase().includes(searchLower) ||
          email.bodyText.toLowerCase().includes(searchLower)
      )
    }

    if (isRead !== undefined) {
      filtered = filtered.filter((email) => email.isRead === isRead)
    }

    return filtered
  }, [folder, search, isRead])

  return {
    emails,
    isLoading: false,
    error: null,
    refetch: () => {
      // TODO: Implement refetch when using TanStack Query
      console.log("Refetch emails")
    },
  }
}
