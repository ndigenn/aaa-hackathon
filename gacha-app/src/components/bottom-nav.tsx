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
  "group relative flex min-h-[68px] flex-col items-center justify-center gap-1 rounded-xl border px-1.5 py-2 text-center text-xs font-bold uppercase tracking-[0.05em] leading-none transition-all duration-200 sm:text-[11px]";
const inactiveItemClass = `${baseItemClass} border-[#cc9a59]/28 bg-[linear-gradient(180deg,rgba(94,56,31,0.88)_0%,rgba(62,35,20,0.92)_100%)] text-[#f7ddb0] hover:-translate-y-0.5 hover:border-[#efbf78]/55 hover:bg-[linear-gradient(180deg,rgba(110,66,37,0.92)_0%,rgba(74,43,25,0.94)_100%)]`;
const activeItemClass = `${baseItemClass} border-[#ffd995]/95 bg-[linear-gradient(180deg,#ffe2a9_0%,#d89d41_100%)] text-[#4c2a13] shadow-[0_0_18px_rgba(237,185,84,0.35)]`;
const summonItemClass =
  "group relative -translate-y-5 flex h-[94px] w-full items-center justify-center rounded-full bg-transparent transition-transform duration-200 hover:-translate-y-6";

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
    <nav className="fixed inset-x-0 bottom-0 z-20 px-3 pb-5 sm:px-4 sm:pb-6">
      <div className="mx-auto max-w-xl">
        <div className="relative">
          <div className="pointer-events-none absolute -inset-x-2 -top-3 h-16 rounded-[26px] bg-[radial-gradient(circle_at_50%_0%,rgba(248,200,106,0.25)_0%,rgba(248,200,106,0)_70%)]" />
          <div className="grid grid-cols-5 items-end gap-2 rounded-[24px] border border-[#f0c779]/35 bg-[linear-gradient(180deg,rgba(88,50,29,0.97)_0%,rgba(52,29,17,0.98)_100%)] p-2.5 shadow-[0_14px_38px_rgba(20,8,4,0.6)] backdrop-blur">
            {NAV_ITEMS.map((item) => {
              const isSummon = item.href === "/summon";
              const isActive = item.href === activeHref;
              const itemClass = isSummon
                ? summonItemClass
                : isActive
                  ? activeItemClass
                  : inactiveItemClass;
              const iconSize = isSummon ? 120 : 34;

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
                        ? `relative flex h-[90px] w-[90px] items-center justify-center rounded-full border border-[#ffd792]/70 bg-[radial-gradient(circle,rgba(255,226,165,0.9)_0%,rgba(247,186,84,0.88)_48%,rgba(134,74,28,0.95)_100%)] shadow-[0_18px_34px_rgba(237,185,84,0.5)] ${
                            isActive ? "ring-2 ring-[#ffe8b7]" : ""
                          }`
                        : "relative flex h-7 w-7 items-center justify-center rounded-full bg-[#311a0f]/50"
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
                          ? "h-[74px] w-[74px] object-contain drop-shadow-[0_10px_16px_rgba(62,28,8,0.6)]"
                          : "h-5.5 w-5.5 object-contain sm:h-6 sm:w-6"
                      }
                    />
                    {isSummon ? (
                      <span className="pointer-events-none absolute -bottom-4 rounded-full border border-[#f5c87e]/65 bg-[#4a2613]/95 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] text-[#ffd88f]">
                        Summon
                      </span>
                    ) : null}
                  </div>
                  {!isSummon ? (
                    <span className={isActive ? "text-[#4b2a12]" : "text-[#f7ddb0]"}>
                      {item.label}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
