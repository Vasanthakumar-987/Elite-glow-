import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

const stats = [
  { value: 2400, suffix: "+", label: "Happy Clients" },
  { value: 8, suffix: " yrs", label: "Years of Excellence" },
  { value: 3, suffix: "", label: "Premium Branches" },
  { value: 4.9, suffix: "", label: "Average Rating" },
];

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Bride",
    text: "The bridal makeup team at Elite Glow is absolutely exceptional. I felt like royalty on my wedding day. Every detail was perfect.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop",
  },
  {
    name: "Meena Krishnan",
    role: "Regular Client",
    text: "I have been coming here for three years. The hair coloring results are consistently stunning, and the team always understands exactly what I want.",
    avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop",
  },
  {
    name: "Divya Nair",
    role: "Spa Enthusiast",
    text: "The gold spa ritual is unlike anything I have experienced. Pure luxury from start to finish. I leave feeling completely renewed.",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop",
  },
];

const Counter: React.FC<{ target: number; suffix: string; duration?: number }> = ({
  target,
  suffix,
  duration = 2000,
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const isDecimal = target % 1 !== 0;
          const steps = 60;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              current = target;
              clearInterval(timer);
            }
            if (ref.current) {
              ref.current.textContent = isDecimal
                ? current.toFixed(1)
                : Math.floor(current).toString();
            }
          }, duration / steps);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return (
    <span>
      <span ref={ref}>0</span>{suffix}
    </span>
  );
};

export const StatsSection: React.FC = () => {
  return (
    <section style={{ background: "#0a0a0a" }}>
      {/* Stats row */}
      <div
        className="py-20 px-6"
        style={{
          borderTop: "1px solid rgba(201,168,76,0.08)",
          borderBottom: "1px solid rgba(201,168,76,0.08)",
        }}
      >
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="text-center"
            >
              <p
                className="font-display font-light mb-1 gold-text"
                style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
              >
                <Counter target={stat.value} suffix={stat.suffix} />
              </p>
              <p className="text-stone-500 text-sm font-body tracking-wider uppercase">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-gold-500 text-xs tracking-[0.4em] uppercase font-accent mb-4"
            >
              Client Stories
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="font-display text-5xl md:text-6xl font-light text-white"
            >
              What They <span className="gold-text italic">Say</span>
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                className="glass-card rounded-2xl p-8 relative"
              >
                <div
                  className="text-6xl font-display leading-none mb-4"
                  style={{ color: "rgba(201,168,76,0.2)", fontStyle: "italic" }}
                >
                  "
                </div>

                <p className="text-stone-400 text-sm font-body leading-relaxed mb-8 italic">
                  {t.text}
                </p>

                <div className="flex items-center gap-3">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-10 h-10 rounded-full object-cover"
                    style={{ border: "2px solid rgba(201,168,76,0.3)" }}
                  />
                  <div>
                    <p className="text-white text-sm font-body font-medium">{t.name}</p>
                    <p className="text-gold-500 text-xs font-body">{t.role}</p>
                  </div>
                </div>

                <div className="absolute top-6 right-6 flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <svg key={s} width="12" height="12" viewBox="0 0 24 24" fill="#C9A84C">
                      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                    </svg>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
