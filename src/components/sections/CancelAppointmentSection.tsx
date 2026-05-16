import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, Phone, CheckCircle, AlertCircle, Loader2, XCircle } from "lucide-react";
import { fetchAppointmentForCancellation, updateAppointmentStatus } from "../../lib/supabase";

export const CancelAppointmentSection: React.FC = () => {
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || !date) return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const { data: appointment, error: fetchError } = await fetchAppointmentForCancellation(phone.trim(), date);

      if (fetchError || !appointment) {
        throw new Error("No appointment found with this phone number and date.");
      }

      if (appointment.status === "completed") {
        throw new Error("This appointment has already been completed and cannot be cancelled.");
      }

      if (appointment.status === "cancelled") {
        throw new Error("This appointment is already cancelled.");
      }

      if (appointment.status === "cancellation_requested") {
        throw new Error("A cancellation request for this appointment is already pending.");
      }

      const { error: updateError } = await updateAppointmentStatus(appointment.id, "cancellation_requested");

      if (updateError) {
        throw new Error(updateError.message || "Failed to cancel appointment. Please try again.");
      }

      const waMsg = `Hello Elite Glow Salon! ❖\n\nI would like to request a cancellation for my appointment.\n\n❖ *Name:* ${appointment.customer_name}\n❖ *Phone:* ${appointment.customer_phone}\n❖ *Service:* ${appointment.service}\n❖ *Date:* ${appointment.appointment_date}\n❖ *Time:* ${appointment.appointment_time}\n\nPlease let me know once this is confirmed. Thank you! ❖`;
      window.open(`https://wa.me/919042414664?text=${encodeURIComponent(waMsg)}`, "_blank");

      setStatus("success");
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong.");
      setStatus("error");
    }
  };

  const inputCls = "w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-body placeholder-stone-600 focus:outline-none focus:border-[rgba(201,168,76,0.4)] transition-colors appearance-none";

  return (
    <section id="cancel-appointment" className="py-20 px-4 relative overflow-hidden" style={{ background: "#0a0a0a" }}>
      <div className="max-w-2xl mx-auto relative">
        <div className="text-center mb-10">
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-3xl font-light text-white mb-3"
          >
            Need to <span className="gold-text italic">Cancel?</span>
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-stone-400 font-body text-sm max-w-sm mx-auto"
          >
            Enter your phone number and appointment date below to cancel an existing booking.
          </motion.p>
        </div>

        <AnimatePresence mode="wait">
          {status === "success" ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="glass-card rounded-3xl p-10 text-center border border-white/5"
            >
              <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-5" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}>
                <CheckCircle size={28} style={{ color: "#4ade80" }} />
              </div>
              <h4 className="font-display text-xl text-white mb-2">Cancellation Requested</h4>
              <p className="text-stone-400 font-body text-sm mb-6">Your cancellation request has been sent via WhatsApp. Our team will review and confirm it shortly.</p>
              <button
                onClick={() => {
                  setStatus("idle");
                  setPhone("");
                  setDate("");
                }}
                className="px-6 py-2.5 rounded-xl text-sm font-body font-medium text-black border-0 cursor-pointer transition-all hover:scale-[1.02]"
                style={{ background: "linear-gradient(135deg, #C9A84C, #F5E68A)" }}
              >
                Go Back
              </button>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="glass-card rounded-3xl p-8 border border-white/5">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="text-xs text-stone-500 uppercase tracking-wider font-body mb-2 flex items-center gap-1.5 block">
                        <Phone size={12} /> Phone Number <span style={{ color: "#C9A84C" }}>*</span>
                      </label>
                      <input
                        required
                        type="tel"
                        placeholder="e.g. 9876543210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-stone-500 uppercase tracking-wider font-body mb-2 flex items-center gap-1.5 block">
                        <CalendarDays size={12} /> Appointment Date <span style={{ color: "#C9A84C" }}>*</span>
                      </label>
                      <input
                        required
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className={inputCls}
                        style={{ colorScheme: "dark" }}
                      />
                    </div>
                  </div>

                  {status === "error" && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-400">
                      <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                      <p className="text-sm font-body">{errorMsg}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full py-3.5 rounded-xl font-body font-medium text-sm text-white border border-red-500/30 cursor-pointer flex items-center justify-center gap-2 transition-all hover:bg-red-500/10 disabled:opacity-70 disabled:cursor-not-allowed"
                    style={{ background: "rgba(239,68,68,0.05)" }}
                  >
                    {status === "loading" ? (
                      <><Loader2 size={16} className="animate-spin" /> Processing...</>
                    ) : (
                      <><XCircle size={16} /> Cancel Appointment</>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
