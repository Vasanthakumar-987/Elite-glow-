import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Services", href: "#services" },
  { label: "Gallery", href: "#gallery" },
  { label: "Locations", href: "#locations" },
  { label: "Booking", href: "#booking" },
  { label: "Contact", href: "#contact" },
];

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.header
        className="fixed top-0 left-0 right-0 z-40 transition-all duration-500"
        style={{
          background: scrolled
            ? "rgba(10,10,10,0.95)"
            : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: "none",
        }}
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-20">
          {/* Logo */}
          <a href="#home" className="flex items-center gap-3 no-underline">
            <div className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #C9A84C, #F5E68A)" }}>
              <span className="text-black font-accent font-bold text-xs">EG</span>
            </div>
            <span className="font-display text-xl text-white tracking-tight">
              Elite Glow <span className="gold-text font-medium">Salon</span>
            </span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-stone-400 hover:text-gold-500 transition-colors duration-300 tracking-wider font-body no-underline"
                style={{ letterSpacing: "0.05em" }}
              >
                {link.label}
              </a>
            ))}
            <a
              href="#booking"
              className="px-5 py-2 rounded-full text-sm font-body font-medium text-black no-underline transition-transform hover:scale-105"
              style={{ background: "linear-gradient(135deg, #C9A84C, #F5E68A)" }}
            >
              Book Now
            </a>
          </nav>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-white p-2 border-0 bg-transparent cursor-pointer"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-30 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/90 backdrop-blur-lg" onClick={() => setMobileOpen(false)} />
            <motion.nav
              className="absolute right-0 top-0 h-full w-72 flex flex-col justify-center gap-6 px-10"
              style={{ background: "rgba(12,12,12,0.98)", borderLeft: "1px solid rgba(201,168,76,0.15)" }}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <div className="mb-8">
                <span className="font-display text-2xl gold-text">Elite Glow Salon</span>
              </div>
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  className="text-lg text-stone-300 hover:text-gold-500 transition-colors font-body no-underline"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </motion.a>
              ))}
              <a
                href="#booking"
                className="mt-4 px-6 py-3 rounded-full text-center text-sm font-body font-medium text-black no-underline"
                style={{ background: "linear-gradient(135deg, #C9A84C, #F5E68A)" }}
                onClick={() => setMobileOpen(false)}
              >
                Book Now
              </a>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
