"use client";

import { useTheme } from "next-themes";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";

const lightThemes = [
  {
    value: "blanc-light",
    label: "Blanc Light",
    colors: ["#ffffff", "#000000", "#0066cc", "#6b7280"],
  },
  {
    value: "catppuccin-latte",
    label: "Catppuccin Latte",
    colors: ["#eff1f5", "#1e66f5", "#acb0be", "#d20f39"],
  },
  {
    value: "gruvbox-light",
    label: "Gruvbox Light",
    colors: ["#fbf1c7", "#282828", "#076678", "#af3a03"],
  },
  {
    value: "tokyo-night-day",
    label: "Tokyo Night Day",
    colors: ["#e1e2e7", "#3760bf", "#2e7de9", "#007197"],
  },
  {
    value: "vesper-light",
    label: "Vesper Light",
    colors: ["#FFFFFF", "#101010", "#FF8C42", "#00D4AA"],
  },
] as const;

const darkThemes = [
  {
    value: "blanc-dark",
    label: "Blanc Dark",
    colors: ["#000000", "#ffffff", "#0066cc", "#6b7280"],
  },
  {
    value: "catppuccin-frappe",
    label: "Catppuccin Frappé",
    colors: ["#303446", "#8caaee", "#626880", "#e78284"],
  },
  {
    value: "catppuccin-macchiato",
    label: "Catppuccin Macchiato",
    colors: ["#24273a", "#8aadf4", "#5b6078", "#ed8796"],
  },
  {
    value: "catppuccin-mocha",
    label: "Catppuccin Mocha",
    colors: ["#1e1e2e", "#89b4fa", "#585b70", "#f38ba8"],
  },
  {
    value: "gruvbox-dark",
    label: "Gruvbox Dark",
    colors: ["#282828", "#fbf1c7", "#83a598", "#fe8019"],
  },
  {
    value: "tokyo-night-storm",
    label: "Tokyo Night Storm",
    colors: ["#24283b", "#a9b1d6", "#7aa2f7", "#7dcfff"],
  },
  {
    value: "tokyo-night-night",
    label: "Tokyo Night Night",
    colors: ["#1a1b26", "#a9b1d6", "#7aa2f7", "#f7768e"],
  },
  {
    value: "tokyo-night-moon",
    label: "Tokyo Night Moon",
    colors: ["#222436", "#c8d3f5", "#82aaff", "#c099ff"],
  },
  {
    value: "vesper-dark",
    label: "Vesper Dark",
    colors: ["#101010", "#FFFFFF", "#FFC799", "#99FFE4"],
  },
] as const;

export function Appearance() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Required for hydration safety
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Theme</label>
          <Select disabled>
            <SelectTrigger className="w-full max-w-xs">
              <SelectValue placeholder="Loading..." />
            </SelectTrigger>
          </Select>
        </div>
      </div>
    );
  }

  const allThemes = [...lightThemes, ...darkThemes];
  const currentTheme = theme || "blanc-light";
  const currentLabel = allThemes.find((t) => t.value === currentTheme)?.label || "Theme";

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Theme</label>
        <p className="text-xs text-muted-foreground mb-2">Select your preferred color theme</p>
        <Select value={currentTheme} onValueChange={setTheme} open={open} onOpenChange={setOpen}>
          <SelectTrigger className="w-full max-w-xs">
            <SelectValue placeholder={currentLabel} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Light Themes</SelectLabel>
              {lightThemes.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {t.colors.map((color, i) => (
                        <div
                          key={i}
                          className="size-3 rounded-sm border border-border/50"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <span>{t.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
            <SelectGroup>
              <SelectLabel>Dark Themes</SelectLabel>
              {darkThemes.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {t.colors.map((color, i) => (
                        <div
                          key={i}
                          className="size-3 rounded-sm border border-border/50"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <span>{t.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
