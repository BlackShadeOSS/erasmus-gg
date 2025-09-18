"use client";

import React, {
  ComponentPropsWithoutRef,
  useCallback,
  useEffect,
  useRef,
} from "react";

interface MousePosition {
  x: number;
  y: number;
}

interface ParticlesProps extends ComponentPropsWithoutRef<"div"> {
  className?: string;
  quantity?: number;
  staticity?: number; // radius for mouse interaction
  ease?: number; // easing for returning to idle
  size?: number; // base size added to random radius
  refresh?: boolean;
  color?: string;
  vx?: number; // global x drift
  vy?: number; // global y drift
  alphaMultiplier?: number; // boosts per-particle alpha for visibility
}

function hexToRgb(hex: string): number[] {
  hex = hex.replace("#", "");

  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((char) => char + char)
      .join("");
  }

  const hexInt = parseInt(hex, 16);
  const red = (hexInt >> 16) & 255;
  const green = (hexInt >> 8) & 255;
  const blue = hexInt & 255;
  return [red, green, blue];
}

type Circle = {
  x: number;
  y: number;
  translateX: number;
  translateY: number;
  size: number;
  alpha: number;
  targetAlpha: number;
  dx: number;
  dy: number;
  magnetism: number;
};

export const Particles: React.FC<ParticlesProps> = ({
  className = "",
  quantity = 100,
  staticity = 60,
  ease = 20,
  size = 0.8,
  refresh = false,
  color = "#f59e0b", // amber to match theme, more visible on dark bg
  vx = 0,
  vy = 0,
  alphaMultiplier = 1.0,
  ...props
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const context = useRef<CanvasRenderingContext2D | null>(null);
  const circles = useRef<Circle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio : 1;
  const runningRef = useRef(true);
  const rafIdRef = useRef<number | null>(null);

  const initCanvas = useCallback(() => {
    if (canvasRef.current && canvasContainerRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const container = canvasContainerRef.current;

      if (ctx && container) {
        context.current = ctx;
        const rect = container.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
        ctx.setTransform(1, 0, 0, 1, 0, 0); // reset
        ctx.scale(dpr, dpr);

        // Initialize circles
        circles.current = Array.from({ length: quantity }, () => ({
          x: Math.random() * rect.width,
          y: Math.random() * rect.height,
          translateX: 0,
          translateY: 0,
          size: Math.random() * 2.5 + size,
          alpha: 0,
          targetAlpha: Math.random() * 0.5 + 0.4, // 0.4 - 0.9 for better visibility
          dx: (Math.random() - 0.5) * 0.05, // slower drift
          dy: (Math.random() - 0.5) * 0.05,
          magnetism: 0.3 + Math.random() * 1.2, // gentler reaction to mouse
        }));
      }
    }
  }, [dpr, quantity, size]);

  const animate = useCallback(() => {
    if (!runningRef.current) return;
    if (!context.current || !canvasContainerRef.current) return;

    const ctx = context.current;
    const container = canvasContainerRef.current;
    const rect = container.getBoundingClientRect();

    ctx.clearRect(0, 0, rect.width, rect.height);

    const [r, g, b] = hexToRgb(color);

    const mx = mouseRef.current.x;
    const my = mouseRef.current.y;

    circles.current.forEach((circle) => {
      // Update position
      circle.x += circle.dx + vx;
      circle.y += circle.dy + vy;

      // Wrap around edges
      if (circle.x < 0) circle.x = rect.width;
      if (circle.x > rect.width) circle.x = 0;
      if (circle.y < 0) circle.y = rect.height;
      if (circle.y > rect.height) circle.y = 0;

      // Mouse interaction
      const distanceToMouse = Math.hypot(circle.x - mx, circle.y - my);

      const maxDistance = staticity;
      if (distanceToMouse < maxDistance) {
        circle.alpha = circle.targetAlpha * (1 - distanceToMouse / maxDistance);
        const force = (maxDistance - distanceToMouse) / maxDistance;
        const angle = Math.atan2(circle.y - my, circle.x - mx);
        circle.translateX = Math.cos(angle) * force * circle.magnetism;
        circle.translateY = Math.sin(angle) * force * circle.magnetism;
      } else {
        circle.alpha += (circle.targetAlpha - circle.alpha) * (ease / 100);
        circle.translateX += (0 - circle.translateX) * (ease / 100);
        circle.translateY += (0 - circle.translateY) * (ease / 100);
      }

      // Draw circle
      ctx.globalAlpha = Math.min(1, circle.alpha * alphaMultiplier);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 1)`;
      ctx.beginPath();
      ctx.arc(
        circle.x + circle.translateX,
        circle.y + circle.translateY,
        circle.size,
        0,
        Math.PI * 2
      );
      ctx.fill();
    });

    rafIdRef.current = requestAnimationFrame(animate);
  }, [color, staticity, ease, vx, vy, alphaMultiplier]);

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!canvasContainerRef.current) return;
    const rect = canvasContainerRef.current.getBoundingClientRect();
    mouseRef.current.x = e.clientX - rect.left;
    mouseRef.current.y = e.clientY - rect.top;
  }, []);

  useEffect(() => {
    runningRef.current = true;
    initCanvas();
    rafIdRef.current = requestAnimationFrame(animate);
    return () => {
      runningRef.current = false;
      if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
    };
  }, [initCanvas, animate]);

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, [onMouseMove]);

  useEffect(() => {
    const handleResize = () => initCanvas();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [initCanvas]);

  useEffect(() => {
    if (refresh) {
      initCanvas();
    }
  }, [refresh, initCanvas]);

  return (
    <div ref={canvasContainerRef} className={className} {...props}>
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0"
      />
    </div>
  );
};
