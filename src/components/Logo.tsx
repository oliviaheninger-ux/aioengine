// src/components/Logo.tsx
export function Logo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Node 1 */}
      <circle cx="20" cy="50" r="12" className="fill-emerald-500" />
      {/* Node 2 (Center) */}
      <circle cx="50" cy="50" r="16" className="fill-emerald-500" />
      {/* Node 3 */}
      <circle cx="80" cy="50" r="12" className="fill-emerald-500" />
      {/* Connections */}
      <line x1="32" y1="50" x2="38" y2="50" stroke="currentColor" strokeWidth="6" className="stroke-emerald-500" />
      <line x1="62" y1="50" x2="68" y2="50" stroke="currentColor" strokeWidth="6" className="stroke-emerald-500" />
    </svg>
  );
}