import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import emailjs from "@emailjs/browser";
import {
  Mail, Phone, MapPin, Send, CheckCircle,
  AlertCircle, Loader2, MessageCircle, Sparkles, Clock,
} from "lucide-react";

const EMAILJS_SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID  || "service_tvpyx6f";
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "template_t8u57ro";
const EMAILJS_PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY  || "iw3Ufh456GCdMMn4o";

const EMPTY_FORM = { from_name: "", reply_to: "", phone: "", message: "" };

/* ── Floating-label input ───────────────────────────────────────── */
interface FloatInputProps {
  id: string;
  label: string;
  type?: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}
const FloatInput: React.FC<FloatInputProps> = ({
  id, label, type = "text", required, value, onChange, placeholder,
}) => {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;

  return (
    <div className="relative group">
      {/* animated gold border */}
      <div
        className="absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-300"
        style={{
          opacity: focused ? 1 : 0,
          background: "linear-gradient(135deg,#C9A84C,#F5E68A,#C9A84C)",
          padding: "1px",
          borderRadius: "12px",
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />
      <input
        id={id}
        type={type}
        required={required}
        value={value}
        placeholder={active ? (placeholder ?? "") : ""}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(e) => onChange(e.target.value)}
        className="peer w-full pt-6 pb-2 px-4 rounded-xl text-white text-sm font-body focus:outline-none transition-all duration-200"
        style={{
          background: focused ? "rgba(201,168,76,0.06)" : "rgba(255,255,255,0.03)",
          border: focused
            ? "1px solid transparent"
            : "1px solid rgba(255,255,255,0.08)",
        }}
        autoComplete="off"
      />
      <label
        htmlFor={id}
        className="absolute left-4 pointer-events-none transition-all duration-200 font-body"
        style={{
          top: active ? "8px" : "50%",
          transform: active ? "none" : "translateY(-50%)",
          fontSize: active ? "10px" : "13px",
          letterSpacing: active ? "0.12em" : "0",
          textTransform: active ? "uppercase" : "none",
          color: focused ? "#C9A84C" : "#57534e",
        }}
      >
        {label}{required && <span style={{ color: "#C9A84C" }}> *</span>}
      </label>
    </div>
  );
};

/* ── Floating-label textarea ────────────────────────────────────── */
interface FloatTextareaProps {
  id: string;
  label: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}
const FloatTextarea: React.FC<FloatTextareaProps> = ({
  id, label, required, value, onChange, rows = 5,
}) => {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;

  return (
    <div className="relative group">
      <div
        className="absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-300"
        style={{
          opacity: focused ? 1 : 0,
          background: "linear-gradient(135deg,#C9A84C,#F5E68A,#C9A84C)",
          padding: "1px",
          borderRadius: "12px",
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />
      <textarea
        id={id}
        required={required}
        value={value}
        rows={rows}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pt-8 pb-3 px-4 rounded-xl text-white text-sm font-body focus:outline-none transition-all duration-200"
        style={{
          background: focused ? "rgba(201,168,76,0.06)" : "rgba(255,255,255,0.03)",
          border: focused
            ? "1px solid transparent"
            : "1px solid rgba(255,255,255,0.08)",
          resize: "none",
        }}
      />
      <label
        htmlFor={id}
        className="absolute left-4 pointer-events-none transition-all duration-200 font-body"
        style={{
          top: active ? "10px" : "22px",
          fontSize: active ? "10px" : "13px",
          letterSpacing: active ? "0.12em" : "0",
          textTransform: active ? "uppercase" : "none",
          color: focused ? "#C9A84C" : "#57534e",
        }}
      >
        {label}{required && <span style={{ color: "#C9A84C" }}> *</span>}
      </label>
    </div>
  );
};

/* ── Main Section ───────────────────────────────────────────────── */
export const ContactSection: React.FC = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.from_name.trim() || !form.reply_to.trim() || !form.message.trim()) return;
    setStatus("loading");
    setErrorMsg("");
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name: form.from_name.trim(),
          reply_to:  form.reply_to.trim(),
          phone:     form.phone.trim() || "Not provided",
          message:   form.message.trim(),
          to_name:   "Elite Glow Salon",
        },
        EMAILJS_PUBLIC_KEY,
      );
      setStatus("success");
      setForm(EMPTY_FORM);
    } catch (err: unknown) {
      console.error("EmailJS error:", err);
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg || "Failed to send. Please try WhatsApp instead.");
      setStatus("error");
    }
  };

  const openWhatsApp = () => {
    const text = encodeURIComponent(
      `Hello Elite Glow Salon! ✨\n\nI'd like to get in touch.\n\n*Name:* ${form.from_name || "—"}\n*Email:* ${form.reply_to || "—"}\n*Phone:* ${form.phone || "—"}\n\n*Message:* ${form.message || "—"}`
    );
    window.open(`https://wa.me/919042414664?text=${text}`, "_blank");
  };

  return (
    <section id="contact" className="py-28 px-4 relative overflow-hidden">

      {/* ── Atmospheric background ─────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none">
        {/* top-left warm glow */}
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)" }} />
        {/* bottom-right cool glow */}
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(201,168,76,0.04) 0%, transparent 70%)" }} />
        {/* subtle horizontal rule */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-32"
          style={{ background: "linear-gradient(to bottom, transparent, rgba(201,168,76,0.3), transparent)" }} />
      </div>

      <div className="max-w-6xl mx-auto relative">

        {/* ── Header ────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="h-px w-12" style={{ background: "linear-gradient(to right, transparent, #C9A84C)" }} />
            <Sparkles size={14} style={{ color: "#C9A84C" }} />
            <p className="text-[11px] font-accent uppercase tracking-[0.35em]" style={{ color: "#C9A84C" }}>
              Get In Touch
            </p>
            <Sparkles size={14} style={{ color: "#C9A84C" }} />
            <div className="h-px w-12" style={{ background: "linear-gradient(to left, transparent, #C9A84C)" }} />
          </div>
          <h2 className="font-display text-5xl md:text-6xl font-light text-white mb-5 leading-tight">
            Contact{" "}
            <span style={{
              background: "linear-gradient(135deg, #C9A84C 0%, #F5E68A 50%, #C9A84C 100%)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontStyle: "italic",
            }}>
              Us
            </span>
          </h2>
          <p className="text-stone-400 font-body text-base max-w-sm mx-auto leading-relaxed">
            Let us craft your perfect look. Our team responds within 2 hours.
          </p>
        </motion.div>

        {/* ── Two-column layout ─────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

          {/* ── LEFT: Info panel ──────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="lg:col-span-2 flex flex-col gap-5"
          >
            {/* Brand card */}
            <div className="rounded-3xl overflow-hidden relative"
              style={{
                background: "linear-gradient(145deg, rgba(201,168,76,0.12) 0%, rgba(201,168,76,0.04) 100%)",
                border: "1px solid rgba(201,168,76,0.2)",
              }}
            >
              {/* decorative corner lines */}
              <div className="absolute top-0 left-0 w-16 h-16 pointer-events-none">
                <div className="absolute top-4 left-4 w-8 h-px" style={{ background: "#C9A84C" }} />
                <div className="absolute top-4 left-4 w-px h-8" style={{ background: "#C9A84C" }} />
              </div>
              <div className="absolute bottom-0 right-0 w-16 h-16 pointer-events-none">
                <div className="absolute bottom-4 right-4 w-8 h-px" style={{ background: "#C9A84C" }} />
                <div className="absolute bottom-4 right-4 w-px h-8" style={{ background: "#C9A84C" }} />
              </div>

              <div className="p-8">
                <p className="text-[10px] uppercase tracking-[0.25em] font-accent mb-1" style={{ color: "#C9A84C" }}>
                  Elite Glow Salon
                </p>
                <p className="font-display text-2xl text-white font-light mb-6 italic">
                  "Where beauty meets artistry"
                </p>

                {/* divider */}
                <div className="h-px mb-6" style={{ background: "linear-gradient(to right, rgba(201,168,76,0.4), transparent)" }} />

                {/* contact info */}
                <div className="space-y-5">
                  {[
                    { icon: <Phone size={15} />, label: "Phone", value: "+91 90424 14664", href: "tel:+919042414664" },
                    { icon: <Mail size={15} />, label: "Email", value: "vasanthakumarr412@gmail.com", href: "mailto:vasanthakumarr412@gmail.com" },
                    { icon: <MapPin size={15} />, label: "Location", value: "Tamil Nadu, India", href: undefined },
                    { icon: <Clock size={15} />, label: "Hours", value: "Mon – Sat, 9 AM – 7 PM", href: undefined },
                  ].map(({ icon, label, value, href }) => (
                    <div key={label} className="flex items-center gap-4 group">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110"
                        style={{
                          background: "rgba(201,168,76,0.1)",
                          border: "1px solid rgba(201,168,76,0.25)",
                          color: "#C9A84C",
                        }}
                      >
                        {icon}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-widest font-body mb-0.5" style={{ color: "#C9A84C", opacity: 0.7 }}>
                          {label}
                        </p>
                        {href ? (
                          <a href={href} className="text-stone-300 font-body text-sm hover:text-white transition-colors truncate block">
                            {value}
                          </a>
                        ) : (
                          <p className="text-stone-300 font-body text-sm truncate">{value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* WhatsApp CTA */}
            <motion.button
              onClick={openWhatsApp}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-body font-semibold text-sm text-white border-0 cursor-pointer relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
                boxShadow: "0 8px 32px rgba(37,211,102,0.3)",
              }}
            >
              {/* shimmer */}
              <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500"
                style={{ background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)" }} />
              <MessageCircle size={18} />
              <span>Chat on WhatsApp</span>
            </motion.button>

            {/* quote */}
            <p className="text-center font-body text-xs italic leading-relaxed px-2"
              style={{ color: "rgba(201,168,76,0.5)" }}>
              "Beauty begins the moment you decide to be yourself."
              <br />
              <span className="not-italic font-medium" style={{ color: "rgba(201,168,76,0.35)" }}>— Coco Chanel</span>
            </p>
          </motion.div>

          {/* ── RIGHT: Form ───────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-3"
          >
            <AnimatePresence mode="wait">

              {/* ── Success state ── */}
              {status === "success" ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.93 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="rounded-3xl p-14 text-center flex flex-col items-center justify-center"
                  style={{
                    background: "linear-gradient(145deg, rgba(34,197,94,0.07) 0%, rgba(0,0,0,0) 100%)",
                    border: "1px solid rgba(34,197,94,0.2)",
                    minHeight: "480px",
                  }}
                >
                  {/* animated ring */}
                  <div className="relative w-24 h-24 mx-auto mb-8">
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{ border: "1px solid rgba(34,197,94,0.3)" }}
                      animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2.5, repeat: Infinity }}
                    />
                    <div className="w-24 h-24 rounded-full flex items-center justify-center"
                      style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)" }}>
                      <CheckCircle size={38} style={{ color: "#4ade80" }} />
                    </div>
                  </div>
                  <p className="text-[10px] uppercase tracking-[0.25em] font-accent mb-3" style={{ color: "#4ade80", opacity: 0.7 }}>
                    Message Delivered
                  </p>
                  <h3 className="font-display text-3xl text-white mb-4 font-light">
                    Thank You!
                  </h3>
                  <p className="text-stone-400 font-body text-sm max-w-xs mx-auto leading-relaxed mb-10">
                    Your message has been sent to Elite Glow Salon. We'll get back to you within 2 hours.
                  </p>
                  <button
                    onClick={() => setStatus("idle")}
                    className="px-10 py-3 rounded-xl text-sm font-body font-semibold text-black border-0 cursor-pointer transition-all hover:scale-[1.03] hover:shadow-xl"
                    style={{
                      background: "linear-gradient(135deg, #C9A84C, #F5E68A)",
                      boxShadow: "0 8px 32px rgba(201,168,76,0.3)",
                    }}
                  >
                    Send Another Message
                  </button>
                </motion.div>

              ) : (
                /* ── Form state ── */
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="rounded-3xl overflow-hidden"
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      backdropFilter: "blur(20px)",
                    }}
                  >
                    {/* Form header strip */}
                    <div className="px-8 pt-8 pb-6 border-b"
                      style={{ borderColor: "rgba(201,168,76,0.1)" }}>
                      <p className="text-[10px] uppercase tracking-[0.25em] font-accent mb-1.5" style={{ color: "#C9A84C" }}>
                        Send a Message
                      </p>
                      <p className="text-white font-display text-xl font-light">
                        We'd love to hear from you
                      </p>
                    </div>

                    <form ref={formRef} onSubmit={handleSubmit} className="p-8 space-y-5">

                      {/* Name + Email row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FloatInput
                          id="contact-name"
                          label="Full Name"
                          required
                          value={form.from_name}
                          onChange={(v) => setForm({ ...form, from_name: v })}
                          placeholder="e.g. Priya Sharma"
                        />
                        <FloatInput
                          id="contact-email"
                          label="Email Address"
                          type="email"
                          required
                          value={form.reply_to}
                          onChange={(v) => setForm({ ...form, reply_to: v })}
                          placeholder="you@email.com"
                        />
                      </div>

                      {/* Phone */}
                      <FloatInput
                        id="contact-phone"
                        label="Phone Number (optional)"
                        type="tel"
                        value={form.phone}
                        onChange={(v) => setForm({ ...form, phone: v })}
                        placeholder="+91 98765 43210"
                      />

                      {/* Message */}
                      <FloatTextarea
                        id="contact-message"
                        label="Your Message"
                        required
                        value={form.message}
                        onChange={(v) => setForm({ ...form, message: v })}
                        rows={5}
                      />

                      {/* Error banner */}
                      <AnimatePresence>
                        {status === "error" && (
                          <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="flex items-start gap-3 p-4 rounded-xl"
                            style={{
                              background: "rgba(239,68,68,0.07)",
                              border: "1px solid rgba(239,68,68,0.2)",
                            }}
                          >
                            <AlertCircle size={15} className="flex-shrink-0 mt-0.5" style={{ color: "#f87171" }} />
                            <div>
                              <p className="text-sm font-body font-semibold text-red-400">Could not send email</p>
                              <p className="text-xs font-body text-red-400/60 mt-0.5">{errorMsg}</p>
                              <p className="text-xs font-body mt-1" style={{ color: "rgba(201,168,76,0.6)" }}>
                                Try the WhatsApp button — it always works instantly.
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Action buttons */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        {/* Email submit */}
                        <motion.button
                          type="submit"
                          disabled={status === "loading"}
                          whileHover={{ scale: status === "loading" ? 1 : 1.02 }}
                          whileTap={{ scale: status === "loading" ? 1 : 0.98 }}
                          className="relative overflow-hidden py-4 rounded-2xl font-body font-semibold text-sm text-black border-0 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                          style={{
                            background: "linear-gradient(135deg, #C9A84C 0%, #F5E68A 50%, #C9A84C 100%)",
                            backgroundSize: "200% auto",
                            boxShadow: "0 8px 32px rgba(201,168,76,0.3)",
                            transition: "background-position 0.5s, box-shadow 0.3s",
                          }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundPosition = "right center"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundPosition = "left center"; }}
                        >
                          {status === "loading" ? (
                            <><Loader2 size={15} className="animate-spin" /> Sending…</>
                          ) : (
                            <><Send size={15} /> Send Message</>
                          )}
                        </motion.button>

                        {/* WhatsApp */}
                        <motion.button
                          type="button"
                          onClick={openWhatsApp}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="py-4 rounded-2xl font-body font-semibold text-sm text-white border-0 cursor-pointer flex items-center justify-center gap-2"
                          style={{
                            background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
                            boxShadow: "0 8px 28px rgba(37,211,102,0.2)",
                          }}
                        >
                          <MessageCircle size={15} /> Chat on WhatsApp
                        </motion.button>
                      </div>

                      {/* Privacy note */}
                      <p className="text-center font-body text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.2)" }}>
                        By submitting, you agree to be contacted by Elite Glow Salon. We respect your privacy.
                      </p>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
