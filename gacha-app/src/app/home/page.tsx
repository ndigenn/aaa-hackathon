import Link from "next/link";
import AppTopNav from "@/components/app-top-nav";
import BottomNav from "@/components/bottom-nav";
import { getTopNavProfile } from "@/lib/user-profile";

export default async function HomePage() {
  const { username, coins } = await getTopNavProfile("/home");

  return (
    <main className="relative min-h-screen overflow-hidden text-[#f8e9c6]">
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/homepage.png')" }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(12,8,6,0.38)_0%,rgba(20,10,8,0.5)_45%,rgba(25,14,9,0.72)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[linear-gradient(180deg,rgba(14,8,6,0.6)_0%,rgba(14,8,6,0)_100%)]" />

      <AppTopNav username={username} coins={coins} />

      <section className="relative mx-auto flex min-h-screen w-full max-w-xl flex-col items-center justify-center px-6 pb-36 pt-28">
        <div className="w-full rounded-2xl border border-[#f0c67a]/45 bg-[linear-gradient(165deg,rgba(52,29,18,0.83)_0%,rgba(42,24,15,0.88)_50%,rgba(33,20,12,0.92)_100%)] p-6 shadow-[0_16px_45px_rgba(18,8,5,0.58)] backdrop-blur-[2px]">
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
              className="rounded-xl border border-[#f2cd86]/45 bg-[#3a2348]/75 px-4 py-3 text-center text-sm font-extrabold uppercase tracking-[0.08em] text-[#ffe8b8] transition hover:bg-[#4b2d5f]/90"
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
