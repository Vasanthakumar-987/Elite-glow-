import { useRef, useState } from "react";
import { motion } from "framer-motion";

interface SpotlightCardProps {
  title: string;
  description: string;
  image: string;
  price?: string;
  tag?: string;
  className?: string;
}

export const SpotlightCard: React.FC<SpotlightCardProps> = ({
  title,
  description,
  image,
  price,
  tag,
  className = "",
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [spotlight, setSpotlight] = useState({ x: 0, y: 0, visible: false });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    setSpotlight({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      visible: true,
    });
  };

  return (
    <motion.div
      ref={cardRef}
      className={`relative overflow-hidden rounded-2xl cursor-pointer group flex flex-col h-full ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setSpotlight((s) => ({ ...s, visible: false }))}
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(201,168,76,0.15)",
      }}
    >
      {/* Spotlight effect */}
      {spotlight.visible && (
        <div
          className="absolute inset-0 pointer-events-none z-10 transition-opacity"
          style={{
            background: `radial-gradient(250px circle at ${spotlight.x}px ${spotlight.y}px, rgba(201,168,76,0.08), transparent 70%)`,
          }}
        />
      )}

      {/* Image */}
      <div className="relative aspect-[4/5] overflow-hidden flex-shrink-0">
        <motion.img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.08 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(10,10,10,0.8) 0%, transparent 60%)" }}
        />
        {tag && (
          <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs tracking-widest font-accent"
            style={{ background: "rgba(201,168,76,0.15)", border: "1px solid rgba(201,168,76,0.4)", color: "#C9A84C" }}>
            {tag}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-display text-2xl font-light text-white group-hover:text-gold-500 transition-colors duration-300">
            {title}
          </h3>
          {price && (
            <span className="text-gold-500 font-body font-medium text-sm ml-2 whitespace-nowrap">
              {price}
            </span>
          )}
        </div>
        <p className="text-stone-400 text-sm leading-relaxed font-body flex-1">
          {description}
        </p>

        {/* Bottom line */}
        <motion.div
          className="mt-4 mt-auto h-px"
          style={{ background: "linear-gradient(to right, #C9A84C, transparent)" }}
          initial={{ scaleX: 0, originX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        />
      </div>
    </motion.div>
  );
};
