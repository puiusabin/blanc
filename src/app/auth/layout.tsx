import { Providers } from "@/components/providers";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Providers>{children}</Providers>;
}
