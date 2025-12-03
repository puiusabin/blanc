"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import type { SeparatorVariant } from "@/components/mail/email-list/email-list-item";
import type { ReadStateMode } from "@/hooks/use-emails";
import { Settings, ChevronDown, RotateCcw } from "lucide-react";

interface SeparatorSwitcherProps {
  currentSeparator: SeparatorVariant;
  currentReadMode: ReadStateMode;
  onSeparatorChange: (separator: SeparatorVariant) => void;
  onReadModeChange: () => void;
}

const separatorLabels: Record<SeparatorVariant, string> = {
  none: "No Separator (Clean)",
  bullet: "Bullet Separator (•)",
  "em-dash": "Em Dash Separator (—)",
  pipe: "Pipe Separator (|)",
};

const readModeLabels: Record<ReadStateMode, string> = {
  alternating: "Alternating",
  "all-read": "All Read",
  "all-unread": "All Unread",
  mixed: "Mixed",
};

export function SeparatorSwitcher({
  currentSeparator,
  currentReadMode,
  onSeparatorChange,
  onReadModeChange,
}: SeparatorSwitcherProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!isExpanded) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsExpanded(true)}
          className="shadow-lg hover:shadow-xl transition-shadow bg-background"
          title="Open Separator Dev Tools"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-[280px] shadow-lg border-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">Separator Dev Tools</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setIsExpanded(false)}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div className="space-y-3">
            <Label className="text-xs font-semibold text-muted-foreground">Separator Variant</Label>
            <RadioGroup value={currentSeparator} onValueChange={onSeparatorChange}>
              {(Object.entries(separatorLabels) as [SeparatorVariant, string][]).map(
                ([value, label]) => (
                  <div key={value} className="flex items-center space-x-2">
                    <RadioGroupItem value={value} id={value} className="h-3.5 w-3.5" />
                    <Label htmlFor={value} className="text-sm font-normal cursor-pointer">
                      {label}
                    </Label>
                  </div>
                )
              )}
            </RadioGroup>
          </div>

          <div className="border-t pt-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-muted-foreground">Read State</span>
              <span className="text-muted-foreground">{readModeLabels[currentReadMode]}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onReadModeChange}
              className="w-full text-xs h-8"
            >
              <RotateCcw className="h-3 w-3 mr-1.5" />
              Toggle Mode
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
