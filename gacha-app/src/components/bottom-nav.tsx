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
  "group relative flex min-h-[74px] flex-col items-center justify-end gap-1 rounded-2xl border px-1.5 pb-1.5 pt-2 text-center leading-none transition-all duration-200";
const inactiveItemClass = `${baseItemClass} border-[#ca9a5b]/30 bg-[linear-gradient(180deg,rgba(96,54,31,0.88)_0%,rgba(66,36,20,0.92)_100%)] hover:-translate-y-0.5 hover:border-[#efbf78]/55 hover:bg-[linear-gradient(180deg,rgba(112,65,38,0.9)_0%,rgba(77,44,26,0.92)_100%)]`;
const activeItemClass = `${baseItemClass} border-[#ffd995]/95 bg-[linear-gradient(180deg,#ffe2ad_0%,#d59a3e_100%)] shadow-[0_0_18px_rgba(237,185,84,0.35)]`;
const summonItemClass =
  "group relative -translate-y-5 flex h-[96px] w-full items-center justify-center rounded-full bg-transparent transition-transform duration-200 hover:-translate-y-6";

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
          <div className="pointer-events-none absolute inset-x-8 top-0 h-1 rounded-full bg-[#f4c777]/45 blur-[1px]" />
          <div className="grid grid-cols-5 items-end gap-2 rounded-[26px] border border-[#f0c779]/35 bg-[linear-gradient(180deg,rgba(86,49,28,0.97)_0%,rgba(52,30,17,0.98)_52%,rgba(44,25,14,0.99)_100%)] p-2.5 shadow-[0_14px_38px_rgba(20,8,4,0.6)] backdrop-blur">
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
                        ? `relative flex h-[92px] w-[92px] items-center justify-center rounded-full border border-[#ffd792]/70 bg-[radial-gradient(circle,rgba(255,226,165,0.9)_0%,rgba(247,186,84,0.88)_48%,rgba(134,74,28,0.95)_100%)] shadow-[0_18px_34px_rgba(237,185,84,0.5)] ${
                            isActive ? "ring-2 ring-[#ffe8b7]" : ""
                          }`
                        : `relative flex h-[46px] w-[46px] items-center justify-center rounded-full border ${
                            isActive
                              ? "border-[#ffd995]/85 bg-[#fff0cf]"
                              : "border-[#d2a568]/45 bg-[#2c170d]/65"
                          }`
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
                          : "h-9 w-9 object-contain"
                      }
                    />
                    {isSummon ? (
                      <span className="pointer-events-none absolute -bottom-4 rounded-full border border-[#f5c87e]/65 bg-[#4a2613]/95 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] text-[#ffd88f]">
                        Summon
                      </span>
                    ) : null}
                  </div>
                  {!isSummon ? (
                    <span
                      className={`text-[13px] ${
                        isActive ? "text-[#4a2a13]" : "text-[#f5ddb2]"
                      }`}
                      style={{
                        fontFamily:
                          '"Brush Script MT","Lucida Handwriting","Apple Chancery",cursive',
                      }}
                    >
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
