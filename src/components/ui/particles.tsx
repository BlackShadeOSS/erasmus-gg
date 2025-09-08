"use client";

import React, {
  ComponentPropsWithoutRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

interface MousePosition {
  x: number;
  y: number;
}

function MousePosition(): MousePosition {
  const [mousePosition, setMousePosition] = useState<MousePosition>({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return mousePosition;
}

interface ParticlesProps extends ComponentPropsWithoutRef<"div"> {
  className?: string;
  quantity?: number;
  staticity?: number;
  ease?: number;
  size?: number;
  refresh?: boolean;
  color?: string;
  vx?: number;
  vy?: number;
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
  staticity = 50,
  ease = 50,
  size = 0.4,
  refresh = false,
  color = "#ffffff",
  vx = 0,
  vy = 0,
  ...props
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const context = useRef<CanvasRenderingContext2D | null>(null);
  const circles = useRef<Circle[]>([]);
  const mousePosition = MousePosition();
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio : 1;

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
        ctx.scale(dpr, dpr);

        // Initialize circles
        circles.current = Array.from({ length: quantity }, () => ({
          x: Math.random() * rect.width,
          y: Math.random() * rect.height,
          translateX: 0,
          translateY: 0,
          size: Math.random() * 2 + size,
          alpha: 0,
          targetAlpha: Math.random() * 0.6 + 0.1,
          dx: (Math.random() - 0.5) * 0.2,
          dy: (Math.random() - 0.5) * 0.2,
          magnetism: 0.1 + Math.random() * 4,
        }));
      }
    }
  }, [dpr, quantity, size]);

  const animate = useCallback(() => {
    if (!context.current || !canvasContainerRef.current) return;

    const ctx = context.current;
    const container = canvasContainerRef.current;
    const rect = container.getBoundingClientRect();

    ctx.clearRect(0, 0, rect.width, rect.height);

    const [r, g, b] = hexToRgb(color);

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
      const distanceToMouse = Math.sqrt(
        Math.pow(circle.x - mousePosition.x, 2) +
          Math.pow(circle.y - mousePosition.y, 2)
      );

      const maxDistance = staticity;
      if (distanceToMouse < maxDistance) {
        circle.alpha = circle.targetAlpha * (1 - distanceToMouse / maxDistance);
        const force = (maxDistance - distanceToMouse) / maxDistance;
        const angle = Math.atan2(
          circle.y - mousePosition.y,
          circle.x - mousePosition.x
        );
        circle.translateX = Math.cos(angle) * force * circle.magnetism;
        circle.translateY = Math.sin(angle) * force * circle.magnetism;
      } else {
        circle.alpha += (circle.targetAlpha - circle.alpha) * (ease / 100);
        circle.translateX += (0 - circle.translateX) * (ease / 100);
        circle.translateY += (0 - circle.translateY) * (ease / 100);
      }

      // Draw circle
      ctx.globalAlpha = circle.alpha;
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

    requestAnimationFrame(animate);
  }, [color, staticity, ease, mousePosition.x, mousePosition.y, vx, vy]);

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (canvasContainerRef.current) {
        const rect = canvasContainerRef.current.getBoundingClientRect();
        mousePosition.x = e.clientX - rect.left;
        mousePosition.y = e.clientY - rect.top;
      }
    },
    [mousePosition]
  );

  useEffect(() => {
    initCanvas();
  }, [initCanvas]);

  useEffect(() => {
    const animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [animate]);

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
