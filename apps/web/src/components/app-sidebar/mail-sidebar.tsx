"use client";

import * as React from "react";
import { BrandHeader } from "@/components/branding/brand-header";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Search02Icon,
  Settings01Icon,
  QuillWrite02Icon,
  InboxIcon,
  Sent02Icon,
  LicenseDraftIcon,
  MailRemove02Icon,
} from "@hugeicons/core-free-icons";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

// Navigation data
const data = {
  topButtons: [
    {
      title: "Compose",
      url: "#",
    },
    {
      title: "Search",
      url: "#",
    },
    {
      title: "Settings",
      url: "#",
    },
  ],
  sections: [
    {
      title: "General",
      items: [
        {
          title: "Inbox",
          url: "/mail/inbox",
          icon: InboxIcon,
        },
        {
          title: "Sent",
          url: "#",
          icon: Sent02Icon,
        },
        {
          title: "Drafts",
          url: "#",
          icon: LicenseDraftIcon,
        },
        {
          title: "Spam",
          url: "#",
          icon: MailRemove02Icon,
        },
      ],
    },
  ],
};

interface MailSidebarProps extends React.ComponentProps<typeof Sidebar> {
  onOpenSearch: () => void;
  onOpenSettings: () => void;
}

export function MailSidebar({ onOpenSearch, onOpenSettings, ...props }: MailSidebarProps) {
  return (
    <Sidebar {...props}>
      <SidebarHeader className="border-b h-14 flex flex-row items-center px-4">
        <BrandHeader size="md" />
      </SidebarHeader>
      <SidebarContent>
        {/* Top buttons without section */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.topButtons.map((button) => (
                <SidebarMenuItem key={button.title}>
                  {button.title === "Search" ? (
                    <SidebarMenuButton onClick={onOpenSearch}>
                      <HugeiconsIcon icon={Search02Icon} strokeWidth={2.2} />
                      {button.title}
                      <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                        <span className="text-xs">⌘</span>K
                      </kbd>
                    </SidebarMenuButton>
                  ) : button.title === "Settings" ? (
                    <SidebarMenuButton onClick={onOpenSettings}>
                      <HugeiconsIcon icon={Settings01Icon} strokeWidth={2.2} />
                      {button.title}
                    </SidebarMenuButton>
                  ) : (
                    <SidebarMenuButton asChild>
                      <a href={button.url}>
                        {button.title === "Compose" && (
                          <HugeiconsIcon icon={QuillWrite02Icon} strokeWidth={2.2} />
                        )}
                        {button.title}
                      </a>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Sections with labels */}
        {data.sections.map((section) => (
          <SidebarGroup key={section.title}>
            <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        {item.icon && <HugeiconsIcon icon={item.icon} strokeWidth={2.2} />}
                        {item.title}
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
