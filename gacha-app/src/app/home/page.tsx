import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
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

        <div className="absolute right-4 top-6 flex items-center gap-2 rounded-full border border-[#f2cb74]/60 bg-[#4d3018]/90 px-3 py-1.5 shadow-[0_0_18px_rgba(255,210,120,0.2)]">
          <span className="inline-block h-3 w-3 rounded-full bg-[#f3c45a] shadow-[0_0_10px_rgba(243,196,90,0.85)]" />
          <span className="text-sm font-bold tracking-wide text-[#ffe5ac]">
            2,450
          </span>
        </div>
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

      <nav className="fixed inset-x-0 bottom-0 px-4 pb-6">
        <div className="mx-auto grid max-w-xl grid-cols-5 items-end gap-2 rounded-2xl border border-[#f0c779]/25 bg-[linear-gradient(180deg,rgba(90,53,30,0.95)_0%,rgba(65,35,20,0.95)_100%)] p-3 shadow-[0_10px_35px_rgba(20,8,4,0.55)] backdrop-blur">
          <Link
            href="/home"
            className="rounded-xl border border-[#c49558]/25 bg-[#5d3824] px-2 py-2 text-center text-sm font-medium text-[#f7dfb3] hover:bg-[#6d4430]"
          >
            Home
          </Link>
          <Link
            href="/cards"
            className="rounded-xl border border-[#c49558]/25 bg-[#5d3824] px-2 py-2 text-center text-sm font-medium text-[#f7dfb3] hover:bg-[#6d4430]"
          >
            Card
          </Link>
          <Link
            href="/summon"
            className="rounded-xl border border-[#ffe3a8] bg-[linear-gradient(180deg,#f8d787_0%,#d9aa49_100%)] px-2 py-3 text-center text-sm font-extrabold text-[#4f3018] shadow-[0_0_18px_rgba(237,185,84,0.35)] hover:brightness-105"
          >
            Summon
          </Link>
          <Link
            href="/chat"
            className="rounded-xl border border-[#c49558]/25 bg-[#5d3824] px-2 py-2 text-center text-sm font-medium text-[#f7dfb3] hover:bg-[#6d4430]"
          >
            Chat
          </Link>
          <Link
            href="/shop"
            className="rounded-xl border border-[#c49558]/25 bg-[#5d3824] px-2 py-2 text-center text-sm font-medium text-[#f7dfb3] hover:bg-[#6d4430]"
          >
            Shop
          </Link>
        </div>
      </nav>
    </main>
  );
}
