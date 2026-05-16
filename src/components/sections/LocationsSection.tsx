import { motion } from "framer-motion";
import { MapPin, Phone, Clock } from "lucide-react";

const branches = [
  {
    name: "Anna Nagar Flagship",
    address: "47, 2nd Avenue, Anna Nagar, Chennai – 600040",
    phone: "9042414664",
    hours: "Mon–Sat: 9:00 AM – 8:00 PM\nSun: 10:00 AM – 6:00 PM",
    badge: "Flagship",
  },
  {
    name: "Adyar Branch",
    address: "12, Gandhi Nagar Main Rd, Adyar, Chennai – 600020",
    phone: "9042414665",
    hours: "Mon–Sat: 9:00 AM – 8:00 PM\nSun: 10:00 AM – 6:00 PM",
  },
  {
    name: "T. Nagar Studio",
    address: "88, Usman Road, T. Nagar, Chennai – 600017",
    phone: "9042414666",
    hours: "Mon–Sat: 9:30 AM – 8:30 PM\nSun: 11:00 AM – 6:00 PM",
  },
];

export const LocationsSection: React.FC = () => {
  return (
    <section id="locations" className="py-24 md:py-32 px-6" style={{ background: "#0d0d0d" }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-gold-500 text-xs tracking-[0.4em] uppercase font-accent mb-4"
          >
            Find Us
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="font-display text-5xl md:text-6xl font-light text-white"
          >
            Our <span className="gold-text italic">Locations</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {branches.map((branch, i) => (
            <motion.div
              key={branch.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="glass-card rounded-2xl p-8 relative overflow-hidden group hover:border-gold-500/30 transition-all duration-300"
            >
              {branch.badge && (
                <div className="absolute top-5 right-5 px-3 py-1 rounded-full text-xs font-accent"
                  style={{ background: "rgba(201,168,76,0.15)", border: "1px solid rgba(201,168,76,0.4)", color: "#C9A84C" }}>
                  {branch.badge}
                </div>
              )}

              {/* Decorative accent */}
              <div className="absolute bottom-0 left-0 h-px w-0 group-hover:w-full transition-all duration-500"
                style={{ background: "linear-gradient(to right, #C9A84C, transparent)" }} />

              <h3 className="font-display text-2xl font-light text-white mb-6 group-hover:text-gold-400 transition-colors">
                {branch.name}
              </h3>

              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="mt-0.5 flex-shrink-0" style={{ color: "#C9A84C" }} />
                  <p className="text-stone-400 text-sm font-body leading-relaxed">{branch.address}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={16} className="flex-shrink-0" style={{ color: "#C9A84C" }} />
                  <a href={`tel:${branch.phone}`} className="text-stone-400 text-sm font-body hover:text-gold-500 transition-colors no-underline">
                    {branch.phone}
                  </a>
                </div>
                <div className="flex items-start gap-3">
                  <Clock size={16} className="mt-0.5 flex-shrink-0" style={{ color: "#C9A84C" }} />
                  <div className="text-stone-400 text-sm font-body leading-relaxed whitespace-pre-line">
                    {branch.hours}
                  </div>
                </div>
              </div>

              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(branch.address)}`}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex items-center gap-2 text-xs text-gold-500 font-body hover:text-gold-400 transition-colors no-underline"
              >
                <MapPin size={12} />
                Get Directions
              </a>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
