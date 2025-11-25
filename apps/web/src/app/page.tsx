import { ConnectWalletButton } from "@/components/walletkit";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { BrandHeader } from "@/components/brand-header";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Header with logo */}
      <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
        <BrandHeader size="md" />
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </header>

      {/* Main content */}
      <div className="relative flex flex-1 flex-col items-center justify-center p-3.5">
        <main className="flex flex-col items-center gap-y-9">
          <div className="flex items-center gap-3.5">
            <ConnectWalletButton />
            <Link href="https://github.com/vaunblu/SimpleKit" target="_blank">
              <Button variant="ghost" className="rounded-xl">
                GitHub &rarr;
              </Button>
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
