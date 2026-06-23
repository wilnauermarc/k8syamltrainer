import confetti from "canvas-confetti";

const COLORS = ["#38bdf8", "#34d399", "#a78bfa", "#fbbf24", "#f472b6"];

export function celebrateSuccess(): void {
  const burst = (originX: number) => {
    confetti({
      particleCount: 80,
      spread: 70,
      startVelocity: 35,
      origin: { x: originX, y: 0.55 },
      colors: COLORS,
      disableForReducedMotion: true,
    });
  };

  burst(0.25);
  burst(0.75);

  window.setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 90,
      spread: 100,
      origin: { x: 0.5, y: 0.4 },
      colors: COLORS,
      disableForReducedMotion: true,
    });
  }, 200);
}
