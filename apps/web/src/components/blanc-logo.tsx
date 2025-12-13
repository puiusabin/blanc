interface BlancLogoProps {
  width?: number;
  height?: number;
  className?: string;
}

export function BlancLogo({ width = 20, height = 20, className }: BlancLogoProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="100" height="100" rx="0.625" fill="currentColor" />
    </svg>
  );
}
