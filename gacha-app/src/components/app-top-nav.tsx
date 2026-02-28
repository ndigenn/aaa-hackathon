"use client";

import Image from "next/image";
import NavGold from "@/components/nav-gold";
import NavUsername from "@/components/nav-username";

type AppTopNavProps = {
  username: string;
  coins: number;
  className?: string;
};

export default function AppTopNav({
  username,
  coins,
  className = "",
}: AppTopNavProps) {
  return (
    <header
      className={`absolute inset-x-0 top-0 z-30 flex items-center justify-center px-4 pt-6 ${className}`.trim()}
    >
      <Image
        src="/transparent_logo.png"
        alt="Game logo"
        width={140}
        height={140}
        className="h-20 w-auto object-contain drop-shadow-[0_0_15px_rgba(246,188,72,0.45)] sm:h-24"
        priority
      />

      <div className="absolute left-4 top-8">
        <NavUsername username={username} />
      </div>
      <NavGold gold={coins} className="absolute right-4 top-6" />
    </header>
  );
}
