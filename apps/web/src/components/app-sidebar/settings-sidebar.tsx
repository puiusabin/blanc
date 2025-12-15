"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserIcon,
  CreditCardIcon,
  PaintBoardIcon,
  AtIcon,
  SquareLock02Icon,
  EarthIcon,
  DownloadSquare01Icon,
  Notification01Icon,
  SignatureIcon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

interface SettingsSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function SettingsSidebar({ activeTab, onTabChange }: SettingsSidebarProps) {
  return (
    <div className="w-56 shrink-0 bg-sidebar border-r flex flex-col">
      <div className="flex-1 overflow-auto p-2">
        {/* General Section */}
        <div className="mb-4">
          <div className="px-2 py-1.5 text-xs font-medium text-sidebar-foreground/70 mb-1">
            General
          </div>
          <div className="space-y-0.5">
            <button className="w-full flex items-center gap-2 text-left px-2 py-1.5 text-sm rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
              <HugeiconsIcon icon={UserIcon} strokeWidth={2.2} className="size-4" />
              Account
            </button>
            <button className="w-full flex items-center gap-2 text-left px-2 py-1.5 text-sm rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
              <HugeiconsIcon icon={CreditCardIcon} strokeWidth={2.2} className="size-4" />
              Plans
            </button>
            <button
              onClick={() => onTabChange("appearance")}
              className={cn(
                "w-full flex items-center gap-2 text-left px-2 py-1.5 text-sm rounded-md transition-colors",
                activeTab === "appearance"
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <HugeiconsIcon icon={PaintBoardIcon} strokeWidth={2.2} className="size-4" />
              Appearance
            </button>
            <button className="w-full flex items-center gap-2 text-left px-2 py-1.5 text-sm rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
              <HugeiconsIcon icon={AtIcon} strokeWidth={2.2} className="size-4" />
              Aliases
            </button>
            <button className="w-full flex items-center gap-2 text-left px-2 py-1.5 text-sm rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
              <HugeiconsIcon icon={SquareLock02Icon} strokeWidth={2.2} className="size-4" />
              Security
            </button>
          </div>
        </div>

        {/* Blanc Mail Section */}
        <div>
          <div className="px-2 py-1.5 text-xs font-medium text-sidebar-foreground/70 mb-1">
            Blanc Mail
          </div>
          <div className="space-y-0.5">
            <button className="w-full flex items-center gap-2 text-left px-2 py-1.5 text-sm rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
              <HugeiconsIcon icon={EarthIcon} strokeWidth={2.2} className="size-4" />
              Custom domains
            </button>
            <button className="w-full flex items-center gap-2 text-left px-2 py-1.5 text-sm rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
              <HugeiconsIcon icon={DownloadSquare01Icon} strokeWidth={2.2} className="size-4" />
              Import
            </button>
            <button className="w-full flex items-center gap-2 text-left px-2 py-1.5 text-sm rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
              <HugeiconsIcon icon={Notification01Icon} strokeWidth={2.2} className="size-4" />
              Notifications
            </button>
            <button className="w-full flex items-center gap-2 text-left px-2 py-1.5 text-sm rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
              <HugeiconsIcon icon={SignatureIcon} strokeWidth={2.2} className="size-4" />
              Signature
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
