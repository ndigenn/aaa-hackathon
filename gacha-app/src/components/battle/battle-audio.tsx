"use client";

import { useEffect } from "react";

const BATTLE_BGM_VOLUME = 0.28;

export default function BattleAudio() {
  useEffect(() => {
    const bgm = new Audio("/battle.mp3");
    bgm.loop = true;
    bgm.preload = "auto";
    bgm.volume = BATTLE_BGM_VOLUME;

    const tryPlay = () => {
      void bgm.play().catch(() => {
        // Ignore autoplay restrictions; first interaction retries.
      });
    };

    tryPlay();
    window.addEventListener("pointerdown", tryPlay, { once: true });
    window.addEventListener("keydown", tryPlay, { once: true });

    return () => {
      window.removeEventListener("pointerdown", tryPlay);
      window.removeEventListener("keydown", tryPlay);
      bgm.pause();
      bgm.currentTime = 0;
    };
  }, []);

  return null;
}
