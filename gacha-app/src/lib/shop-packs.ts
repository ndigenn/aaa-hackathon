export type CoinPack = {
  name: string;
  priceUsd: string;
  baseCoins: number;
  bonusCoins: number;
  featured?: boolean;
};

export const COIN_PACKS: CoinPack[] = [
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

export const ALLOWED_COIN_PURCHASE_AMOUNTS = new Set(
  COIN_PACKS.map((pack) => pack.baseCoins + pack.bonusCoins),
);
