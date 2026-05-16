import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Quote, PenLine, Loader2, CheckCircle, AlertCircle, X } from "lucide-react";
import { fetchActiveTestimonials, type Testimonial, insertTestimonial } from "../../lib/supabase";

const StarDisplay: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        size={13}
        fill={s <= rating ? "#C9A84C" : "transparent"}
        stroke={s <= rating ? "#C9A84C" : "rgba(255,255,255,0.1)"}
      />
    ))}
  </div>
);

export const TestimonialsSection: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", role: "", rating: 5, message: "" });
  const [formStatus, setFormStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await fetchActiveTestimonials();
      setTestimonials(data || []);
      setLoading(false);
    })();
  }, []);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.message.trim()) return;

    setFormStatus("loading");
    setErrorMsg("");

    const { error } = await insertTestimonial({
      customer_name: form.name.trim(),
      customer_role: form.role.trim() || null,
      message: form.message.trim(),
      rating: form.rating,
      is_active: false, // Admin approval required
    });

    if (error) {
      setErrorMsg(error.message);
      setFormStatus("error");
    } else {
      setFormStatus("success");
      setForm({ name: "", role: "", rating: 5, message: "" });
      setTimeout(() => {
        setShowForm(false);
        setFormStatus("idle");
      }, 4000);
    }
  };

  const inputCls = "w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-body placeholder-stone-600 focus:outline-none focus:border-[rgba(201,168,76,0.4)] transition-colors appearance-none";

  return (
    <section id="testimonials" className="py-24 md:py-32 px-6" style={{ background: "#080808" }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-gold-500 text-xs tracking-[0.4em] uppercase font-accent mb-4"
          >
            What Clients Say
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="font-display text-5xl md:text-6xl font-light text-white"
          >
            Client <span className="gold-text italic">Reviews</span>
          </motion.h2>

          {!showForm && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setShowForm(true)}
              className="mt-8 px-6 py-2.5 rounded-full text-sm font-body font-medium text-black border-0 cursor-pointer transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, #C9A84C, #F5E68A)" }}
            >
              <PenLine size={16} className="inline-block mr-2 -mt-0.5" />
              Write a Review
            </motion.button>
          )}
        </div>

        {/* Review Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              className="overflow-hidden mb-16"
            >
              <div className="glass-card rounded-3xl p-8 md:p-10 border border-white/5 relative max-w-2xl mx-auto">
                <button
                  onClick={() => setShowForm(false)}
                  className="absolute top-6 right-6 text-stone-500 hover:text-white transition-colors cursor-pointer bg-transparent border-none"
                >
                  <X size={20} />
                </button>

                {formStatus === "success" ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-5" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}>
                      <CheckCircle size={28} style={{ color: "#4ade80" }} />
                    </div>
                    <h4 className="font-display text-2xl text-white mb-2">Thank you!</h4>
                    <p className="text-stone-400 font-body text-sm">Your review has been submitted and will appear after admin approval.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitReview} className="space-y-5">
                    <h3 className="font-display text-2xl text-white mb-6">Share your experience</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="text-xs text-stone-500 uppercase tracking-wider font-body mb-2 flex items-center gap-1.5 block">
                          Name <span style={{ color: "#C9A84C" }}>*</span>
                        </label>
                        <input required type="text" placeholder="e.g. Priya Sharma" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inputCls} />
                      </div>
                      <div>
                        <label className="text-xs text-stone-500 uppercase tracking-wider font-body mb-2 flex items-center gap-1.5 block">
                          Service / Role <span className="text-stone-600">(optional)</span>
                        </label>
                        <input type="text" placeholder="e.g. Bridal Makeup" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className={inputCls} />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-stone-500 uppercase tracking-wider font-body mb-2 block">
                        Rating <span style={{ color: "#C9A84C" }}>*</span>
                      </label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setForm({ ...form, rating: star })}
                            className="bg-transparent border-none cursor-pointer p-1 transition-transform hover:scale-110"
                          >
                            <Star size={24} fill={star <= form.rating ? "#C9A84C" : "transparent"} stroke={star <= form.rating ? "#C9A84C" : "rgba(255,255,255,0.2)"} />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-stone-500 uppercase tracking-wider font-body mb-2 block">
                        Review <span style={{ color: "#C9A84C" }}>*</span>
                      </label>
                      <textarea required rows={4} placeholder="Tell us about your experience..." value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} className={inputCls} style={{ resize: "none" }} />
                    </div>

                    {formStatus === "error" && (
                      <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-400">
                        <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                        <p className="text-sm font-body">{errorMsg}</p>
                      </div>
                    )}

                    <button type="submit" disabled={formStatus === "loading"} className="w-full py-3.5 rounded-xl font-body font-medium text-sm text-black border-0 cursor-pointer flex items-center justify-center gap-2 transition-all hover:scale-[1.01] disabled:opacity-70 disabled:cursor-not-allowed" style={{ background: "linear-gradient(135deg, #C9A84C, #F5E68A)" }}>
                      {formStatus === "loading" ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : "Submit Review"}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 rounded-full animate-spin"
              style={{ borderColor: "rgba(201,168,76,0.2)", borderTopColor: "#C9A84C" }} />
          </div>
        )}

        {/* Empty state */}
        {!loading && testimonials.length === 0 && (
          <div className="text-center py-16">
            <Quote size={36} className="mx-auto mb-4" style={{ color: "rgba(201,168,76,0.25)" }} />
            <p className="text-stone-500 text-sm font-body">
              Client reviews coming soon. Be the first to share your experience!
            </p>
          </div>
        )}

        {/* Cards */}
        {!loading && testimonials.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {testimonials.map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.55, delay: i * 0.08 }}
                  className="glass-card rounded-2xl p-7 flex flex-col gap-5 relative"
                  style={{ border: "1px solid rgba(201,168,76,0.1)" }}
                >
                  {/* Quote icon */}
                  <div
                    className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full"
                    style={{ background: "rgba(201,168,76,0.08)" }}
                  >
                    <Quote size={14} style={{ color: "#C9A84C" }} />
                  </div>

                  {/* Stars */}
                  <StarDisplay rating={t.rating} />

                  {/* Message */}
                  <p className="text-stone-300 text-sm font-body leading-relaxed flex-1">
                    "{t.message}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3 pt-3"
                    style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-display font-semibold"
                      style={{ background: "linear-gradient(135deg, #C9A84C, #F5E68A)", color: "#0a0a0a" }}
                    >
                      {t.customer_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white text-sm font-display">{t.customer_name}</p>
                      {t.customer_role && (
                        <p className="text-stone-500 text-xs font-body">{t.customer_role}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
};
