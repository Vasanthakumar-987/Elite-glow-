import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Scissors, Sparkles, Heart, Droplets, Palette, Loader2 } from "lucide-react";
import { fetchActiveServices, type Service } from "../../lib/supabase";

// Fallback static icon per category/index (used when Supabase has no data yet)
const ICONS = [
  <Scissors size={24} />, <Sparkles size={24} />, <Heart size={24} />,
  <Droplets size={24} />, <Palette size={24} />,
];

// Static fallbacks displayed ONLY when Supabase services table is empty
const STATIC_SERVICES = [
  { title: "Hair Styling",       description: "Precision cuts, blowouts, and styling crafted for your unique texture and face shape.",                              price: "From ₹800",  duration: "45–90 min" },
  { title: "Facial & Skin Care", description: "Restorative facials and skin treatments using medical-grade products for radiant results.",                          price: "From ₹1,200", duration: "60 min"    },
  { title: "Bridal Makeup",      description: "All-day wear bridal looks designed to photograph beautifully and last from ceremony to reception.",                   price: "From ₹5,000", duration: "2–3 hrs"   },
  { title: "Spa & Relaxation",   description: "Full-body treatments, aromatherapy, and deep-tissue massage for complete rejuvenation.",                              price: "From ₹1,800", duration: "90 min"    },
  { title: "Hair Coloring",      description: "Balayage, highlights, and full-color services using ammonia-free premium formulas.",                                  price: "From ₹2,500", duration: "90–180 min"},
];

const formatPrice = (price: number) =>
  `From ₹${price.toLocaleString("en-IN")}`;

const formatDuration = (mins: number | null) => {
  if (!mins) return null;
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60), m = mins % 60;
  return m ? `${h}h ${m}min` : `${h} hr${h > 1 ? "s" : ""}`;
};

export const ServicesSection: React.FC = () => {
  const [dbServices, setDbServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchServices = async () => {
      setLoading(true);
      const { data, error } = await fetchActiveServices();
      if (cancelled) return;

      if (error) {
        console.warn("ServicesSection: fetch failed, using static fallback.", error.message);
      } else {
        // data is the FULL list of all active services — never sliced or replaced
        setDbServices(data || []);
      }
      setLoading(false);
    };

    fetchServices();
    return () => { cancelled = true; };
  }, []);

  // Always combine static fallbacks with DB services so "previous" services don't disappear
  const combinedServices = [
    ...STATIC_SERVICES.map((s, i) => ({ ...s, icon: ICONS[i], category: null })),
    ...dbServices.map((s, i) => ({
      icon: ICONS[(i + STATIC_SERVICES.length) % ICONS.length],
      title: s.name,
      description: s.description ?? "",
      price: formatPrice(s.price),
      duration: formatDuration(s.duration_minutes),
      category: s.category,
    })),
  ];

  const serviceCards = combinedServices;

  return (
    <section id="services" className="py-24 md:py-32 px-6" style={{ background: "#0d0d0d" }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-gold-500 text-xs tracking-[0.4em] uppercase font-accent mb-4">
            Our Expertise
          </motion.p>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
            className="font-display text-5xl md:text-6xl font-light text-white mb-4">
            Premium <span className="gold-text italic">Services</span>
          </motion.h2>
          <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.3 }}
            className="h-px w-24 mx-auto" style={{ background: "linear-gradient(to right, transparent, #C9A84C, transparent)" }} />
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={28} className="text-gold-500 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {serviceCards.map((service, i) => (
              <motion.div key={service.title + i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6, delay: i * 0.1 }}
                className="glass-card rounded-2xl p-8 group hover:border-gold-500/30 transition-all duration-300 cursor-pointer flex flex-col h-full" whileHover={{ y: -4 }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 text-gold-500 group-hover:scale-110 transition-transform duration-300"
                  style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)" }}>
                  {service.icon}
                </div>
                {service.category && (
                  <span className="text-[10px] font-accent tracking-wider px-2 py-0.5 rounded-full mb-3 inline-block"
                    style={{ background: "rgba(201,168,76,0.08)", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.2)" }}>
                    {service.category}
                  </span>
                )}
                <h3 className="font-display text-2xl font-light text-white mb-3 group-hover:text-gold-400 transition-colors">{service.title}</h3>
                {service.description && <p className="text-stone-400 text-sm leading-relaxed font-body mb-6 flex-1">{service.description}</p>}
                <div className="flex items-center justify-between pt-4 mt-auto" style={{ borderTop: "1px solid rgba(201,168,76,0.1)" }}>
                  <span className="text-gold-500 font-medium font-body text-sm">{service.price}</span>
                  {service.duration && <span className="text-stone-500 text-xs font-body">{service.duration}</span>}
                </div>
              </motion.div>
            ))}

            {/* Custom Package card */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: serviceCards.length * 0.1 }}
              className="rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer h-full"
              style={{ background: "linear-gradient(135deg, rgba(201,168,76,0.12), rgba(201,168,76,0.04))", border: "1px solid rgba(201,168,76,0.25)" }}
              whileHover={{ y: -4, scale: 1.01 }}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ background: "linear-gradient(135deg, #C9A84C, #F5E68A)" }}>
                <span className="text-black font-bold text-xl">+</span>
              </div>
              <h3 className="font-display text-xl text-white mb-2">Custom Package</h3>
              <p className="text-stone-400 text-sm mb-6 font-body">Combine multiple services for a tailored luxury experience.</p>
              <a href="#contact" className="px-6 py-2.5 rounded-full text-sm font-body font-medium text-black no-underline hover:scale-105 transition-transform"
                style={{ background: "linear-gradient(135deg, #C9A84C, #F5E68A)" }}>
                Enquire Now
              </a>
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
};
