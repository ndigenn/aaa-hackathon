type NavUsernameProps = {
  username: string;
  className?: string;
};

export default function NavUsername({ username, className = "" }: NavUsernameProps) {
  return (
    <div
      className={`flex items-center rounded-full border border-[#f2cb74]/60 bg-[#4d3018]/90 px-3 py-1.5 shadow-[0_0_18px_rgba(255,210,120,0.2)] ${className}`.trim()}
    >
      <span className="text-sm font-bold tracking-wide text-[#ffe5ac]">
        {username}
      </span>
    </div>
  );
}
