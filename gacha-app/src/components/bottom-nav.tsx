"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback } from "react";

type NavHref = "/home" | "/cards" | "/summon" | "/chat" | "/shop";

type BottomNavProps = {
  activeHref: NavHref;
};

const NAV_ITEMS: { href: NavHref; label: string; icon: string }[] = [
  { href: "/home", label: "Home", icon: "/barn.png" },
  { href: "/cards", label: "Cards", icon: "/card.png" },
  { href: "/summon", label: "Summon", icon: "/summon.png" },
  { href: "/chat", label: "Chat", icon: "/chat.png" },
  { href: "/shop", label: "Shop", icon: "/coin.png" },
];

const baseItemClass =
  "flex min-h-[68px] flex-col items-center justify-center gap-1 rounded-xl border px-1.5 py-2 text-center text-xs font-semibold leading-none transition-all sm:text-sm";
const inactiveItemClass = `${baseItemClass} border-[#c49558]/25 bg-[#5d3824] text-[#f7dfb3] hover:bg-[#6d4430]`;
const activeItemClass =
  `${baseItemClass} border-[#ffe3a8] bg-[linear-gradient(180deg,#f8d787_0%,#d9aa49_100%)] text-[#4f3018] shadow-[0_0_18px_rgba(237,185,84,0.35)] hover:brightness-105`;
const summonItemClass =
  "relative -translate-y-4 flex h-[84px] w-full items-center justify-center rounded-full bg-transparent transition-transform hover:-translate-y-5";

export default function BottomNav({ activeHref }: BottomNavProps) {
  const handleNavClick = useCallback((href: NavHref) => {
    const src = href === "/summon" ? "/door.mp3" : href === "/shop" ? "/coin.mp3" : null;
    if (!src) return;

    const audio = new Audio(src);
    audio.volume = href === "/summon" ? 0.3 : 0.45;
    void audio.play().catch(() => {
      // Ignore autoplay/interaction failures; navigation still proceeds.
    });
  }, []);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 px-4 pb-6">
      <div className="mx-auto grid max-w-xl grid-cols-5 items-end gap-2 rounded-2xl border border-[#f0c779]/25 bg-[linear-gradient(180deg,rgba(90,53,30,0.95)_0%,rgba(65,35,20,0.95)_100%)] p-3 shadow-[0_10px_35px_rgba(20,8,4,0.55)] backdrop-blur">
        {NAV_ITEMS.map((item) => (
          (() => {
            const isSummon = item.href === "/summon";
            const isActive = item.href === activeHref;
            const itemClass = isSummon ? summonItemClass : isActive ? activeItemClass : inactiveItemClass;
            const iconSize = isSummon ? 128 : 32;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => handleNavClick(item.href)}
                className={itemClass}
                aria-label={isSummon ? "Summon" : undefined}
              >
                <div
                  className={
                    isSummon
                      ? `relative flex h-[84px] w-[84px] items-center justify-center rounded-full bg-[radial-gradient(circle,rgba(255,225,155,0.72)_0%,rgba(255,225,155,0.24)_55%,rgba(255,225,155,0.05)_100%)] shadow-[0_18px_30px_rgba(237,185,84,0.5)] ${
                          isActive ? "ring-2 ring-[#ffe3a8]" : ""
                        }`
                      : ""
                  }
                >
                  <Image
                    src={item.icon}
                    alt={`${item.label} icon`}
                    width={iconSize}
                    height={iconSize}
                    quality={100}
                    className={
                      isSummon
                        ? "h-[72px] w-[72px] object-contain drop-shadow-[0_10px_16px_rgba(255,220,125,0.75)] sm:h-[76px] sm:w-[76px]"
                        : "h-6 w-6 object-contain sm:h-7 sm:w-7"
                    }
                  />
                </div>
                {!isSummon ? <span>{item.label}</span> : null}
              </Link>
            );
          })()
        ))}
      </div>
    </nav>
  );
}
