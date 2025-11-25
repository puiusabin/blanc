import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

interface EmailListSectionHeaderProps {
  title: string;
  count: number;
  className?: string;
}

export function EmailListSectionHeader({ title, count, className }: EmailListSectionHeaderProps) {
  return (
    <>
      <div className={cn("px-4 py-3 bg-muted/30 sticky top-0 z-10 backdrop-blur-sm", className)}>
        <div className="flex items-center">
          {/* Spacer for checkbox column */}
          <div className="flex items-center">
            <div className="size-4" />
          </div>
          {/* Spacer for unread indicator column */}
          <div className="w-6 shrink-0" />
          <span className="text-xs font-semibold uppercase tracking-wide text-foreground">
            {title}
            <span className="ml-1 text-muted-foreground font-normal">({count})</span>
          </span>
        </div>
      </div>
      <Separator />
    </>
  );
}
