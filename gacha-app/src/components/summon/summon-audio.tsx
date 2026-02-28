"use client";

import { useEffect } from "react";

export default function SummonAudio() {
  useEffect(() => {
    const bgm = new Audio("/pianoSaloon.mp3");
    bgm.loop = true;
    bgm.preload = "auto";
    bgm.volume = 0.22;

    const tryPlay = () => {
      void bgm.play().catch(() => {
        // Ignore autoplay restrictions; next interaction will retry.
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
