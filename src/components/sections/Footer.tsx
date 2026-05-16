import { motion } from "framer-motion";
import { FiInstagram, FiFacebook, FiTwitter, FiYoutube } from "react-icons/fi";

const socials = [
  { icon: <FiInstagram size={18} />, href: "#", label: "Instagram" },
  { icon: <FiFacebook size={18} />, href: "#", label: "Facebook" },
  { icon: <FiTwitter size={18} />, href: "#", label: "Twitter" },
  { icon: <FiYoutube size={18} />, href: "#", label: "YouTube" },
];

const footerLinks = [
  { label: "Services", href: "#services" },
  { label: "Gallery", href: "#gallery" },
  { label: "Locations", href: "#locations" },
  { label: "Contact", href: "#contact" },
];

export const Footer: React.FC = () => {
  return (
    <footer style={{ background: "#080808", borderTop: "1px solid rgba(201,168,76,0.12)" }}>
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #C9A84C, #F5E68A)" }}>
                <span className="text-black font-accent font-bold text-xs">EG</span>
              </div>
              <span className="font-display text-xl text-white">
                Elite Glow <span className="gold-text font-medium">Salon</span>
              </span>
            </div>
            <p className="text-stone-500 text-sm font-body leading-relaxed max-w-xs">
              Chennai's premier luxury salon experience. Where beauty meets precision and every visit is a ritual.
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="text-xs text-stone-600 uppercase tracking-[0.3em] font-accent mb-5">Navigation</p>
            <ul className="space-y-3 list-none p-0 m-0">
              {footerLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href}
                    className="text-stone-400 text-sm font-body hover:text-gold-500 transition-colors no-underline">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs text-stone-600 uppercase tracking-[0.3em] font-accent mb-5">Contact</p>
            <div className="space-y-3">
              <a href="tel:9042414664" className="block text-stone-400 text-sm font-body hover:text-gold-500 transition-colors no-underline">
                9042414664
              </a>
              <a href="mailto:vasanthakumarr412@gmail.com" className="block text-stone-400 text-sm font-body hover:text-gold-500 transition-colors no-underline break-all">
                vasanthakumarr412@gmail.com
              </a>
              <p className="text-stone-500 text-sm font-body">Mon–Sat: 9:00 AM – 8:00 PM</p>
            </div>

            {/* Socials */}
            <div className="flex items-center gap-3 mt-6">
              {socials.map((s) => (
                <motion.a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  whileHover={{ y: -2, color: "#C9A84C" }}
                  className="text-stone-600 hover:text-gold-500 transition-colors no-underline"
                >
                  {s.icon}
                </motion.a>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px mb-8" style={{ background: "linear-gradient(to right, transparent, rgba(201,168,76,0.2), transparent)" }} />

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-600 font-body">
          <p>© 2026 Elite Glow Salon. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-stone-400 transition-colors no-underline">Privacy Policy</a>
            <a href="#" className="hover:text-stone-400 transition-colors no-underline">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
