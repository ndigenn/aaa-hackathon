import Link from "next/link";

type NavHref = "/home" | "/cards" | "/summon" | "/chat" | "/shop";

type BottomNavProps = {
  activeHref: NavHref;
};

const NAV_ITEMS: { href: NavHref; label: string }[] = [
  { href: "/home", label: "Home" },
  { href: "/cards", label: "Card" },
  { href: "/summon", label: "Summon" },
  { href: "/chat", label: "Chat" },
  { href: "/shop", label: "Shop" },
];

const baseItemClass =
  "rounded-xl border px-2 py-2 text-center text-sm font-medium text-[#f7dfb3] hover:bg-[#6d4430]";
const inactiveItemClass = `${baseItemClass} border-[#c49558]/25 bg-[#5d3824]`;
const activeItemClass =
  "rounded-xl border border-[#ffe3a8] bg-[linear-gradient(180deg,#f8d787_0%,#d9aa49_100%)] px-2 py-3 text-center text-sm font-extrabold text-[#4f3018] shadow-[0_0_18px_rgba(237,185,84,0.35)] hover:brightness-105";

export default function BottomNav({ activeHref }: BottomNavProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 px-4 pb-6">
      <div className="mx-auto grid max-w-xl grid-cols-5 items-end gap-2 rounded-2xl border border-[#f0c779]/25 bg-[linear-gradient(180deg,rgba(90,53,30,0.95)_0%,rgba(65,35,20,0.95)_100%)] p-3 shadow-[0_10px_35px_rgba(20,8,4,0.55)] backdrop-blur">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={item.href === activeHref ? activeItemClass : inactiveItemClass}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
