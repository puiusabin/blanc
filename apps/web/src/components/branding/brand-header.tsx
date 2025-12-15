import { cn } from "@/lib/utils";
import { BlancLogo } from "./blanc-logo";

interface BrandHeaderProps {
  className?: string;
  showName?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeConfig = {
  sm: {
    image: 14,
    text: "text-sm font-semibold",
  },
  md: {
    image: 20,
    text: "text-lg font-semibold",
  },
  lg: {
    image: 28,
    text: "text-xl font-semibold",
  },
};

export function BrandHeader({ className, showName = true, size = "md" }: BrandHeaderProps) {
  const config = sizeConfig[size];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <BlancLogo width={config.image} height={config.image} className="text-primary" />
      {showName && <span className={cn(config.text, "text-primary")}>blanc</span>}
    </div>
  );
}
