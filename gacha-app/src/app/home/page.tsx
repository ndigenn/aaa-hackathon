import Link from "next/link";
import AppTopNav from "@/components/app-top-nav";
import BottomNav from "@/components/bottom-nav";
import { getTopNavProfile } from "@/lib/user-profile";

export default async function HomePage() {
  const { username, coins } = await getTopNavProfile("/home");

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#5a2d72_0%,#3b1f4f_45%,#2a1733_70%,#22180f_100%)] text-[#f8e9c6]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,215,140,0.12)_0%,rgba(91,47,26,0.2)_50%,rgba(44,26,16,0.45)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-[linear-gradient(180deg,rgba(122,78,44,0)_0%,rgba(93,57,31,0.55)_65%,rgba(65,36,20,0.8)_100%)]" />

      <AppTopNav username={username} coins={coins} />

      <section className="relative mx-auto flex min-h-screen w-full max-w-xl flex-col items-center justify-center px-6 pb-36 pt-28">
        <div className="w-full rounded-2xl border border-[#f0c67a]/40 bg-[linear-gradient(165deg,rgba(107,57,137,0.88)_0%,rgba(85,45,110,0.9)_35%,rgba(72,41,30,0.92)_100%)] p-6 shadow-[0_16px_45px_rgba(18,8,5,0.55)]">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.24em] text-[#f4cd84]">
            Welcome Back
          </p>
          <h1 className="mt-2 text-center text-3xl font-extrabold text-[#ffe8b8]">
            Saddle Up, Cowgirl
          </h1>
          <p className="mt-3 text-center text-sm text-[#efd8b0]">
            Your next legendary pull is waiting in Summon. Visit the banner page to choose your target.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Link
              href="/summon"
              className="rounded-xl border border-[#ffe2a0]/80 bg-[linear-gradient(180deg,#ffdc8f_0%,#d7a744_100%)] px-4 py-3 text-center text-sm font-extrabold uppercase tracking-[0.08em] text-[#4a2a16] transition hover:brightness-105"
            >
              Go To Summon
            </Link>
            <Link
              href="/cards"
              className="rounded-xl border border-[#f2cd86]/40 bg-[#3a2348]/65 px-4 py-3 text-center text-sm font-extrabold uppercase tracking-[0.08em] text-[#ffe8b8] transition hover:bg-[#4b2d5f]/80"
            >
              View Cards
            </Link>
          </div>
        </div>
      </section>

      <BottomNav activeHref="/home" />
    </main>
  );
}
