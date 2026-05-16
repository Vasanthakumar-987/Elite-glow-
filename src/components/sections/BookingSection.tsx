import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays, Phone, Mail, User, Scissors, Clock,
  CheckCircle, AlertCircle, Loader2, MessageSquare,
} from "lucide-react";
import { type Service, fetchActiveServices, insertAppointment } from "../../lib/supabase";

const TIME_SLOTS = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
  "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
  "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM",
  "05:00 PM", "05:30 PM", "06:00 PM",
];

const EMPTY_FORM = {
  customer_name: "",
  customer_email: "",
  customer_phone: "",
  service: "",
  appointment_date: "",
  appointment_time: "",
  notes: "",
};

export const BookingSection: React.FC = () => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [services, setServices] = useState<Service[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetchActiveServices().then(({ data }) => {
      if (data && data.length > 0) setServices(data);
    });
  }, []);

  // Minimum date = today
  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customer_name.trim() || !form.customer_phone.trim() || !form.service || !form.appointment_date || !form.appointment_time) return;

    setStatus("loading");
    setErrorMsg("");

    const { error } = await insertAppointment({
      customer_name: form.customer_name.trim(),
      customer_email: form.customer_email.trim() || null,
      customer_phone: form.customer_phone.trim(),
      service: form.service,
      appointment_date: form.appointment_date,
      appointment_time: form.appointment_time,
      notes: form.notes.trim() || null,
      status: "pending",
    });

    if (error) {
      setErrorMsg(error.message);
      setStatus("error");
    } else {
      setStatus("success");
      // Send WhatsApp confirmation after 1.5s
      setTimeout(() => {
        const waMsg = encodeURIComponent(
          `Hello Elite Glow Salon! ❖\n\nI'd like to confirm my appointment booking.\n\n❖ *Name:* ${form.customer_name}\n❖ *Phone:* ${form.customer_phone}\n❖ *Service:* ${form.service}\n❖ *Date:* ${form.appointment_date}\n❖ *Time:* ${form.appointment_time}${form.notes ? `\n\n❖ *Notes:* ${form.notes}` : ""}\n\nLooking forward to visiting Elite Glow Salon! ❖`
        );
        window.open(`https://wa.me/919042414664?text=${waMsg}`, "_blank");
      }, 1500);
      setForm(EMPTY_FORM);
    }
  };

  const inputCls = "w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-body placeholder-stone-600 focus:outline-none focus:border-[rgba(201,168,76,0.4)] transition-colors appearance-none";

  return (
    <section id="booking" className="py-24 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full opacity-[0.03]" style={{ background: "radial-gradient(circle, #C9A84C, transparent)" }} />
      </div>

      <div className="max-w-3xl mx-auto relative">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-14">
          <p className="text-xs font-accent uppercase tracking-[0.3em] mb-4" style={{ color: "#C9A84C" }}>Reserve Your Seat</p>
          <h2 className="font-display text-4xl md:text-5xl font-light text-white mb-4">
            Book an <span style={{ background: "linear-gradient(135deg, #C9A84C, #F5E68A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Appointment</span>
          </h2>
          <p className="text-stone-400 font-body text-base max-w-md mx-auto">
            Reserve your slot online. We'll confirm via WhatsApp within a few hours.
          </p>
        </motion.div>

        {/* Success */}
        <AnimatePresence mode="wait">
          {status === "success" ? (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="glass-card rounded-3xl p-12 text-center border border-green-500/20">
              <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}>
                <CheckCircle size={36} style={{ color: "#4ade80" }} />
              </div>
              <h3 className="font-display text-2xl text-white mb-3">Appointment Confirmed!</h3>
              <p className="text-stone-400 font-body text-sm mb-2">Your appointment has been booked successfully.</p>
              <p className="text-stone-500 font-body text-xs mb-8">A WhatsApp confirmation is opening — see you soon! ❖</p>
              <button onClick={() => setStatus("idle")}
                className="px-8 py-3 rounded-xl text-sm font-body font-medium text-black border-0 cursor-pointer transition-all hover:scale-[1.02]"
                style={{ background: "linear-gradient(135deg, #C9A84C, #F5E68A)" }}>
                Book Another
              </button>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="glass-card rounded-3xl p-8 md:p-10 border border-white/5">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Row 1 — Name + Phone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="text-xs text-stone-500 uppercase tracking-wider font-body mb-2 flex items-center gap-1.5 block">
                        <User size={12} /> Full Name <span style={{ color: "#C9A84C" }}>*</span>
                      </label>
                      <input required type="text" placeholder="e.g. Priya Sharma" value={form.customer_name}
                        onChange={e => setForm({ ...form, customer_name: e.target.value })} className={inputCls} />
                    </div>
                    <div>
                      <label className="text-xs text-stone-500 uppercase tracking-wider font-body mb-2 flex items-center gap-1.5 block">
                        <Phone size={12} /> Phone <span style={{ color: "#C9A84C" }}>*</span>
                      </label>
                      <input required type="tel" placeholder="e.g. 9876543210" value={form.customer_phone}
                        onChange={e => setForm({ ...form, customer_phone: e.target.value })} className={inputCls} />
                    </div>
                  </div>

                  {/* Row 2 — Email */}
                  <div>
                    <label className="text-xs text-stone-500 uppercase tracking-wider font-body mb-2 flex items-center gap-1.5 block">
                      <Mail size={12} /> Email <span className="text-stone-600">(optional)</span>
                    </label>
                    <input type="email" placeholder="e.g. priya@email.com" value={form.customer_email}
                      onChange={e => setForm({ ...form, customer_email: e.target.value })} className={inputCls} />
                  </div>

                  {/* Row 3 — Service */}
                  <div>
                    <label className="text-xs text-stone-500 uppercase tracking-wider font-body mb-2 flex items-center gap-1.5 block">
                      <Scissors size={12} /> Service <span style={{ color: "#C9A84C" }}>*</span>
                    </label>
                    <select required value={form.service} onChange={e => setForm({ ...form, service: e.target.value })} className={inputCls}
                      style={{ background: "rgba(255,255,255,0.04)", color: form.service ? "white" : "#57534e" }}>
                      <option value="" disabled>Select a service...</option>
                      {services.map(s => (
                        <option key={s.id} value={s.name} style={{ background: "#111" }}>
                          {s.name}
                          {s.price ? ` - ₹${s.price}` : ""}
                          {s.duration_minutes ? ` - ${s.duration_minutes} mins` : ""}
                        </option>
                      ))}
                      {["Hair Styling", "Bridal Makeup", "Facial Treatment", "Nail Art", "Mehndi", "Other"]
                        .filter(fallback => !services.some(s => s.name.toLowerCase() === fallback.toLowerCase()))
                        .map(fallback => (
                          <option key={fallback} value={fallback} style={{ background: "#111" }}>{fallback}</option>
                        ))
                      }
                    </select>
                  </div>

                  {/* Row 4 — Date + Time */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="text-xs text-stone-500 uppercase tracking-wider font-body mb-2 flex items-center gap-1.5 block">
                        <CalendarDays size={12} /> Date <span style={{ color: "#C9A84C" }}>*</span>
                      </label>
                      <input required type="date" min={today} value={form.appointment_date}
                        onChange={e => setForm({ ...form, appointment_date: e.target.value })}
                        className={inputCls} style={{ colorScheme: "dark" }} />
                    </div>
                    <div>
                      <label className="text-xs text-stone-500 uppercase tracking-wider font-body mb-2 flex items-center gap-1.5 block">
                        <Clock size={12} /> Time Slot <span style={{ color: "#C9A84C" }}>*</span>
                      </label>
                      <select required value={form.appointment_time} onChange={e => setForm({ ...form, appointment_time: e.target.value })} className={inputCls}
                        style={{ background: "rgba(255,255,255,0.04)", color: form.appointment_time ? "white" : "#57534e" }}>
                        <option value="" disabled>Select a time...</option>
                        {TIME_SLOTS.map(t => <option key={t} value={t} style={{ background: "#111" }}>{t}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Row 5 — Notes */}
                  <div>
                    <label className="text-xs text-stone-500 uppercase tracking-wider font-body mb-2 flex items-center gap-1.5 block">
                      <MessageSquare size={12} /> Notes <span className="text-stone-600">(optional)</span>
                    </label>
                    <textarea rows={3} placeholder="Any special requests or details..." value={form.notes}
                      onChange={e => setForm({ ...form, notes: e.target.value })}
                      className={inputCls} style={{ resize: "none" }} />
                  </div>

                  {/* Error */}
                  {status === "error" && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-400">
                      <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                      <p className="text-sm font-body">{errorMsg || "Something went wrong. Please try again."}</p>
                    </div>
                  )}

                  {/* Submit */}
                  <button type="submit" disabled={status === "loading"}
                    className="w-full py-4 rounded-2xl font-body font-semibold text-base text-black border-0 cursor-pointer flex items-center justify-center gap-3 transition-all hover:scale-[1.01] disabled:opacity-70 disabled:cursor-not-allowed"
                    style={{ background: "linear-gradient(135deg, #C9A84C, #F5E68A)", boxShadow: "0 8px 32px rgba(201,168,76,0.25)" }}>
                    {status === "loading" ? (
                      <><Loader2 size={18} className="animate-spin" /> Submitting...</>
                    ) : (
                      <><CalendarDays size={18} /> Confirm Appointment</>
                    )}
                  </button>

                  <p className="text-center text-stone-600 text-xs font-body">
                    After booking, a WhatsApp message will open to confirm your appointment directly with our team.
                  </p>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
