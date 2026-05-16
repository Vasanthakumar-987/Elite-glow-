import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Phone, Mail, Send, Check, MessageCircle, AlertCircle } from "lucide-react";
import { insertContact } from "../../lib/supabase";

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || "919042414664"; // country code + number, no +

export const ContactSection: React.FC = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [emailStatus, setEmailStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [waError, setWaError] = useState("");
  const [apiError, setApiError] = useState(""); // stores actual Brevo error for display

  // ─── Validate form locally ───────────────────────────────────────────────────
  const validateForm = (): string | null => {
    if (!form.name.trim()) return "Please enter your name.";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return "Please enter a valid email address.";
    if (!form.message.trim() || form.message.trim().length < 10)
      return "Please enter a message (at least 10 characters).";
    return null;
  };

  // ─── Email via Brevo ─────────────────────────────────────────────────────────
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateForm();
    if (err) { setWaError(err); setTimeout(() => setWaError(""), 4000); return; }

    setEmailStatus("loading");
    setApiError("");

    // 1. Persist to Supabase
    const { error: dbError } = await insertContact(form);
    if (dbError) {
      console.error("Supabase insert error:", dbError);
      setEmailStatus("error");
      setTimeout(() => setEmailStatus("idle"), 4000);
      return;
    }

    // 2. Send via Brevo transactional email API
    try {
      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          accept: "application/json",
          "api-key": import.meta.env.VITE_BREVO_API_KEY || "",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          sender: {
            // IMPORTANT: This email MUST be a verified sender in your Brevo account.
            // Go to Brevo → Senders & IPs → Add & verify this address.
            name: "Elite Glow Salon",
            email: import.meta.env.VITE_SENDER_EMAIL || "vasanthakumarr412@gmail.com",
          },
          replyTo: { name: form.name, email: form.email },
          to: [
            {
              email: import.meta.env.VITE_RECIPIENT_EMAIL || "vasanthakumarr412@gmail.com",
              name: "Elite Glow Salon",
            },
          ],
          subject: `✨ New Enquiry from ${form.name} — Elite Glow Salon`,
          htmlContent: `
            <div style="font-family:'DM Sans',sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;border-radius:16px;overflow:hidden;border:1px solid rgba(201,168,76,0.2);">
              <div style="background:linear-gradient(135deg,#C9A84C,#F5E68A);padding:28px 32px;">
                <h1 style="margin:0;font-size:22px;color:#0a0a0a;font-weight:600;letter-spacing:0.02em;">New Contact Enquiry</h1>
                <p style="margin:4px 0 0;color:rgba(10,10,10,0.7);font-size:13px;">Received from Elite Glow Salon website</p>
              </div>
              <div style="padding:32px;">
                <table style="width:100%;border-collapse:collapse;">
                  <tr><td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.06);color:#999;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;width:90px;">Name</td>
                    <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.06);color:#fff;font-size:14px;">${form.name}</td></tr>
                  <tr><td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.06);color:#999;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;">Email</td>
                    <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.06);"><a href="mailto:${form.email}" style="color:#C9A84C;text-decoration:none;font-size:14px;">${form.email}</a></td></tr>
                  <tr><td style="padding:10px 0;color:#999;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;">Time</td>
                    <td style="padding:10px 0;color:#fff;font-size:14px;">${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</td></tr>
                </table>
                <div style="margin-top:24px;">
                  <p style="margin:0 0 10px;color:#999;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;">Message</p>
                  <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(201,168,76,0.12);border-radius:12px;padding:20px;">
                    <p style="margin:0;color:#e5e5e5;font-size:15px;line-height:1.7;white-space:pre-wrap;">${form.message}</p>
                  </div>
                </div>
                <div style="margin-top:28px;text-align:center;">
                  <a href="mailto:${form.email}" style="display:inline-block;background:linear-gradient(135deg,#C9A84C,#F5E68A);color:#0a0a0a;text-decoration:none;padding:12px 28px;border-radius:50px;font-size:13px;font-weight:600;letter-spacing:0.04em;">Reply to ${form.name}</a>
                </div>
              </div>
              <div style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.05);text-align:center;">
                <p style="margin:0;color:#555;font-size:12px;">Elite Glow Salon &nbsp;·&nbsp; This is an automated notification</p>
              </div>
            </div>
          `,
        }),
      });

      if (!response.ok) {
        let errBody: { message?: string; code?: string } = {};
        try { errBody = await response.json(); } catch { /* ignore */ }
        const msg = errBody?.message || `HTTP ${response.status}`;
        console.error("Brevo API error:", response.status, errBody);
        setApiError(`Brevo error (${response.status}): ${msg}`);
        setEmailStatus("error");
        setTimeout(() => { setEmailStatus("idle"); setApiError(""); }, 8000);
        return;
      }

      setEmailStatus("success");
      setApiError("");
      setForm({ name: "", email: "", message: "" });
    } catch (emailErr: unknown) {
      const msg = emailErr instanceof Error ? emailErr.message : String(emailErr);
      console.error("Brevo send error:", msg);
      // Network / CORS errors will appear here
      setApiError(msg.includes("fetch") || msg.includes("network") || msg.includes("Failed")
        ? "Network error — check your internet connection or CORS settings."
        : msg);
      setEmailStatus("error");
    }

    setTimeout(() => { setEmailStatus("idle"); setApiError(""); }, 8000);
  };

  // ─── WhatsApp deep link ───────────────────────────────────────────────────────
  const handleWhatsApp = () => {
    const err = validateForm();
    if (err) { setWaError(err); setTimeout(() => setWaError(""), 4000); return; }
    setWaError("");

    const text = encodeURIComponent(
      `Hello Elite Glow Salon! 👋\n\n` +
      `My name is *${form.name}* and I'm reaching out via your website contact form.\n\n` +
      `📧 *Email:* ${form.email}\n\n` +
      `💬 *Message:*\n${form.message}\n\n` +
      `Looking forward to hearing from you!`
    );

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, "_blank", "noopener,noreferrer");
  };

  const inputClass =
    "w-full bg-white/[0.03] border border-gold-500/20 rounded-xl px-5 py-4 text-white text-sm font-body placeholder-stone-600 focus:outline-none focus:border-gold-500/50 transition-colors duration-300";

  return (
    <section id="contact" className="py-24 md:py-32 px-6" style={{ background: "#0a0a0a" }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-gold-500 text-xs tracking-[0.4em] uppercase font-accent mb-4"
          >
            Get In Touch
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="font-display text-5xl md:text-6xl font-light text-white"
          >
            Contact <span className="gold-text italic">Us</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Info Panel */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-2 flex flex-col gap-8"
          >
            <div>
              <h3 className="font-display text-3xl font-light text-white mb-4">
                Let us craft your <span className="gold-text italic">perfect look</span>
              </h3>
              <p className="text-stone-400 text-sm font-body leading-relaxed">
                Reach out to schedule an appointment, ask about services, or simply say hello. Our team typically responds within 2 hours.
              </p>
            </div>

            <div className="space-y-5">
              <a href="tel:9042414664" className="flex items-center gap-4 group no-underline">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)" }}
                >
                  <Phone size={16} style={{ color: "#C9A84C" }} />
                </div>
                <div>
                  <p className="text-xs text-stone-500 font-body mb-0.5 uppercase tracking-wider">Phone</p>
                  <p className="text-white font-body text-sm group-hover:text-gold-400 transition-colors">9042414664</p>
                </div>
              </a>

              <a href="mailto:vasanthakumarr412@gmail.com" className="flex items-center gap-4 group no-underline">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)" }}
                >
                  <Mail size={16} style={{ color: "#C9A84C" }} />
                </div>
                <div>
                  <p className="text-xs text-stone-500 font-body mb-0.5 uppercase tracking-wider">Email</p>
                  <p className="text-white font-body text-sm group-hover:text-gold-400 transition-colors break-all">
                    vasanthakumarr412@gmail.com
                  </p>
                </div>
              </a>
            </div>

            <div className="h-px" style={{ background: "linear-gradient(to right, #C9A84C, transparent)" }} />
            <p className="text-stone-500 text-xs font-body italic">
              "Beauty begins the moment you decide to be yourself." — Coco Chanel
            </p>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="lg:col-span-3"
          >
            <form onSubmit={handleEmailSubmit} className="glass-card rounded-2xl p-8 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs text-stone-500 uppercase tracking-wider font-body mb-2 block">
                    Name <span style={{ color: "#C9A84C" }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Your full name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-xs text-stone-500 uppercase tracking-wider font-body mb-2 block">
                    Email <span style={{ color: "#C9A84C" }}>*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-stone-500 uppercase tracking-wider font-body mb-2 block">
                  Message <span style={{ color: "#C9A84C" }}>*</span>
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Tell us about your requirements..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className={inputClass}
                  style={{ resize: "none" }}
                />
              </div>

              {/* Validation / error banner */}
              <AnimatePresence>
                {waError && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="flex items-center gap-2 rounded-xl px-4 py-3"
                    style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)" }}
                  >
                    <AlertCircle size={14} style={{ color: "#f87171", flexShrink: 0 }} />
                    <p className="text-red-400 text-xs font-body">{waError}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Dual action buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* ── Email button ── */}
                <button
                  type="submit"
                  disabled={emailStatus === "loading" || emailStatus === "success"}
                  className="w-full py-4 rounded-xl font-body font-medium text-sm flex items-center justify-center gap-2 transition-all duration-300 border-0 cursor-pointer hover:scale-[1.02] active:scale-[0.99]"
                  style={{
                    background:
                      emailStatus === "success"
                        ? "rgba(34,197,94,0.12)"
                        : "linear-gradient(135deg, #C9A84C, #F5E68A)",
                    color: emailStatus === "success" ? "#4ade80" : "#0a0a0a",
                    border: emailStatus === "success" ? "1px solid rgba(74,222,128,0.3)" : "none",
                    opacity: emailStatus === "loading" ? 0.72 : 1,
                    boxShadow:
                      emailStatus !== "success"
                        ? "0 4px 20px rgba(201,168,76,0.25)"
                        : "none",
                  }}
                >
                  {emailStatus === "loading" && (
                    <span className="animate-spin w-4 h-4 border-2 border-black/30 border-t-black rounded-full" />
                  )}
                  {emailStatus === "success" && <Check size={15} />}
                  {emailStatus === "error" && <AlertCircle size={15} />}
                  {emailStatus === "idle" && <Send size={14} />}
                  <span>
                    {emailStatus === "loading"
                      ? "Sending…"
                      : emailStatus === "success"
                      ? "Email Sent!"
                      : emailStatus === "error"
                      ? "Try Again"
                      : "Send via Email"}
                  </span>
                </button>

                {/* ── WhatsApp button ── */}
                <button
                  type="button"
                  onClick={handleWhatsApp}
                  className="w-full py-4 rounded-xl font-body font-medium text-sm flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer hover:scale-[1.02] active:scale-[0.99]"
                  style={{
                    background: "rgba(37,211,102,0.1)",
                    border: "1px solid rgba(37,211,102,0.35)",
                    color: "#25D366",
                    boxShadow: "0 4px 20px rgba(37,211,102,0.1)",
                  }}
                >
                  <MessageCircle size={15} />
                  <span>Chat on WhatsApp</span>
                </button>
              </div>

              {/* Error feedback — shows exact Brevo API error */}
              <AnimatePresence>
                {emailStatus === "error" && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="rounded-xl px-4 py-3 space-y-1"
                    style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)" }}
                  >
                    <p className="text-red-400 text-xs text-center font-body font-medium">
                      Email could not be sent.
                    </p>
                    {apiError && (
                      <p className="text-red-300/70 text-[11px] text-center font-body leading-relaxed break-all">
                        {apiError}
                      </p>
                    )}
                    <p className="text-stone-500 text-[11px] text-center font-body">
                      Tip: Verify the sender email in your{" "}
                      <a
                        href="https://app.brevo.com/senders"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "#C9A84C" }}
                      >
                        Brevo Senders panel
                      </a>
                      , or use WhatsApp instead.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <p className="text-stone-600 text-[11px] text-center font-body leading-relaxed pt-1">
                By submitting, you agree to be contacted by Elite Glow Salon. We respect your privacy.
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
