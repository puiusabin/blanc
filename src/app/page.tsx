import { ConnectWalletButton } from "@/components/simplekit";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
      <div className="relative flex min-h-screen flex-col">
        {/* Header with logo */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <Image
            src="/blancicow.svg"
            alt="blanc logo"
            width={24}
            height={24}
            className="hidden dark:block"
          />
          <Image
            src="/blancicob.svg"
            alt="blanc logo"
            width={24}
            height={24}
            className="dark:hidden"
          />
          <span className="font-semibold text-xl">blanc</span>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </header>

        {/* Main content */}
        <div className="relative flex flex-1 flex-col items-center justify-center p-3.5">
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
      </div>
  );
}