"use client"

import * as React from "react"

import Image from "next/image"
import {
  SquarePen,
  Search,
  Settings,
  User,
  CreditCard,
  Palette,
  AtSign,
  Shield,
  Globe,
  Import,
  Bell,
  FileSignature,
  Inbox,
  Send,
  FilePenLine,
  MailWarning,
  XIcon,
  Plus
} from 'lucide-react'

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
} from "@/components/ui/sidebar"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"

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
          url: "#",
          icon: Inbox,
        },
        {
          title: "Sent",
          url: "#",
          icon: Send,
        },
        {
          title: "Drafts",
          url: "#",
          icon: FilePenLine,
        },
        {
          title: "Spam",
          url: "#",
          icon: MailWarning,
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [searchOpen, setSearchOpen] = React.useState(false)
  const [settingsOpen, setSettingsOpen] = React.useState(false)

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setSearchOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

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
            <div className="flex h-16 shrink-0 border-b relative">
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
                <Plus className="size-7 text-muted-foreground absolute right-0" style={{ bottom: '20%', transform: 'translate(50%, 50%)' }} />
              </div>

            {/* Settings Sidebar - styled like main sidebar */}
            <div className="w-56 shrink-0 bg-sidebar border-r flex flex-col">
              <div className="flex-1 overflow-auto p-2">
                {/* General Section */}
                <div className="mb-4">
                  <div className="px-2 py-1.5 text-xs font-medium text-sidebar-foreground/70 mb-1">
                    General
                  </div>
                  <div className="space-y-0.5">
                    <button className="w-full flex items-center gap-2 text-left px-2 py-1.5 text-sm rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
                      <User className="size-4" />
                      Account
                    </button>
                    <button className="w-full flex items-center gap-2 text-left px-2 py-1.5 text-sm rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
                      <CreditCard className="size-4" />
                      Plans
                    </button>
                    <button className="w-full flex items-center gap-2 text-left px-2 py-1.5 text-sm rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
                      <Palette className="size-4" />
                      Appearance
                    </button>
                    <button className="w-full flex items-center gap-2 text-left px-2 py-1.5 text-sm rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
                      <AtSign className="size-4" />
                      Aliases
                    </button>
                    <button className="w-full flex items-center gap-2 text-left px-2 py-1.5 text-sm rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
                      <Shield className="size-4" />
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
                      <Globe className="size-4" />
                      Custom domains
                    </button>
                    <button className="w-full flex items-center gap-2 text-left px-2 py-1.5 text-sm rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
                      <Import className="size-4" />
                      Import
                    </button>
                    <button className="w-full flex items-center gap-2 text-left px-2 py-1.5 text-sm rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
                      <Bell className="size-4" />
                      Notifications
                    </button>
                    <button className="w-full flex items-center gap-2 text-left px-2 py-1.5 text-sm rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
                      <FileSignature className="size-4" />
                      Signature
                    </button>
                  </div>
                </div>
              </div>
            </div>

              {/* Settings Content */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-auto p-6">
                  {/* Settings content will be added here later */}
                  <p className="text-sm text-muted-foreground">Settings functionality coming soon...</p>
                </div>
              </div>

              {/* Right border column */}
              <div className="w-16 shrink-0 border-l relative">
                {/* Plus sign on top-right side */}
                <Plus className="size-7 text-muted-foreground absolute left-0" style={{ top: '20%', transform: 'translate(-50%, -50%)' }} />
              </div>
            </div>

            {/* Bottom border row */}
            <div className="flex h-16 shrink-0 border-t relative">
              <div className="w-16 border-r relative" />
              <div className="flex-1" />
              <div className="w-16 border-l relative" />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Sidebar {...props}>
      <SidebarHeader className="border-b h-16 flex flex-row items-center px-4">
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
      </SidebarHeader>
      <SidebarContent>
        {/* Top buttons without section */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.topButtons.map((button) => (
                <SidebarMenuItem key={button.title}>
                  {button.title === "Search" ? (
                    <SidebarMenuButton onClick={() => setSearchOpen(true)}>
                      <Search />
                      {button.title}
                      <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                        <span className="text-xs">⌘</span>K
                      </kbd>
                    </SidebarMenuButton>
                  ) : button.title === "Settings" ? (
                    <SidebarMenuButton onClick={() => setSettingsOpen(true)}>
                      <Settings />
                      {button.title}
                    </SidebarMenuButton>
                  ) : (
                    <SidebarMenuButton asChild>
                      <a href={button.url}>
                        {button.title === "Compose" && <SquarePen />}
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
                        {item.icon && <item.icon />}
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
    </>
  )
}
