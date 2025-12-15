import "./globals.css";
import type { Metadata } from "next";
import { GeistMono } from "geist/font/mono";
import { headers } from "next/headers";
import { type ReactNode } from "react";
import { cookieToInitialState } from "wagmi";
import { Plus } from "lucide-react";

import { getConfig } from "@/lib/wagmi";
import { Web3Provider } from "@/components/wallet-kit/web3-provider";
import { ThemeProvider } from "@/components/theme/theme-provider";

export const metadata: Metadata = {
  title: "Blanc: Protect Your Inbox",
  description: "Protect Your Inbox",
};

export default async function RootLayout(props: { children: ReactNode }) {
  const initialState = cookieToInitialState(getConfig(), (await headers()).get("cookie"));
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={GeistMono.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="blanc-light"
          themes={[
            "blanc-light",
            "blanc-dark",
            "catppuccin-latte",
            "catppuccin-frappe",
            "catppuccin-macchiato",
            "catppuccin-mocha",
            "gruvbox-light",
            "gruvbox-dark",
            "tokyo-night-storm",
            "tokyo-night-night",
            "tokyo-night-moon",
            "tokyo-night-day",
            "vesper-dark",
            "vesper-light",
          ]}
          disableTransitionOnChange
        >
          <Web3Provider initialState={initialState}>
            <div className="flex flex-row min-h-screen overflow-hidden">
              {/* Left spacing column with border */}
              <div className="hidden lg:block w-16 border-r shrink-0 relative">
                <Plus
                  className="size-7 text-muted-foreground absolute right-0"
                  style={{ bottom: "20%", transform: "translate(50%, 50%)" }}
                />
              </div>

              {/* Main content */}
              <div className="flex-1 min-w-0 overflow-hidden">{props.children}</div>

              {/* Right spacing column with border */}
              <div className="hidden lg:block w-16 border-l shrink-0 relative">
                <Plus
                  className="size-7 text-muted-foreground absolute left-0"
                  style={{ top: "20%", transform: "translate(-50%, -50%)" }}
                />
              </div>
            </div>
          </Web3Provider>
        </ThemeProvider>
      </body>
    </html>
  );
}
