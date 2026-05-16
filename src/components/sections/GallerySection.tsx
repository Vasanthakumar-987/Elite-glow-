import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { SpotlightCard } from "../ui/spotlight-card";
import { fetchActiveGallery, type GalleryItem } from "../../lib/supabase";
import { Loader2, Image } from "lucide-react";

const STATIC_GALLERY = [
  { title: "Precision Hair Cut",  description: "Expertly sculpted cuts tailored to your facial structure and lifestyle.", image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&h=400&fit=crop", tag: "Hair",   price: "From ₹800"   },
  { title: "Luminous Skin Facial",description: "Deep-cleansing and brightening treatments for a glass-skin finish.",        image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&h=400&fit=crop", tag: "Skin",   price: "From ₹1,200" },
  { title: "Bridal Artistry",     description: "Timeless bridal looks that photograph beautifully from sunrise to reception.",image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=400&fit=crop", tag: "Bridal", price: "From ₹5,000" },
  { title: "Signature Balayage",  description: "Hand-painted highlights creating natural sun-kissed depth and dimension.",   image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=400&fit=crop", tag: "Color",  price: "From ₹3,500" },
  { title: "Gold Spa Ritual",     description: "Full-body indulgence with aromatic oils and restorative massage techniques.",image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&h=400&fit=crop", tag: "Spa",    price: "From ₹1,800" },
  { title: "Blowout & Style",     description: "Voluminous, frizz-free blowouts and elegant updos for every occasion.",     image: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=600&h=400&fit=crop", tag: "Hair",   price: "From ₹1,000" },
];

export const GallerySection: React.FC = () => {
  const [active, setActive] = useState("All");
  const [dbItems, setDbItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchGallery = async () => {
      setLoading(true);
      const { data, error } = await fetchActiveGallery();
      if (cancelled) return;

      if (error) {
        console.warn("GallerySection: fetch failed, using static fallback.", error.message);
      } else {
        // data is the FULL list of all active gallery items — never sliced or replaced
        setDbItems(data || []);
      }
      setLoading(false);
    };

    fetchGallery();
    return () => { cancelled = true; };
  }, []);

  // Build unified display list combining both DB and static
  const allItems = [
    ...STATIC_GALLERY,
    ...dbItems.map((g) => ({
      title: g.title,
      description: g.description || "",
      image: g.image_url,
      tag: g.category ?? "Gallery",
      price: (() => {
        if (!g.price) return undefined;
        const num = Number(g.price.replace(/[^0-9.-]+/g, ""));
        if (!isNaN(num) && num > 0) {
          return `From ${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(num)}`;
        }
        return g.price;
      })(),
    }))
  ];

  // Compute available categories dynamically from whichever source is active
  const categories = ["All", ...Array.from(new Set(allItems.map((g) => g.tag)))];

  const filtered = active === "All" ? allItems : allItems.filter((g) => g.tag === active);

  return (
    <section id="gallery" className="py-24 md:py-32 px-6" style={{ background: "#0a0a0a" }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-gold-500 text-xs tracking-[0.4em] uppercase font-accent mb-4">
            Our Portfolio
          </motion.p>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
            className="font-display text-5xl md:text-6xl font-light text-white mb-6">
            The <span className="gold-text italic">Gallery</span>
          </motion.h2>

          {/* Category filter */}
          <div className="flex flex-wrap justify-center gap-2 mt-8">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setActive(cat)}
                className="px-5 py-2 rounded-full text-sm font-body transition-all duration-300 border-0 cursor-pointer"
                style={{
                  background: active === cat ? "linear-gradient(135deg, #C9A84C, #F5E68A)" : "rgba(255,255,255,0.04)",
                  color: active === cat ? "#0a0a0a" : "#a8a29e",
                  border: active === cat ? "none" : "1px solid rgba(201,168,76,0.15)",
                  fontWeight: active === cat ? "500" : "400",
                }}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Loading / empty / grid */}
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 size={28} className="text-gold-500 animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Image size={36} className="mx-auto mb-4" style={{ color: "rgba(201,168,76,0.25)" }} />
            <p className="text-stone-500 text-sm font-body">No gallery items in this category yet.</p>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item, i) => (
              <motion.div key={(item.title ?? "") + i} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }} transition={{ duration: 0.4, delay: i * 0.06 }}>
                <SpotlightCard title={item.title ?? ""} description={item.description} image={item.image} price={item.price} tag={item.tag} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
};
