"use client";

import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ResizableEmailPanelProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  defaultWidth?: number;
  minWidth?: number;
  maxWidthPercent?: number;
  className?: string;
  contentKey?: string;
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

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

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
        <div className="h-14 border-b flex items-center justify-end px-6">
          <button
            onClick={onClose}
            className="rounded-sm opacity-70 hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none transition-opacity"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
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
