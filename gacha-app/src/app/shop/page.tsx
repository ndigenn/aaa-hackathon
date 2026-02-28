import AppTopNav from "@/components/app-top-nav";
import BottomNav from "@/components/bottom-nav";
import { getTopNavProfile } from "@/lib/user-profile";
import ShopPacksClient from "@/components/shop/shop-packs-client";
import { COIN_PACKS } from "@/lib/shop-packs";

export default async function ShopPage() {
  const { username, coins } = await getTopNavProfile("/shop");

  return (
    <main className="relative min-h-screen bg-[url('/bank.png')] bg-cover bg-center bg-no-repeat px-4 pb-32 pt-10 text-[#f8e9c6]">
      <AppTopNav username={username} coins={coins} />
      <section className="mx-auto w-full max-w-5xl pt-20">
        <div className="mb-8 rounded-3xl border border-[#f2cb74]/60 bg-[#4d3018]/85 px-5 py-4 shadow-[0_0_18px_rgba(255,210,120,0.2)]">
          <p className="text-xs uppercase tracking-[0.2em] text-[#e9bf74]">Premium Shop</p>
          <h1 className="mt-2 text-3xl font-extrabold text-[#ffe6b0] sm:text-4xl">Gold Coin Store</h1>
          <p className="mt-2 text-sm text-[#f3d8aa]">Pick a pack and load up on Gold Coins for summons and upgrades.</p>
        </div>

        <ShopPacksClient coinPacks={COIN_PACKS} />
      </section>

      <BottomNav activeHref="/shop" />
    </main>
  );
}
