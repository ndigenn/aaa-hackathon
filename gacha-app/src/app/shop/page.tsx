import Link from "next/link";

type CoinPack = {
  name: string;
  priceUsd: string;
  baseCoins: number;
  bonusCoins: number;
  featured?: boolean;
};

const coinPacks: CoinPack[] = [
  { name: "Starter Pouch", priceUsd: "$0.99", baseCoins: 100, bonusCoins: 0 },
  { name: "Trailblazer Stash", priceUsd: "$4.99", baseCoins: 500, bonusCoins: 0 },
  {
    name: "Sheriff Bundle",
    priceUsd: "$9.99",
    baseCoins: 1000,
    bonusCoins: 100,
    featured: true,
  },
  {
    name: "Legendary Cache",
    priceUsd: "$49.99",
    baseCoins: 5000,
    bonusCoins: 500,
  },
  {
    name: "Mythic Vault",
    priceUsd: "$99.99",
    baseCoins: 10000,
    bonusCoins: 1000,
  },
];

export default function ShopPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#4d2f17_0%,#2e1c0f_45%,#191107_100%)] px-4 pb-32 pt-10 text-[#f8e9c6]">
      <section className="mx-auto w-full max-w-5xl">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-[#e9bf74]">
            Premium Shop
          </p>
          <h1 className="mt-2 text-3xl font-extrabold text-[#ffe6b0] sm:text-4xl">
            Gold Coin Store
          </h1>
          <p className="mt-2 text-sm text-[#f3d8aa]">
            Pick a pack and load up on Gold Coins for summons and upgrades.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {coinPacks.map((pack) => {
            const totalCoins = pack.baseCoins + pack.bonusCoins;

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
                  className="mt-4 w-full rounded-xl border border-[#ffe3a6]/80 bg-[linear-gradient(180deg,#ffdf95_0%,#d6a43d_100%)] px-4 py-2.5 text-sm font-extrabold uppercase tracking-[0.08em] text-[#4a2b16] transition hover:brightness-105"
                >
                  Buy {totalCoins.toLocaleString()} GC
                </button>
              </article>
            );
          })}
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
            className="rounded-xl border border-[#c49558]/25 bg-[#5d3824] px-2 py-2 text-center text-sm font-medium text-[#f7dfb3] hover:bg-[#6d4430]"
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
            className="rounded-xl border border-[#ffe3a8] bg-[linear-gradient(180deg,#f8d787_0%,#d9aa49_100%)] px-2 py-3 text-center text-sm font-extrabold text-[#4f3018] shadow-[0_0_18px_rgba(237,185,84,0.35)] hover:brightness-105"
          >
            Shop
          </Link>
        </div>
      </nav>
    </main>
  );
}
