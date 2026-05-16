import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

interface ShapeLandingHeroProps {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
}

const FloatingOrb = ({
  size,
  x,
  y,
  delay,
  duration,
  opacity,
}: {
  size: number;
  x: string;
  y: string;
  delay: number;
  duration: number;
  opacity: number;
}) => (
  <motion.div
    className="absolute rounded-full pointer-events-none"
    style={{
      width: size,
      height: size,
      left: x,
      top: y,
      background: `radial-gradient(circle, rgba(201,168,76,${opacity}) 0%, rgba(201,168,76,0) 70%)`,
      filter: "blur(40px)",
    }}
    animate={{
      y: [0, -30, 0],
      x: [0, 15, 0],
      scale: [1, 1.1, 1],
      opacity: [opacity * 0.6, opacity, opacity * 0.6],
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />
);

const GeometricLine = ({
  x1, y1, x2, y2, delay,
}: {
  x1: string; y1: string; x2: string; y2: string; delay: number;
}) => (
  <motion.line
    x1={x1} y1={y1} x2={x2} y2={y2}
    stroke="rgba(201,168,76,0.15)"
    strokeWidth="0.5"
    initial={{ pathLength: 0, opacity: 0 }}
    animate={{ pathLength: 1, opacity: 1 }}
    transition={{ duration: 2, delay, ease: "easeInOut" }}
  />
);

export const ShapeLandingHero: React.FC<ShapeLandingHeroProps> = ({
  title = "Elite Glow Salon",
  subtitle = "Luxury Beauty & Care Experience",
  children,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles: Array<{
      x: number; y: number; vx: number; vy: number;
      size: number; opacity: number;
    }> = [];

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.4 + 0.1,
      });
    }

    let animId: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201,168,76,${p.opacity})`;
        ctx.fill();

        // Draw connections
        particles.slice(i + 1).forEach((p2) => {
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(201,168,76,${0.06 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-noir-950">
      {/* Particle canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0"
        style={{ opacity: 0.8 }}
      />

      {/* Floating orbs */}
      <FloatingOrb size={600} x="60%" y="-10%" delay={0} duration={10} opacity={0.12} />
      <FloatingOrb size={400} x="-5%" y="30%" delay={2} duration={12} opacity={0.08} />
      <FloatingOrb size={300} x="40%" y="60%" delay={4} duration={9} opacity={0.1} />

      {/* SVG geometric lines */}
      <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
        <GeometricLine x1="0" y1="20" x2="30" y2="0" delay={0.5} />
        <GeometricLine x1="70" y1="0" x2="100" y2="30" delay={1} />
        <GeometricLine x1="100" y1="70" x2="70" y2="100" delay={1.5} />
        <GeometricLine x1="30" y1="100" x2="0" y2="80" delay={2} />
        <GeometricLine x1="20" y1="0" x2="80" y2="100" delay={2.5} />
      </svg>

      {/* Dark overlay gradient */}
      <div className="absolute inset-0 z-[1]"
        style={{
          background: "linear-gradient(135deg, rgba(10,10,10,0.85) 0%, rgba(10,10,10,0.6) 50%, rgba(10,10,10,0.9) 100%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-6">
        {/* Pre-title ornament */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="flex items-center gap-4 mb-8"
        >
          <div className="h-px w-16 md:w-24" style={{ background: "linear-gradient(to right, transparent, #C9A84C)" }} />
          <span className="text-xs tracking-[0.4em] uppercase text-gold-500 font-accent">Est. 2018</span>
          <div className="h-px w-16 md:w-24" style={{ background: "linear-gradient(to left, transparent, #C9A84C)" }} />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="font-display font-light mb-4"
          style={{
            fontSize: "clamp(3rem, 8vw, 7rem)",
            letterSpacing: "-0.02em",
            lineHeight: 1.05,
          }}
        >
          <span className="gold-text">{title}</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="font-body font-light text-lg md:text-xl text-stone-300 tracking-widest uppercase mb-12 max-w-lg"
        >
          {subtitle}
        </motion.p>

        {/* CTA */}
        {children}
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 z-[2]"
        style={{ background: "linear-gradient(to top, #0a0a0a, transparent)" }}
      />
    </div>
  );
};
