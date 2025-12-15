"use client";

import * as React from "react";
import { Plus, XIcon } from "lucide-react";
import { Sidebar } from "@/components/ui/sidebar";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Appearance } from "@/components/settings/appearance";
import { MailSidebar } from "./mail-sidebar";
import { SettingsSidebar } from "./settings-sidebar";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = React.useState<string>("appearance");

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem>Inbox</CommandItem>
            <CommandItem>Sent</CommandItem>
            <CommandItem>Drafts</CommandItem>
            <CommandItem>Spam</CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="w-[95vw] sm:w-11/12 md:w-4/5 lg:w-3/4 xl:w-2/3 sm:max-w-6xl h-[85vh] max-h-[700px] p-0 gap-0 [&>button]:hidden">
          <DialogTitle className="sr-only">Settings</DialogTitle>
          <div className="flex flex-col h-full min-w-0">
            {/* Top border row */}
            <div className="flex h-14 shrink-0 border-b relative">
              <div className="w-16 border-r relative" />
              <div className="flex-1" />
              <div className="w-16 border-l relative">
                <button
                  onClick={() => setSettingsOpen(false)}
                  className="absolute inset-0 flex items-center justify-center hover:bg-accent transition-colors"
                >
                  <XIcon className="size-4" />
                  <span className="sr-only">Close</span>
                </button>
              </div>
            </div>

            {/* Main content row */}
            <div className="flex flex-row flex-1 min-h-0">
              {/* Left border column */}
              <div className="w-16 shrink-0 border-r relative">
                {/* Plus sign on bottom-left side */}
                <Plus
                  className="size-7 text-muted-foreground absolute right-0"
                  style={{ bottom: "20%", transform: "translate(50%, 50%)" }}
                />
              </div>

              {/* Settings Sidebar */}
              <SettingsSidebar activeTab={activeSettingsTab} onTabChange={setActiveSettingsTab} />

              {/* Settings Content */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-auto p-6">
                  {activeSettingsTab === "appearance" && <Appearance />}
                  {activeSettingsTab !== "appearance" && (
                    <p className="text-sm text-muted-foreground">
                      {activeSettingsTab.charAt(0).toUpperCase() + activeSettingsTab.slice(1)}{" "}
                      settings coming soon...
                    </p>
                  )}
                </div>
              </div>

              {/* Right border column */}
              <div className="w-16 shrink-0 border-l relative">
                {/* Plus sign on top-right side */}
                <Plus
                  className="size-7 text-muted-foreground absolute left-0"
                  style={{ top: "20%", transform: "translate(-50%, -50%)" }}
                />
              </div>
            </div>

            {/* Bottom border row */}
            <div className="flex h-14 shrink-0 border-t relative">
              <div className="w-16 border-r relative" />
              <div className="flex-1" />
              <div className="w-16 border-l relative" />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <MailSidebar
        onOpenSearch={() => setSearchOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        {...props}
      />
    </>
  );
}
