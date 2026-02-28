"use client";

import { useEffect, useRef, useState } from "react";

type NavUsernameProps = {
  username: string;
  className?: string;
};

export default function NavUsername({ username, className = "" }: NavUsernameProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!containerRef.current) {
        return;
      }

      if (!containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  function handleLogout() {
    window.location.href = "/auth/logout";
  }

  return (
    <div ref={containerRef} className={`relative ${className}`.trim()}>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex items-center gap-2 rounded-full border border-[#f2cb74]/60 bg-[#4d3018]/90 px-3 py-1.5 shadow-[0_0_18px_rgba(255,210,120,0.2)]"
      >
        <span className="text-sm font-bold tracking-wide text-[#ffe5ac]">
          {username}
        </span>
        <span className="text-xs text-[#ffe5ac]/90">{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen ? (
        <div className="absolute left-0 top-full z-20 mt-2 min-w-[140px] rounded-xl border border-[#f2cb74]/40 bg-[#2f1c10]/95 p-1.5 shadow-[0_10px_25px_rgba(0,0,0,0.35)]">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-lg px-3 py-2 text-left text-sm font-bold tracking-wide text-[#ffe5ac] transition hover:bg-[#f2cb74]/20"
          >
            Logout
          </button>
        </div>
      ) : null}
    </div>
  );
}
