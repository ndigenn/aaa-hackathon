"use client";

import { useEffect } from "react";

const NORMAL_BGM_VOLUME = 0.22;
const DUCKED_BGM_VOLUME = 0.1;

export default function SummonAudio() {
  useEffect(() => {
    const bgm = new Audio("/pianoSaloon.mp3");
    bgm.loop = true;
    bgm.preload = "auto";
    bgm.volume = NORMAL_BGM_VOLUME;

    const tryPlay = () => {
      void bgm.play().catch(() => {
        // Ignore autoplay restrictions; next interaction will retry.
      });
    };

    const handleMusicDuck = (event: Event) => {
      const customEvent = event as CustomEvent<{ ducked?: boolean }>;
      const shouldDuck = Boolean(customEvent.detail?.ducked);
      bgm.volume = shouldDuck ? DUCKED_BGM_VOLUME : NORMAL_BGM_VOLUME;
    };

    tryPlay();
    window.addEventListener("pointerdown", tryPlay, { once: true });
    window.addEventListener("keydown", tryPlay, { once: true });
    window.addEventListener("summon:music-duck", handleMusicDuck as EventListener);

    return () => {
      window.removeEventListener("pointerdown", tryPlay);
      window.removeEventListener("keydown", tryPlay);
      window.removeEventListener("summon:music-duck", handleMusicDuck as EventListener);
      bgm.pause();
      bgm.currentTime = 0;
    };
  }, []);

  return null;
}
