import Link from "next/link";

type SummonBanner = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  legendaryRate: string;
  freePullTimer: string;
  ctaLabel: string;
  accentClass: string;
};

const SUMMON_BANNERS: SummonBanner[] = [
  {
    id: "outlaw-legend",
    title: "Outlaw Legend",
    subtitle: "Frontier Banner",
    description: "Ride for rare sheriffs, bounty hunters, and mythic gunslingers.",
    legendaryRate: "3.0%",
    freePullTimer: "02:14:09",
    ctaLabel: "Quick Draw x10",
    accentClass:
      "bg-[linear-gradient(165deg,rgba(107,57,137,0.88)_0%,rgba(85,45,110,0.9)_35%,rgba(72,41,30,0.92)_100%)]",
  },
  {
    id: "cowgirl-hero",
    title: "Cowgirl Hero",
    subtitle: "Heroic Spotlight",
    description: "Call in fearless cowgirls with boosted drops and bonus shards.",
    legendaryRate: "5.0%",
    freePullTimer: "00:47:31",
    ctaLabel: "Hero Pull x10",
    accentClass:
      "bg-[linear-gradient(165deg,rgba(170,86,24,0.9)_0%,rgba(130,58,24,0.95)_50%,rgba(81,36,22,0.95)_100%)]",
  },
];

export default function SummonBanners() {
  return (
    <div className="mt-6 grid gap-5">
      {SUMMON_BANNERS.map((banner) => (
        <article
          key={banner.id}
          className={`w-full rounded-2xl border border-[#f0c67a]/40 p-5 shadow-[0_16px_45px_rgba(18,8,5,0.55)] ${banner.accentClass}`}
        >
          <p className="text-center text-xs font-semibold uppercase tracking-[0.24em] text-[#f4cd84]">
            {banner.subtitle}
          </p>
          <h2 className="mt-2 text-center text-2xl font-extrabold text-[#ffe8b8]">
            {banner.title}
          </h2>
          <p className="mt-2 text-center text-sm text-[#efd8b0]">
            {banner.description}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3 text-center">
            <div className="rounded-xl border border-[#f2cd86]/30 bg-[#3a2348]/65 px-3 py-3">
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#d7b07a]">
                Legendary Rate
              </p>
              <p className="mt-1 text-lg font-bold text-[#ffd677]">{banner.legendaryRate}</p>
            </div>
            <div className="rounded-xl border border-[#f2cd86]/30 bg-[#3a2348]/65 px-3 py-3">
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#d7b07a]">
                Next Free Pull
              </p>
              <p className="mt-1 text-lg font-bold text-[#ffd677]">{banner.freePullTimer}</p>
            </div>
          </div>

          <Link
            href="/summon"
            className="mt-5 block rounded-xl border border-[#ffe2a0]/80 bg-[linear-gradient(180deg,#ffdc8f_0%,#d7a744_100%)] px-4 py-3 text-center text-base font-extrabold uppercase tracking-[0.08em] text-[#4a2a16] transition hover:brightness-105"
          >
            {banner.ctaLabel}
          </Link>
        </article>
      ))}
    </div>
  );
}
