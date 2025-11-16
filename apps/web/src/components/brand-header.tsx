import Image from "next/image"
import { cn } from "@/lib/utils"

interface BrandHeaderProps {
  className?: string
  showName?: boolean
  size?: "sm" | "md" | "lg"
}

const sizeConfig = {
  sm: {
    image: 14,
    text: "text-sm",
  },
  md: {
    image: 20,
    text: "text-lg",
  },
  lg: {
    image: 28,
    text: "text-xl",
  },
}

export function BrandHeader({
  className,
  showName = true,
  size = "md"
}: BrandHeaderProps) {
  const config = sizeConfig[size]

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Image
        src="/blancicow.svg"
        alt="blanc logo"
        width={config.image}
        height={config.image}
        className="hidden dark:block"
      />
      <Image
        src="/blancicob.svg"
        alt="blanc logo"
        width={config.image}
        height={config.image}
        className="dark:hidden"
      />
      {showName && (
        <span className={cn(config.text)}>blanc</span>
      )}
    </div>
  )
}
