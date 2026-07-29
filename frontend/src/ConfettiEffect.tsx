// ConfettiEffect.tsx
import React, { useEffect, useRef } from "react";

export const ConfettiEffect: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const colors = ["#ff6a3d", "#00f2fe", "#10b981", "#f59e0b", "#a855f7", "#ec4899", "#ffffff", "#ffd700"];
    const pieces: Array<{
      x: number;
      y: number;
      size: number;
      color: string;
      vx: number;
      vy: number;
      rotation: number;
      rotationSpeed: number;
      shape: "rect" | "circle";
    }> = [];

    // Burst 150 vibrant confetti particles from center
    for (let i = 0; i < 150; i++) {
      pieces.push({
        x: width / 2 + (Math.random() * 200 - 100),
        y: height / 2 - 80 + (Math.random() * 60 - 30),
        size: Math.random() * 9 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 16,
        vy: Math.random() * -14 - 6,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.25,
        shape: Math.random() > 0.35 ? "rect" : "circle",
      });
    }

    let animId: number;
    const gravity = 0.22;
    const drag = 0.985;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      let activeCount = 0;
      for (const p of pieces) {
        p.vx *= drag;
        p.vy += gravity;
        p.vy *= drag;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;

        if (p.shape === "rect") {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.4);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();

        if (p.y < height + 60) {
          activeCount++;
        }
      }

      if (activeCount > 0) {
        animId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 99999,
      }}
    />
  );
};

export default ConfettiEffect;
