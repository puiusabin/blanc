import { Plus, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DecorativeBorderLayoutProps {
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export function DecorativeBorderLayout({
  children,
  onClose,
  className,
}: DecorativeBorderLayoutProps) {
  return (
    <div className={cn("flex flex-col h-full min-w-0", className)}>
      {/* Top border row */}
      <div className="flex h-14 shrink-0 border-b relative">
        <div className="w-16 border-r relative" />
        <div className="flex-1" />
        {onClose && (
          <div className="w-16 border-l relative">
            <button
              onClick={onClose}
              className="absolute inset-0 flex items-center justify-center hover:bg-accent transition-colors"
            >
              <XIcon className="size-4" />
              <span className="sr-only">Close</span>
            </button>
          </div>
        )}
      </div>

      {/* Main content row */}
      <div className="flex flex-row flex-1 min-h-0">
        {/* Left border column */}
        <div className="w-16 shrink-0 border-r relative">
          <Plus
            className="size-7 text-muted-foreground absolute right-0"
            style={{ bottom: "20%", transform: "translate(50%, 50%)" }}
          />
        </div>

        {/* Content area */}
        <div className="flex-1 flex flex-col overflow-hidden">{children}</div>

        {/* Right border column */}
        <div className="w-16 shrink-0 border-l relative">
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
  );
}
