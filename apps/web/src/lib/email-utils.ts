import type { Email } from "@/types/email";

export interface GroupedEmails {
  today: Email[];
  yesterday: Email[];
  thisWeek: Email[];
  older: Email[];
}

export type TimePeriod = keyof GroupedEmails;

export const TIME_PERIOD_LABELS: Record<TimePeriod, string> = {
  today: "today",
  yesterday: "yesterday",
  thisWeek: "this week",
  older: "older",
};

export function groupEmailsByTimePeriod(emails: Email[]): GroupedEmails {
  const now = Date.now();
  const groups: GroupedEmails = {
    today: [],
    yesterday: [],
    thisWeek: [],
    older: [],
  };

  emails.forEach((email) => {
    const timestamp = new Date(email.timestamp).getTime();
    const diff = now - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      groups.today.push(email);
    } else if (days === 1) {
      groups.yesterday.push(email);
    } else if (days <= 7) {
      groups.thisWeek.push(email);
    } else {
      groups.older.push(email);
    }
  });

  return groups;
}
