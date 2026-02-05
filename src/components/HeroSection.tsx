"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Sparkles, ArrowRight, Play, Code2, Film, Zap } from "lucide-react";

// ─── Starfield Canvas ──────────────────────────────────────────────────
function StarfieldCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    const stars: { x: number; y: number; z: number; size: number; color: string }[] = [];
    const STAR_COUNT = 200;
    const colors = ["#c4b5fd", "#818cf8", "#06b6d4", "#f0abfc", "#ffffff"];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * 3 + 0.5,
        size: Math.random() * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    let time = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.002;

      for (const star of stars) {
        const twinkle = Math.sin(time * star.z * 2 + star.x) * 0.5 + 0.5;
        ctx.globalAlpha = twinkle * 0.8 + 0.2;
        ctx.fillStyle = star.color;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size * (twinkle * 0.4 + 0.6), 0, Math.PI * 2);
        ctx.fill();

        // Subtle drift
        star.y += star.z * 0.05;
        star.x += Math.sin(time + star.y * 0.01) * 0.1;

        if (star.y > canvas.height + 10) {
          star.y = -10;
          star.x = Math.random() * canvas.width;
        }
      }

      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
}

// ─── Floating Orbs ─────────────────────────────────────────────────────
function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 2 }}>
      {/* Main violet orb */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full animate-pulse-glow"
        style={{
          background: "radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 70%)",
          top: "10%",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      />
      {/* Cyan accent orb */}
      <div
        className="absolute w-[300px] h-[300px] rounded-full animate-pulse-glow"
        style={{
          background: "radial-gradient(circle, rgba(6,182,212,0.2) 0%, transparent 70%)",
          top: "30%",
          right: "10%",
          animationDelay: "1.5s",
        }}
      />
      {/* Pink accent orb */}
      <div
        className="absolute w-[250px] h-[250px] rounded-full animate-pulse-glow"
        style={{
          background: "radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 70%)",
          bottom: "20%",
          left: "15%",
          animationDelay: "3s",
        }}
      />
    </div>
  );
}

// ─── Nebula X ──────────────────────────────────────────────────────────
function NebulaX() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Nebula cloud particles
    const clouds: {
      x: number;
      y: number;
      radius: number;
      color: [number, number, number];
      speed: number;
      angle: number;
      orbit: number;
      phase: number;
    }[] = [];

    const CLOUD_COUNT = 90;
    const nebulaColors: [number, number, number][] = [
      [124, 58, 237],   // violet
      [139, 92, 246],   // purple
      [6, 182, 212],    // cyan
      [236, 72, 153],   // pink
      [167, 139, 250],  // lavender
      [96, 165, 250],   // blue
      [192, 132, 252],  // light purple
      [34, 211, 238],   // light cyan
    ];

    for (let i = 0; i < CLOUD_COUNT; i++) {
      const color = nebulaColors[Math.floor(Math.random() * nebulaColors.length)];
      clouds.push({
        x: 0,
        y: 0,
        radius: Math.random() * 80 + 30,
        color,
        speed: (Math.random() * 0.3 + 0.1) * (Math.random() > 0.5 ? 1 : -1),
        angle: Math.random() * Math.PI * 2,
        orbit: Math.random() * 160 + 20,
        phase: Math.random() * Math.PI * 2,
      });
    }

    const animate = () => {
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);
      time += 0.003;

      // Draw nebula cloud layers
      for (const cloud of clouds) {
        cloud.angle += cloud.speed * 0.008;
        const breathe = Math.sin(time * 1.5 + cloud.phase) * 0.3 + 1;
        const orbitR = cloud.orbit * breathe;

        const px = cx + Math.cos(cloud.angle) * orbitR;
        const py = cy + Math.sin(cloud.angle) * orbitR * 0.7; // Squash for depth

        const pulsAlpha = (Math.sin(time * 2 + cloud.phase) * 0.5 + 0.5) * 0.08 + 0.03;

        const grad = ctx.createRadialGradient(px, py, 0, px, py, cloud.radius * breathe);
        grad.addColorStop(0, `rgba(${cloud.color[0]},${cloud.color[1]},${cloud.color[2]},${pulsAlpha})`);
        grad.addColorStop(0.5, `rgba(${cloud.color[0]},${cloud.color[1]},${cloud.color[2]},${pulsAlpha * 0.4})`);
        grad.addColorStop(1, `rgba(${cloud.color[0]},${cloud.color[1]},${cloud.color[2]},0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(px, py, cloud.radius * breathe, 0, Math.PI * 2);
        ctx.fill();
      }

      // Central bright core
      const coreAlpha = Math.sin(time * 1.8) * 0.1 + 0.2;
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 100);
      coreGrad.addColorStop(0, `rgba(167, 139, 250, ${coreAlpha})`);
      coreGrad.addColorStop(0.3, `rgba(124, 58, 237, ${coreAlpha * 0.5})`);
      coreGrad.addColorStop(1, "rgba(124, 58, 237, 0)");
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, 100, 0, Math.PI * 2);
      ctx.fill();

      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <>
      {/* Nebula cloud canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 2 }}
      />

      {/* Glowing X in the center */}
      <div
        className="absolute pointer-events-none"
        style={{
          zIndex: 3,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        {/* Outer glow halo */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-[280px] h-[280px] rounded-full animate-nebula-breathe"
            style={{
              background: "radial-gradient(circle, rgba(124,58,237,0.25) 0%, rgba(6,182,212,0.08) 50%, transparent 70%)",
            }}
          />
        </div>

        {/* SVG X with glow */}
        <svg
          width="120"
          height="120"
          viewBox="0 0 120 120"
          className="relative animate-x-glow"
          style={{ filter: "drop-shadow(0 0 20px rgba(124,58,237,0.8)) drop-shadow(0 0 40px rgba(6,182,212,0.4)) drop-shadow(0 0 60px rgba(124,58,237,0.3))" }}
        >
          <defs>
            <linearGradient id="xGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a78bfa" />
              <stop offset="40%" stopColor="#7c3aed" />
              <stop offset="70%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
            <linearGradient id="xGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="50%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
            <filter id="xBlur">
              <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" />
            </filter>
          </defs>

          {/* Soft blur layer behind */}
          <g filter="url(#xBlur)" opacity="0.6">
            <line x1="25" y1="25" x2="95" y2="95" stroke="url(#xGrad)" strokeWidth="6" strokeLinecap="round" />
            <line x1="95" y1="25" x2="25" y2="95" stroke="url(#xGrad2)" strokeWidth="6" strokeLinecap="round" />
          </g>

          {/* Main X strokes */}
          <line x1="25" y1="25" x2="95" y2="95" stroke="url(#xGrad)" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="95" y1="25" x2="25" y2="95" stroke="url(#xGrad2)" strokeWidth="3.5" strokeLinecap="round" />

          {/* Bright center intersection */}
          <circle cx="60" cy="60" r="4" fill="#e0d4ff" opacity="0.9">
            <animate attributeName="r" values="3;5;3" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.7;1;0.7" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="60" cy="60" r="8" fill="none" stroke="#a78bfa" strokeWidth="0.5" opacity="0.4">
            <animate attributeName="r" values="6;12;6" dur="4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0.1;0.4" dur="4s" repeatCount="indefinite" />
          </circle>
        </svg>

        {/* Small energy particles around X */}
        <div className="absolute inset-0 flex items-center justify-center">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-violet-glow animate-x-particle"
              style={{
                animationDelay: `${i * 0.7}s`,
                animationDuration: `${3 + i * 0.5}s`,
                top: "50%",
                left: "50%",
                // @ts-expect-error CSS custom property
                "--particle-angle": `${i * 60}deg`,
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
}

// ─── Orbiting Ring ─────────────────────────────────────────────────────
function OrbitRing() {
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        zIndex: 3,
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 340,
        height: 340,
      }}
    >
      {/* Ring */}
      <div
        className="absolute inset-0 rounded-full border border-violet-glow/10"
        style={{ transform: "rotateX(70deg)" }}
      />
      {/* Orbiting dot */}
      <div className="absolute inset-0 animate-orbit" style={{ transform: "rotateX(70deg)" }}>
        <div className="w-2 h-2 rounded-full bg-cyan-glow shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
      </div>
    </div>
  );
}

// ─── Code Preview Block ────────────────────────────────────────────────
function CodePreviewBlock() {
  const lines = [
    { text: "const ", color: "#c084fc" },
    { text: "video", color: "#67e8f9" },
    { text: " = ", color: "#a5b4fc" },
    { text: "agent", color: "#f0abfc" },
    { text: ".", color: "#a5b4fc" },
    { text: "render", color: "#34d399" },
    { text: "({", color: "#a5b4fc" },
  ];

  const [typedIndex, setTypedIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTypedIndex((prev) => {
        if (prev >= lines.length) return 0;
        return prev + 1;
      });
    }, 400);
    return () => clearInterval(interval);
  }, [lines.length]);

  return (
    <div className="relative group">
      <div className="absolute -inset-1 bg-gradient-to-r from-violet-glow/20 via-cyan-glow/10 to-pink-glow/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      <div className="relative bg-[#0c0a1d]/90 backdrop-blur-sm border border-violet-glow/20 rounded-2xl p-5 font-['JetBrains_Mono',monospace] text-sm overflow-hidden">
        {/* Window dots */}
        <div className="flex gap-1.5 mb-4">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
        </div>
        <div className="space-y-1">
          <div className="flex flex-wrap">
            {lines.slice(0, typedIndex).map((token, i) => (
              <span key={i} style={{ color: token.color }}>
                {token.text}
              </span>
            ))}
            <span className="inline-block w-[2px] h-4 bg-violet-glow animate-pulse ml-0.5" />
          </div>
          <div className="text-muted-foreground-dim pl-4 opacity-60">
            {"  scene: 'product-launch',"}
          </div>
          <div className="text-muted-foreground-dim pl-4 opacity-40">
            {"  style: 'cinematic',"}
          </div>
          <div className="text-muted-foreground-dim opacity-30">{"});"}</div>
        </div>
        {/* Shimmer beam */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent animate-beam pointer-events-none" />
      </div>
    </div>
  );
}

// ─── Feature Pill ──────────────────────────────────────────────────────
function FeaturePill({
  icon,
  label,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  delay: string;
}) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/50 border border-violet-glow/10 text-xs text-muted-foreground animate-fade-in hover:border-violet-glow/30 hover:text-foreground transition-all cursor-default"
      style={{ animationDelay: delay }}
    >
      {icon}
      {label}
    </div>
  );
}

// ─── Main Hero ─────────────────────────────────────────────────────────
interface HeroSectionProps {
  onGetStarted: () => void;
}

export function HeroSection({ onGetStarted }: HeroSectionProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width - 0.5) * 20,
      y: ((e.clientY - rect.top) / rect.height - 0.5) * 20,
    });
  }, []);

  return (
    <section
      ref={heroRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#030014] bg-grid bg-noise"
    >
      <StarfieldCanvas />
      <FloatingOrbs />
      <NebulaX />

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-24 pb-16">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Copy */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-glow/10 border border-violet-glow/20 animate-fade-in">
              <div className="w-1.5 h-1.5 rounded-full bg-violet-glow animate-pulse" />
              <span className="text-xs font-medium text-violet-glow/90 tracking-wide">
                Code → Cinema
              </span>
            </div>

            {/* Headline */}
            <h1 className="animate-slide-up">
              <span className="block text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight font-['Space_Grotesk',sans-serif] leading-[1.05]">
                <span className="text-white">Your Code.</span>
                <br />
                <span className="bg-gradient-to-r from-violet-glow via-cyan-glow to-pink-glow bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-x">
                  Their Screen.
                </span>
              </span>
            </h1>

            {/* Sub-copy */}
            <p
              className="text-lg text-muted-foreground leading-relaxed max-w-md animate-fade-in"
              style={{ animationDelay: "0.3s" }}
            >
              Ship motion graphics at the speed of thought.
              Describe it, refine it, render it — all from code.
            </p>

            {/* CTA Buttons */}
            <div
              className="flex flex-wrap items-center gap-4 animate-fade-in"
              style={{ animationDelay: "0.5s" }}
            >
              <button
                onClick={onGetStarted}
                className="group relative flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white overflow-hidden transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-glow via-purple-500 to-cyan-glow bg-[length:200%_auto] animate-gradient-x" />
                <div className="absolute inset-[1px] bg-[#1a1040] rounded-[11px] group-hover:bg-transparent transition-colors duration-300" />
                <Sparkles className="w-4 h-4 relative z-10" />
                <span className="relative z-10">Start Creating</span>
                <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={onGetStarted}
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium text-muted-foreground border border-violet-glow/20 hover:border-violet-glow/40 hover:text-foreground hover:bg-accent/30 transition-all"
              >
                <Play className="w-4 h-4" />
                See it in action
              </button>
            </div>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2 pt-2">
              <FeaturePill
                icon={<Code2 className="w-3 h-3 text-cyan-glow" />}
                label="AI-Powered"
                delay="0.7s"
              />
              <FeaturePill
                icon={<Film className="w-3 h-3 text-pink-glow" />}
                label="60fps Render"
                delay="0.8s"
              />
              <FeaturePill
                icon={<Zap className="w-3 h-3 text-amber-glow" />}
                label="Instant Preview"
                delay="0.9s"
              />
            </div>
          </div>

          {/* Right - Visual */}
          <div
            className="relative animate-fade-in hidden lg:block"
            style={{
              animationDelay: "0.4s",
              transform: `perspective(1000px) rotateY(${mousePos.x * 0.15}deg) rotateX(${-mousePos.y * 0.15}deg)`,
              transition: "transform 0.1s ease-out",
            }}
          >
            <OrbitRing />
            <CodePreviewBlock />

            {/* Floating metrics */}
            <div className="absolute -top-4 -right-4 bg-accent/80 backdrop-blur-sm border border-violet-glow/20 rounded-xl px-3 py-2 animate-float">
              <div className="text-xs text-muted-foreground">Render</div>
              <div className="text-lg font-bold text-cyan-glow font-['Space_Grotesk',sans-serif]">4.2s</div>
            </div>

            <div
              className="absolute -bottom-4 -left-4 bg-accent/80 backdrop-blur-sm border border-violet-glow/20 rounded-xl px-3 py-2 animate-float"
              style={{ animationDelay: "2s" }}
            >
              <div className="text-xs text-muted-foreground">Quality</div>
              <div className="text-lg font-bold text-violet-glow font-['Space_Grotesk',sans-serif]">4K</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#030014] to-transparent z-10 pointer-events-none" />
    </section>
  );
}
