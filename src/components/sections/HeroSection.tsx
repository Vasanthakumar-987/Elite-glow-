import { motion } from "framer-motion";
import { ShapeLandingHero } from "../ui/shape-landing-hero";
import { ArrowRight, Star } from "lucide-react";

export const HeroSection: React.FC = () => {
  return (
    <section id="home">
      <ShapeLandingHero
        title="Elite Glow Salon"
        subtitle="Luxury Beauty & Care Experience"
      >
        {/* CTA group */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1 }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <a
            href="#booking"
            className="group flex items-center gap-2 px-8 py-4 rounded-full font-body font-medium text-black no-underline transition-all duration-300 hover:shadow-2xl hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #C9A84C 0%, #F5E68A 50%, #C9A84C 100%)",
              backgroundSize: "200% auto",
              boxShadow: "0 8px 32px rgba(201,168,76,0.3)",
            }}
          >
            Book Appointment
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </a>
          <a
            href="#services"
            className="flex items-center gap-2 px-8 py-4 rounded-full font-body text-sm text-stone-300 no-underline transition-colors hover:text-white"
            style={{ border: "1px solid rgba(201,168,76,0.25)" }}
          >
            Explore Services
          </a>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="mt-16 flex items-center gap-6"
        >
          <div className="flex -space-x-3">
            {[
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&h=60&fit=crop",
              "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=60&h=60&fit=crop",
              "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=60&h=60&fit=crop",
            ].map((src, i) => (
              <img
                key={i}
                src={src}
                alt="Client"
                className="w-9 h-9 rounded-full object-cover ring-2"
                style={{ outline: "2px solid #0a0a0a" }}
              />
            ))}
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={12} fill="#C9A84C" stroke="none" />
              ))}
            </div>
            <p className="text-xs text-stone-400 font-body mt-0.5">
              Trusted by <span className="text-gold-500 font-medium">2,400+</span> clients
            </p>
          </div>
        </motion.div>
      </ShapeLandingHero>
    </section>
  );
};
