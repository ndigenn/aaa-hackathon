import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#140b07] text-[#f8e9c6]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,201,104,0.28)_0%,rgba(255,201,104,0)_46%),linear-gradient(180deg,#2e160d_0%,#160c08_45%,#0c0604_100%)]" />
        <div
          className="absolute inset-0 bg-cover bg-center opacity-45"
          style={{ backgroundImage: "url('/landing_page_background.png')" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,5,3,0.25)_0%,rgba(10,5,3,0.72)_58%,rgba(10,5,3,0.92)_100%)]" />
        <div className="absolute -left-24 top-16 h-64 w-64 rounded-full bg-[#ffb33b]/20 blur-3xl" />
        <div className="absolute -right-24 top-28 h-72 w-72 rounded-full bg-[#a64221]/25 blur-3xl" />
      </div>

      <section className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-between px-5 pb-10 pt-8 sm:px-8 md:px-10">
        <header className="flex items-center justify-center">
          <Image
            src="/transparent_logo.png"
            alt="Gacha game logo"
            width={220}
            height={120}
            className="h-auto w-[140px] drop-shadow-[0_0_20px_rgba(246,188,72,0.35)] sm:w-[190px]"
            priority
          />
        </header>

        <div className="grid items-end gap-8 pb-8 md:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#e1b672] sm:text-sm">
              High Stakes Summons
            </p>
            <h1 className="mt-3 max-w-2xl text-4xl font-black uppercase leading-[0.95] text-[#ffe8b8] drop-shadow-[0_4px_12px_rgba(0,0,0,0.55)] sm:text-6xl md:text-7xl">
              Roll The Saloon
              <span className="block text-[#ffc35a]">Win The Legends</span>
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-[#f0d7a8] sm:text-base">
              Spend coins. Pull outlaw cards. Build your posse. Every summon is a
              spin at the table with western heat and casino odds.
            </p>
          </div>

          <div className="rounded-3xl border border-[#f5cd84]/45 bg-[linear-gradient(165deg,rgba(98,52,20,0.92)_0%,rgba(53,29,13,0.94)_100%)] p-5 shadow-[0_20px_45px_rgba(0,0,0,0.45)] backdrop-blur-[2px] sm:p-6">
            <p className="text-xs uppercase tracking-[0.22em] text-[#f0c57d]">
              Enter The Table
            </p>
            <div className="mt-4 flex flex-col gap-3">
              <Link
                href="/signup"
                className="rounded-xl border border-[#ffe3ad]/80 bg-[linear-gradient(180deg,#ffe0a2_0%,#dca347_100%)] px-5 py-3 text-center text-sm font-black uppercase tracking-[0.09em] text-[#3f220f] transition hover:brightness-105"
              >
                Create Account
              </Link>
              <Link
                href="/login"
                className="rounded-xl border border-[#d4a76a]/65 bg-[linear-gradient(180deg,#6d351f_0%,#4f2515_100%)] px-5 py-3 text-center text-sm font-black uppercase tracking-[0.09em] text-[#ffe7bc] transition hover:bg-[linear-gradient(180deg,#7d4025_0%,#562818_100%)]"
              >
                Log In
              </Link>
            </div>
            <div className="mt-5 flex items-center justify-between rounded-2xl border border-[#f5cd84]/30 bg-[#1f110a]/65 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-[#f0c57d]">
                Starting Stack
              </p>
              <p className="text-lg font-extrabold text-[#ffd989]">1,000 Coins</p>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-8 left-5 hidden items-center gap-2 rounded-full border border-[#ffcd7b]/35 bg-[#28150c]/75 px-3 py-1.5 text-xs uppercase tracking-[0.17em] text-[#ffdf9f] shadow-[0_0_18px_rgba(255,174,62,0.2)] sm:flex md:left-10">
          <span className="inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-[#ffb547]" />
          Live Summon Atmosphere
        </div>

        <div className="pointer-events-none absolute right-6 top-28 flex h-16 w-16 animate-[spin_10s_linear_infinite] items-center justify-center rounded-full border border-[#ffde9e]/65 bg-[radial-gradient(circle,#ffd89a_0%,#b6782c_100%)] text-sm font-black text-[#4f2a12] shadow-[0_0_24px_rgba(251,186,88,0.45)] sm:right-10 sm:top-24">
          GC
        </div>
      </section>
    </main>
  );
}
