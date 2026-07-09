import Image from "next/image";

export function Logo({ className = "h-14 w-auto" }: { className?: string }) {
  return (
    <Image
      src="/aioengine-logo2.png"
      alt="aioengine"
      width={400}
      height={48}
      className={className}
      priority
    />
  );
}