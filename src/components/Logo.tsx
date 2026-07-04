import Image from "next/image";

export function Logo({ className = "h-14 w-auto" }: { className?: string }) {
  return (
    <Image
      src="/aioengine-logo.png"
      alt="aioengine"
      width={180}
      height={48}
      className={className}
      priority
    />
  );
}