"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CoinPack } from "@/lib/shop-packs";

type ShopPacksClientProps = {
  coinPacks: CoinPack[];
};

export default function ShopPacksClient({ coinPacks }: ShopPacksClientProps) {
  const router = useRouter();
  const [activePackName, setActivePackName] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleBuy(pack: CoinPack) {
    const amount = pack.baseCoins + pack.bonusCoins;
    setActivePackName(pack.name);
    setMessage(null);

    try {
      const response = await fetch("/api/shop/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount }),
      });

      const payload = (await response.json()) as
        | { error?: string; coins?: number; addedCoins?: number }
        | undefined;

      if (!response.ok) {
        setMessage(payload?.error ?? "Purchase failed. Please try again.");
        return;
      }

      setMessage(`Added ${amount.toLocaleString()} coins.`);
      router.refresh();
    } catch {
      setMessage("Network error while purchasing. Please try again.");
    } finally {
      setActivePackName(null);
    }
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {coinPacks.map((pack) => {
          const totalCoins = pack.baseCoins + pack.bonusCoins;
          const isLoading = activePackName === pack.name;

          return (
            <article
              key={pack.name}
              className={`rounded-2xl border p-5 shadow-[0_14px_30px_rgba(12,6,2,0.45)] ${
                pack.featured
                  ? "border-[#ffd98f] bg-[linear-gradient(165deg,rgba(140,84,23,0.95)_0%,rgba(98,58,23,0.95)_100%)]"
                  : "border-[#b98d54]/35 bg-[linear-gradient(165deg,rgba(96,57,29,0.9)_0%,rgba(62,38,24,0.95)_100%)]"
              }`}
            >
              <p className="text-xs uppercase tracking-[0.2em] text-[#f4cc87]">
                {pack.name}
              </p>
              <p className="mt-2 text-3xl font-extrabold text-[#fff1cc]">
                {pack.priceUsd}
              </p>

              <div className="mt-4 rounded-xl border border-[#f2cc84]/35 bg-[#2f1c10]/50 p-3">
                <p className="text-sm text-[#f3d9ad]">
                  Base:{" "}
                  <span className="font-bold text-[#ffe4a7]">
                    {pack.baseCoins.toLocaleString()} GC
                  </span>
                </p>
                <p className="mt-1 text-sm text-[#f3d9ad]">
                  Bonus:{" "}
                  <span className="font-bold text-[#ffe4a7]">
                    {pack.bonusCoins.toLocaleString()} GC
                  </span>
                </p>
                <p className="mt-2 text-base font-extrabold text-[#ffd67f]">
                  Total: {totalCoins.toLocaleString()} GC
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleBuy(pack)}
                disabled={Boolean(activePackName)}
                className="mt-4 w-full rounded-xl border border-[#ffe3a6]/80 bg-[linear-gradient(180deg,#ffdf95_0%,#d6a43d_100%)] px-4 py-2.5 text-sm font-extrabold uppercase tracking-[0.08em] text-[#4a2b16] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading ? "Adding Coins..." : `Buy ${totalCoins.toLocaleString()} GC`}
              </button>
            </article>
          );
        })}
      </div>

      {message ? (
        <p className="mt-4 rounded-xl border border-[#f2cc84]/30 bg-[#2f1c10]/60 px-3 py-2 text-sm text-[#ffe8bf]">
          {message}
        </p>
      ) : null}
    </>
  );
}
