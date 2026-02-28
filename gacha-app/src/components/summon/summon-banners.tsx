"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

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

type SummonResult = {
  card: {
    id: string;
    name: string;
    rarity: string;
    type: string;
    description: string;
    imageSrc: string;
    voiceLinePath?: string;
  };
  remainingCoins: number;
  cost: number;
};

const SUMMON_BANNERS: SummonBanner[] = [
  {
    id: "outlaw-legend",
    title: "Frontier Legends",
    subtitle: "Featured Banner",
    description: "One banner with every current card in the summon pool.",
    legendaryRate: "Mixed",
    freePullTimer: "02:14:09",
    ctaLabel: "Single Draw (1,000)",
    accentClass:
      "bg-[linear-gradient(165deg,rgba(107,57,137,0.88)_0%,rgba(85,45,110,0.9)_35%,rgba(72,41,30,0.92)_100%)]",
  },
];

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function setSummonMusicDucked(ducked: boolean) {
  window.dispatchEvent(
    new CustomEvent("summon:music-duck", {
      detail: { ducked },
    }),
  );
}

export default function SummonBanners({ initialCoins }: { initialCoins: number }) {
  const router = useRouter();
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const [currentCoins, setCurrentCoins] = useState(initialCoins);
  const [isSummoning, setIsSummoning] = useState(false);
  const [activeBannerId, setActiveBannerId] = useState<string | null>(null);
  const [showReveal, setShowReveal] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [summonResult, setSummonResult] = useState<SummonResult | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  const activeBannerTitle = useMemo(
    () => SUMMON_BANNERS.find((banner) => banner.id === activeBannerId)?.title ?? "Banner",
    [activeBannerId],
  );

  function playVoiceLine(voiceLinePath?: string) {
    if (!voiceLinePath) {
      setSummonMusicDucked(false);
      return;
    }

    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current.currentTime = 0;
    }

    const audio = new Audio(voiceLinePath);
    audio.volume = 1;
    audio.addEventListener("ended", () => setSummonMusicDucked(false), { once: true });
    audio.addEventListener("error", () => setSummonMusicDucked(false), { once: true });
    activeAudioRef.current = audio;
    void audio.play().catch(() => {
      setSummonMusicDucked(false);
    });
  }

  async function handleSingleSummon(bannerId: string) {
    if (isSummoning) return;
    if (currentCoins < 1000) {
      setErrorText("You need at least 1,000 coins to summon.");
      return;
    }

    setErrorText(null);
    setSummonResult(null);
    setActiveBannerId(bannerId);
    setIsSummoning(true);
    setShowReveal(true);
    setIsDrawing(true);
    setSummonMusicDucked(true);

    try {
      const [response] = await Promise.all([
        fetch("/api/summon", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ bannerId }),
        }),
        sleep(900),
      ]);

      const payload = (await response.json()) as SummonResult | { error?: string };
      if (!response.ok) {
        const errorMessage =
          "error" in payload && payload.error
            ? payload.error
            : "Summon failed. Please try again.";
        setErrorText(errorMessage);
        setShowReveal(false);
        setSummonMusicDucked(false);
        return;
      }

      const result = payload as SummonResult;
      setSummonResult(result);
      setCurrentCoins(result.remainingCoins);
      setIsDrawing(false);
      playVoiceLine(result.card.voiceLinePath);
      router.refresh();
    } catch {
      setErrorText("Network error while summoning. Please try again.");
      setShowReveal(false);
      setSummonMusicDucked(false);
    } finally {
      setIsSummoning(false);
    }
  }

  function closeReveal() {
    setShowReveal(false);
    setIsDrawing(false);
    setSummonMusicDucked(false);
  }

  useEffect(() => {
    return () => {
      if (!activeAudioRef.current) return;
      activeAudioRef.current.pause();
      activeAudioRef.current.currentTime = 0;
      activeAudioRef.current = null;
      setSummonMusicDucked(false);
    };
  }, []);

  return (
    <>
      <p className="mt-4 text-center text-sm font-semibold text-[#ffdca0]">
        Current Coins: {currentCoins.toLocaleString()}
      </p>

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

            <button
              type="button"
              disabled={isSummoning || currentCoins < 1000}
              onClick={() => handleSingleSummon(banner.id)}
              className="mt-5 block w-full rounded-xl border border-[#ffe2a0]/80 bg-[linear-gradient(180deg,#ffdc8f_0%,#d7a744_100%)] px-4 py-3 text-center text-base font-extrabold uppercase tracking-[0.08em] text-[#4a2a16] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSummoning && activeBannerId === banner.id
                ? "Drawing..."
                : currentCoins < 1000
                  ? "Need 1,000 Coins"
                  : banner.ctaLabel}
            </button>
          </article>
        ))}
      </div>

      {errorText ? (
        <p className="mt-4 rounded-lg border border-[#f2cd86]/30 bg-[#3a2348]/70 px-4 py-2 text-center text-sm text-[#ffdca0]">
          {errorText}
        </p>
      ) : null}

      <AnimatePresence>
        {showReveal ? (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-sm rounded-2xl border border-[#f0c67a]/50 bg-[linear-gradient(160deg,#2c1c37_0%,#3b2248_55%,#4a2a1d_100%)] p-5 text-center shadow-[0_18px_50px_rgba(0,0,0,0.58)]"
              initial={{ y: 20, scale: 0.97 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 20, scale: 0.97 }}
              transition={{ duration: 0.2 }}
            >
              <p className="text-xs uppercase tracking-[0.2em] text-[#f4cd84]">
                {activeBannerTitle}
              </p>
              <h3 className="mt-2 text-xl font-bold text-[#ffe8b8]">
                {isDrawing ? "Drawing Card..." : "Summon Complete"}
              </h3>

              <div className="mt-5 flex min-h-[280px] items-center justify-center">
                {isDrawing ? (
                  <motion.div
                    className="h-[240px] w-[170px] overflow-hidden rounded-xl border border-[#f4cd84]/50 shadow-[0_10px_30px_rgba(0,0,0,0.45)]"
                    animate={{ rotate: [0, -5, 5, -2, 0], y: [0, -6, 0] }}
                    transition={{ duration: 0.9, repeat: Number.POSITIVE_INFINITY }}
                  >
                    <Image
                      src="/card.png"
                      alt="Card back"
                      width={170}
                      height={240}
                      className="h-full w-full object-cover"
                    />
                  </motion.div>
                ) : summonResult ? (
                  <motion.div
                    initial={{ rotateY: 180, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    transition={{ duration: 0.35 }}
                    className="w-full"
                  >
                    <div className="mx-auto h-[240px] w-[170px] overflow-hidden rounded-xl border border-[#f4cd84]/65 bg-[#2f1c3b] shadow-[0_10px_30px_rgba(0,0,0,0.45)]">
                      <Image
                        src={summonResult.card.imageSrc}
                        alt={summonResult.card.name}
                        width={170}
                        height={240}
                        className="h-full w-full object-contain p-2"
                      />
                    </div>
                    <p className="mt-4 text-xl font-bold text-[#ffe8b8]">
                      {summonResult.card.name}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[#ffd677]">
                      {summonResult.card.rarity} • {summonResult.card.type}
                    </p>
                    <p className="mt-3 text-sm text-[#efd8b0]">
                      {summonResult.card.description}
                    </p>
                    <p className="mt-3 text-sm font-semibold text-[#ffdca0]">
                      -{summonResult.cost.toLocaleString()} coins •{" "}
                      {summonResult.remainingCoins.toLocaleString()} remaining
                    </p>
                  </motion.div>
                ) : null}
              </div>

              {!isDrawing ? (
                <button
                  type="button"
                  onClick={closeReveal}
                  className="mt-2 rounded-lg border border-[#ffe2a0]/80 bg-[linear-gradient(180deg,#ffdc8f_0%,#d7a744_100%)] px-4 py-2 text-sm font-bold uppercase tracking-[0.08em] text-[#4a2a16]"
                >
                  Continue
                </button>
              ) : null}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
