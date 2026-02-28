import AppTopNav from "@/components/app-top-nav";
import BottomNav from "@/components/bottom-nav";
import SummonBanners from "@/components/summon/summon-banners";
import { getTopNavProfile } from "@/lib/user-profile";

export default async function SummonPage() {
  const { username, coins } = await getTopNavProfile("/summon");

  return (
    <main className="relative min-h-screen overflow-hidden text-[#f8e9c6]">
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat md:bg-[position:center_15%]"
        style={{ backgroundImage: "url('/summonpage.png')" }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(14,8,6,0.36)_0%,rgba(20,10,8,0.56)_48%,rgba(25,14,9,0.78)_100%)]" />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-[linear-gradient(90deg,rgba(14,8,6,0.5)_0%,rgba(14,8,6,0)_100%)]" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-[linear-gradient(270deg,rgba(14,8,6,0.5)_0%,rgba(14,8,6,0)_100%)]" />

      <AppTopNav username={username} coins={coins} />

      <section className="relative mx-auto w-full max-w-xl px-6 pb-36 pt-28">
        <h1 className="text-center text-3xl font-extrabold text-[#ffe8b8] drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]">
          Summon Banner
        </h1>
        <p className="mt-2 text-center text-sm text-[#efd8b0] drop-shadow-[0_1px_6px_rgba(0,0,0,0.45)]">
          Pull from the featured banner to grow your roster.
        </p>

        <SummonBanners initialCoins={coins} />
      </section>

      <BottomNav activeHref="/summon" />
    </main>
  );
}
