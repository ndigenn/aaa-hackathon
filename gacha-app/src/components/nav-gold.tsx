type NavGoldProps = {
  gold: number;
  className?: string;
};

export default function NavGold({ gold, className = "" }: NavGoldProps) {
  return (
    <div
      className={`flex items-center gap-2 rounded-full border border-[#f2cb74]/60 bg-[#4d3018]/90 px-3 py-1.5 shadow-[0_0_18px_rgba(255,210,120,0.2)] ${className}`.trim()}
    >
      <span className="inline-block h-3 w-3 rounded-full bg-[#f3c45a] shadow-[0_0_10px_rgba(243,196,90,0.85)]" />
      <span className="text-sm font-bold tracking-wide text-[#ffe5ac] tabular-nums">
        {gold.toLocaleString()}
      </span>
    </div>
  );
}
