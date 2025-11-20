import { Checkbox } from "@/components/ui/checkbox";
import { RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EmailListHeaderProps {
  title?: string;
  selectedCount?: number;
  totalCount?: number;
  allSelected?: boolean;
  onSelectAll?: (selected: boolean) => void;
  onRefresh?: () => void;
  showRefresh?: boolean;
}

export function EmailListHeader({
  title = "Inbox",
  selectedCount = 0,
  totalCount = 0,
  allSelected = false,
  onSelectAll,
  onRefresh,
  showRefresh = true,
}: EmailListHeaderProps) {
  const handleCheckboxChange = (checked: boolean | "indeterminate") => {
    onSelectAll?.(checked === true);
  };

  const isIndeterminate = selectedCount > 0 && selectedCount < totalCount;

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      {onSelectAll && (
        <Checkbox
          checked={allSelected}
          ref={(el) => {
            if (el) {
              el.indeterminate = isIndeterminate;
            }
          }}
          onCheckedChange={handleCheckboxChange}
          className={cn(
            "data-[state=checked]:!bg-blue-500 data-[state=checked]:!border-blue-500",
            "mr-2"
          )}
          aria-label="Select all emails"
        />
      )}
      <h1 className="text-md font-medium">{title}</h1>
      <div className="flex-1" />
      {showRefresh && (
        <button
          className="p-2 hover:bg-accent rounded-md transition-colors"
          aria-label="Refresh"
          onClick={onRefresh}
        >
          <RotateCw className="size-4" />
        </button>
      )}
    </header>
  );
}
