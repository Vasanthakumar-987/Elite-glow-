import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiHome, FiScissors, FiImage, FiMapPin, FiMail } from "react-icons/fi";
import { FiMenu, FiX } from "react-icons/fi";

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  href: string;
}

const menuItems: MenuItem[] = [
  { label: "Home", icon: <FiHome size={18} />, href: "#home" },
  { label: "Services", icon: <FiScissors size={18} />, href: "#services" },
  { label: "Gallery", icon: <FiImage size={18} />, href: "#gallery" },
  { label: "Locations", icon: <FiMapPin size={18} />, href: "#locations" },
  { label: "Contact", icon: <FiMail size={18} />, href: "#contact" },
];

export const GradientMenu: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="flex flex-col gap-2 mb-2"
          >
            {menuItems.map((item, i) => (
              <motion.a
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2, delay: i * 0.04 }}
                className="flex items-center gap-3 px-4 py-2.5 rounded-full text-sm font-body font-medium text-white/90 no-underline group hover:text-gold-400 transition-colors"
                style={{
                  background: "rgba(18,18,18,0.92)",
                  border: "1px solid rgba(201,168,76,0.25)",
                  backdropFilter: "blur(12px)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
                }}
              >
                <span className="text-gold-500 group-hover:scale-110 transition-transform">
                  {item.icon}
                </span>
                {item.label}
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 rounded-full flex items-center justify-center text-black font-medium cursor-pointer border-0"
        style={{
          background: "linear-gradient(135deg, #C9A84C 0%, #F5E68A 50%, #C9A84C 100%)",
          backgroundSize: "200% 200%",
          boxShadow: "0 8px 32px rgba(201,168,76,0.35)",
          animation: open ? "none" : "shimmer-btn 3s linear infinite",
        }}
        aria-label="Menu"
      >
        <motion.div animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.25 }}>
          {open ? <FiX size={22} /> : <FiMenu size={22} />}
        </motion.div>
      </motion.button>

      <style>{`
        @keyframes shimmer-btn {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
};
