import Image from "next/image";
import BottomNav from "@/components/bottom-nav";
import NavGold from "@/components/nav-gold";
import NavUsername from "@/components/nav-username";
import SummonBanners from "@/components/summon/summon-banners";

export default function SummonPage() {
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

      <section className="relative mx-auto w-full max-w-xl px-6 pb-36 pt-28">
        <h1 className="text-center text-3xl font-extrabold text-[#ffe8b8]">
          Summon Banners
        </h1>
        <p className="mt-2 text-center text-sm text-[#efd8b0]">
          Choose your banner and pull for your next top-tier cowgirl.
        </p>

        <SummonBanners />
      </section>

      <BottomNav activeHref="/summon" />
    </main>
  );
}
