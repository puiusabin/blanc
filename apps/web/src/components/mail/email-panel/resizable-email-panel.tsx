"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronsRight, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Kbd } from "@/components/ui/kbd";

export interface ResizableEmailPanelProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  defaultWidth?: number;
  minWidth?: number;
  maxWidthPercent?: number;
  className?: string;
  contentKey?: string;
  onNavigatePrevious?: () => void;
  onNavigateNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export function ResizableEmailPanel({
  isOpen,
  onClose,
  children,
  defaultWidth = 600,
  minWidth = 400,
  maxWidthPercent = 65,
  className,
  contentKey,
  onNavigatePrevious,
  onNavigateNext,
  hasPrevious = false,
  hasNext = false,
}: ResizableEmailPanelProps) {
  const [width, setWidth] = useState(defaultWidth);
  const [isResizing, setIsResizing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevKeyRef = useRef<string | undefined>(contentKey);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const newWidth = window.innerWidth - e.clientX;
      const maxWidth = window.innerWidth * (maxWidthPercent / 100);

      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "ew-resize";
      document.body.style.userSelect = "none";

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };
    }
  }, [isResizing, minWidth, maxWidthPercent]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "k" || e.key === "K") {
        e.preventDefault();
        if (hasPrevious && onNavigatePrevious) {
          onNavigatePrevious();
        }
      } else if (e.key === "j" || e.key === "J") {
        e.preventDefault();
        if (hasNext && onNavigateNext) {
          onNavigateNext();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, hasPrevious, hasNext, onNavigatePrevious, onNavigateNext]);

  // Reset scroll position when content changes
  useEffect(() => {
    if (contentKey && contentKey !== prevKeyRef.current) {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = 0;
      }
      prevKeyRef.current = contentKey;
    }
  }, [contentKey]);

  return (
    <>
      {/* Panel */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex flex-col bg-background border-l shadow-lg transition-transform duration-150 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full",
          className
        )}
        style={{ width: `${width}px`, maxWidth: "65vw" }}
      >
        {/* Header section */}
        <div className="h-14 border-b flex items-center justify-between px-6">
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close">
                  <ChevronsRight className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <Kbd>Esc</Kbd>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={onNavigatePrevious}
                  disabled={!hasPrevious}
                  aria-label="Previous email"
                >
                  <ChevronUp className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <Kbd>K</Kbd>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={onNavigateNext}
                  disabled={!hasNext}
                  aria-label="Next email"
                >
                  <ChevronDown className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <Kbd>J</Kbd>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Resize handle */}
        <div
          className={cn(
            "absolute left-0 top-0 h-full cursor-ew-resize z-10 hover:bg-accent/50 transition-colors",
            isResizing && "bg-accent"
          )}
          onMouseDown={handleMouseDown}
          style={{
            width: "4px",
            touchAction: "none",
            marginLeft: "-2px",
          }}
        />

        {/* Content */}
        <div ref={scrollRef} className="flex flex-col flex-1 min-h-0 pl-2 overflow-y-auto">
          {children}
        </div>
      </div>
    </>
  );
}
