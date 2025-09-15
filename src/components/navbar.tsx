import Image from "next/image";
import Link from "next/link";

export function Navbar() {
  return (
    <nav className="bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image
              src="/blanc.svg"
              alt="Blanc"
              width={120}
              height={40}
              className="h-5 w-auto"
              priority
              sizes="120px"
            />
          </Link>
        </div>
      </div>
    </nav>
  );
}
