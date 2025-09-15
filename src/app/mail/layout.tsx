import { Providers } from "@/components/providers";

export default function MailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Providers>{children}</Providers>;
}
