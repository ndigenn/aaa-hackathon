import Image from "next/image";
import Link from "next/link";
import BottomNav from "@/components/bottom-nav";
import NavGold from "@/components/nav-gold";
import NavUsername from "@/components/nav-username";

export default function HomePage() {
  const username = "Username";
  const gold = 2450;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#5a2d72_0%,#3b1f4f_45%,#2a1733_70%,#22180f_100%)] text-[#f8e9c6]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,215,140,0.12)_0%,rgba(91,47,26,0.2)_50%,rgba(44,26,16,0.45)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-[linear-gradient(180deg,rgba(122,78,44,0)_0%,rgba(93,57,31,0.55)_65%,rgba(65,36,20,0.8)_100%)]" />

      <header className="absolute inset-x-0 top-0 flex items-center justify-center px-4 pt-6">
        <Image
          src="/transparent_logo.png"
          alt="Game logo"
          width={140}
          height={140}
          className="h-20 w-auto object-contain drop-shadow-[0_0_15px_rgba(246,188,72,0.45)] sm:h-24"
          priority
        />

        <NavUsername username={username} className="absolute left-4 top-8" />
        <NavGold gold={gold} className="absolute right-4 top-6" />
      </header>

      <section className="relative mx-auto flex min-h-screen w-full max-w-xl flex-col items-center justify-center px-6 pb-36 pt-28">
        <div className="w-full rounded-2xl border border-[#f0c67a]/40 bg-[linear-gradient(165deg,rgba(107,57,137,0.88)_0%,rgba(85,45,110,0.9)_35%,rgba(72,41,30,0.92)_100%)] p-5 shadow-[0_16px_45px_rgba(18,8,5,0.55)]">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.24em] text-[#f4cd84]">
            Frontier Banner
          </p>
          <h1 className="mt-2 text-center text-2xl font-extrabold text-[#ffe8b8]">
            Outlaw Legends Summon
          </h1>
          <p className="mt-2 text-center text-sm text-[#efd8b0]">
            Ride for rare sheriffs, bounty hunters, and mythic gunslingers.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3 text-center">
            <div className="rounded-xl border border-[#f2cd86]/30 bg-[#3a2348]/65 px-3 py-3">
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#d7b07a]">
                Legendary Rate
              </p>
              <p className="mt-1 text-lg font-bold text-[#ffd677]">3.0%</p>
            </div>
            <div className="rounded-xl border border-[#f2cd86]/30 bg-[#3a2348]/65 px-3 py-3">
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#d7b07a]">
                Next Free Pull
              </p>
              <p className="mt-1 text-lg font-bold text-[#ffd677]">02:14:09</p>
            </div>
          </div>

          <Link
            href="/summon"
            className="mt-5 block rounded-xl border border-[#ffe2a0]/80 bg-[linear-gradient(180deg,#ffdc8f_0%,#d7a744_100%)] px-4 py-3 text-center text-base font-extrabold uppercase tracking-[0.08em] text-[#4a2a16] transition hover:brightness-105"
          >
            Quick Draw x10
          </Link>
        </div>
      </section>

      <BottomNav activeHref="/summon" />
    </main>
  );
}
