import { ConnectWalletButton } from "@/components/simplekit";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";

export default function Home() {
  return (
      <div className="relative flex min-h-screen flex-col items-center justify-center p-3.5">
        <div className="fixed top-4 right-4">
          <ThemeToggle />
        </div>
        <main className="flex flex-col items-center gap-y-9">
          <div className="max-w-lg space-y-3.5 text-center">
            <h1 className="text-5xl font-semibold tracking-tight md:text-7xl">
              SimpleKit
            </h1>
            <p className="md:text-balance text-muted-foreground md:text-xl">
              Responsive connect wallet and account component built on top of
              Wagmi and shadcn/ui.
            </p>
          </div>
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
  );
}