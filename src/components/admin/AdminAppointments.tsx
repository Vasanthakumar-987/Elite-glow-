import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays, Trash2, Search, Loader2, AlertCircle, CheckCircle,
  Phone, User, Scissors, Clock, MessageSquare, Filter, Check,
  Save, MessageCircle
} from "lucide-react";
import {
  type Appointment,
  fetchAllAppointments, updateAppointmentStatus, deleteAppointment,
  updateAppointmentNotes
} from "../../lib/supabase";

const STATUS_COLORS: Record<Appointment["status"], { bg: string; border: string; text: string; label: string }> = {
  pending: { bg: "rgba(251,191,36,0.08)", border: "rgba(251,191,36,0.2)", text: "#fbbf24", label: "Pending" },
  confirmed: { bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.2)", text: "#4ade80", label: "Confirmed" },
  cancellation_requested: { bg: "rgba(249,115,22,0.08)", border: "rgba(249,115,22,0.2)", text: "#f97316", label: "Cancellation Requested" },
  cancelled: { bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.2)", text: "#ef4444", label: "Cancelled" },
  completed: { bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.2)", text: "#60a5fa", label: "Completed" },
};

const STATUSES: Appointment["status"][] = ["pending", "confirmed", "cancellation_requested", "cancelled", "completed"];

export const AdminAppointments: React.FC = () => {
  const [items, setItems] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<Appointment["status"] | "all">("all");
  const [filterDate, setFilterDate] = useState<"all" | "today" | "tomorrow" | "this_week">("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState<string>("");

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    const { data, error: e } = await fetchAllAppointments();
    if (e) setError(e.message); else setItems(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = async (id: string, status: Appointment["status"]) => {
    setUpdatingId(id);
    const { error: e } = await updateAppointmentStatus(id, status);
    if (e) showToast(e.message, "error");
    else {
      showToast(`Status → ${STATUS_COLORS[status].label}`);
      setItems(prev => prev.map(item => item.id === id ? { ...item, status } : item));
    }
    setUpdatingId(null);
  };

  const handleApproveCancellation = async (a: Appointment) => {
    await handleStatusChange(a.id, "cancelled");
    // Automatically trigger WhatsApp to notify the customer it was cancelled
    handleWhatsApp({ ...a, status: "cancelled" });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this appointment?")) return;
    setDeletingId(id);
    const { error: e } = await deleteAppointment(id);
    if (e) showToast(e.message, "error");
    else { showToast("Deleted."); setItems(prev => prev.filter(a => a.id !== id)); }
    setDeletingId(null);
  };

  const handleSaveNote = async (id: string) => {
    setUpdatingId(id);
    const { error: e } = await updateAppointmentNotes(id, tempNote);
    if (e) {
      showToast(e.message, "error");
    } else {
      showToast("Notes saved successfully.");
      setItems(prev => prev.map(item => item.id === id ? { ...item, notes: tempNote } : item));
      setEditingNoteId(null);
    }
    setUpdatingId(null);
  };

  const handleWhatsApp = async (a: Appointment) => {
    let message = "";
    
    switch(a.status) {
      case "pending":
      case "confirmed":
        message = `Hello ${a.customer_name}! ❖\n\nYour appointment at *Elite Glow Salon* is confirmed.\n\n❖ *Date:* ${a.appointment_date}\n❖ *Time:* ${a.appointment_time}\n❖ *Service:* ${a.service}\n\nSee you soon! ❖`;
        break;
      case "cancellation_requested":
        message = `Hello ${a.customer_name}! ❖\n\nWe have received your cancellation request for your appointment.\n\n❖ *Date:* ${a.appointment_date}\n❖ *Time:* ${a.appointment_time}\n❖ *Service:* ${a.service}\n\nOur team will process it shortly. ❖`;
        break;
      case "cancelled":
        message = `Hello ${a.customer_name}! ❖\n\nWe have received your cancellation request for your appointment and it is now cancelled.\n\n❖ *Date:* ${a.appointment_date}\n❖ *Time:* ${a.appointment_time}\n❖ *Service:* ${a.service}\n\nWe hope to serve you in the future. ❖`;
        break;
      case "completed":
        message = `Hello ${a.customer_name}! ❖\n\nThank you for visiting *Elite Glow Salon*.\n\n❖ *Date:* ${a.appointment_date}\n❖ *Service:* ${a.service}\n\nWe hope you loved our service! ❖`;
        break;
    }

    const cleanPhone = a.customer_phone.replace(/\D/g, "");
    window.open(`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(message)}`, "_blank");

    if (a.status === "pending") {
      await handleStatusChange(a.id, "confirmed");
    }
  };

  const isToday = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  };

  const isTomorrow = (dateStr: string) => {
    const d = new Date(dateStr);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return d.getDate() === tomorrow.getDate() && d.getMonth() === tomorrow.getMonth() && d.getFullYear() === tomorrow.getFullYear();
  };

  const isThisWeek = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    return d >= today && d <= nextWeek;
  };

  const filtered = items.filter(a => {
    const matchSearch = a.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      a.service.toLowerCase().includes(search.toLowerCase()) ||
      a.customer_phone.includes(search);
    const matchStatus = filterStatus === "all" || a.status === filterStatus;
    
    let matchDate = true;
    if (filterDate === "today") matchDate = isToday(a.appointment_date);
    else if (filterDate === "tomorrow") matchDate = isTomorrow(a.appointment_date);
    else if (filterDate === "this_week") matchDate = isThisWeek(a.appointment_date);

    return matchSearch && matchStatus && matchDate;
  });

  const counts = {
    all: items.length,
    ...STATUSES.reduce((acc, s) => ({ ...acc, [s]: items.filter(a => a.status === s).length }), {} as Record<string, number>)
  };

  return (
    <div className="relative">
      <AnimatePresence>
        {toast && (
          <motion.div key="toast" initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            className="fixed top-6 right-6 z-[200] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl"
            style={{ background: toast.type === "success" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)", border: `1px solid ${toast.type === "success" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`, backdropFilter: "blur(12px)" }}>
            {toast.type === "success" ? <CheckCircle size={16} style={{ color: "#4ade80" }} /> : <AlertCircle size={16} style={{ color: "#ef4444" }} />}
            <span className={`text-sm font-body ${toast.type === "success" ? "text-green-300" : "text-red-300"}`}>{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats / Status Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        <button onClick={() => setFilterStatus("all")}
          className="glass-card rounded-2xl p-4 flex flex-col items-start gap-2 border transition-colors cursor-pointer text-left"
          style={{ borderColor: filterStatus === "all" ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.05)", background: filterStatus === "all" ? "rgba(255,255,255,0.05)" : undefined }}>
          <p className="text-stone-400 text-[10px] font-body uppercase tracking-wider">All Appointments</p>
          <p className="text-white font-display text-2xl font-light">{counts.all}</p>
        </button>
        {STATUSES.map(s => {
          const c = STATUS_COLORS[s];
          return (
            <button key={s} onClick={() => setFilterStatus(s)}
              className="glass-card rounded-2xl p-4 flex flex-col items-start gap-2 border transition-colors cursor-pointer text-left"
              style={{ borderColor: filterStatus === s ? c.border : "rgba(255,255,255,0.05)", background: filterStatus === s ? c.bg : undefined }}>
              <p className="text-[10px] font-body uppercase tracking-wider" style={{ color: c.text }}>{c.label}</p>
              <p className="text-white font-display text-2xl font-light">{counts[s as keyof typeof counts] ?? 0}</p>
            </button>
          );
        })}
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 mb-8">
        <div className="relative flex-1 w-full">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
          <input type="text" placeholder="Search by name, service, phone..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 text-white rounded-xl py-2.5 pl-9 pr-4 text-sm font-body outline-none focus:border-gold-500/40 transition-colors placeholder:text-stone-600" />
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-2 py-1.5 flex-1 lg:flex-none">
            <Filter size={14} className="text-stone-500 ml-2" />
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as typeof filterStatus)}
              className="bg-transparent border-0 text-stone-300 py-1 px-1 text-sm font-body outline-none cursor-pointer w-full">
              <option value="all">All Status</option>
              {STATUSES.map(s => <option key={s} value={s}>{STATUS_COLORS[s].label}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-2 py-1.5 flex-1 lg:flex-none">
            <CalendarDays size={14} className="text-stone-500 ml-2" />
            <select value={filterDate} onChange={e => setFilterDate(e.target.value as typeof filterDate)}
              className="bg-transparent border-0 text-stone-300 py-1 px-1 text-sm font-body outline-none cursor-pointer w-full">
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="tomorrow">Tomorrow</option>
              <option value="this_week">This Week</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-400">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <p className="text-sm font-body">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 size={28} className="text-gold-500 animate-spin mb-3" />
          <p className="text-stone-500 text-sm font-body">Loading appointments...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card rounded-2xl border border-white/5 p-16 text-center">
          <div className="w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-4" style={{ background: "rgba(255,255,255,0.02)" }}>
            <CalendarDays size={24} className="text-stone-600" />
          </div>
          <h3 className="text-white font-display text-xl mb-2">No appointments found</h3>
          <p className="text-stone-500 text-sm font-body max-w-xs mx-auto">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filtered.map((a, i) => {
              const c = STATUS_COLORS[a.status];
              return (
                <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ delay: i * 0.04 }}
                  className="glass-card rounded-2xl p-6 border border-white/5 hover:border-gold-500/15 transition-colors group">
                  <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6">
                    
                    {/* Left: Info */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.15)", color: "#C9A84C" }}>
                        <User size={22} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap mb-1.5">
                          <h4 className="text-white font-display text-lg">{a.customer_name}</h4>
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-body font-medium whitespace-nowrap" style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text }}>
                            {c.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-body text-stone-400 mb-4">
                          <span className="flex items-center gap-1.5"><Scissors size={14} className="text-stone-500"/>{a.service}</span>
                          <span className="flex items-center gap-1.5"><CalendarDays size={14} className="text-stone-500"/>{a.appointment_date}</span>
                          <span className="flex items-center gap-1.5"><Clock size={14} className="text-stone-500"/>{a.appointment_time}</span>
                          <span className="flex items-center gap-1.5"><Phone size={14} className="text-stone-500"/>{a.customer_phone}</span>
                        </div>

                        {/* Admin Notes Area */}
                        <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-stone-500 uppercase tracking-wider font-body flex items-center gap-1.5">
                              <MessageSquare size={12} /> Admin Notes
                            </span>
                            {editingNoteId !== a.id && (
                              <button onClick={() => { setEditingNoteId(a.id); setTempNote(a.notes || ""); }}
                                className="text-[10px] text-stone-400 hover:text-gold-400 uppercase tracking-wider border-0 bg-transparent cursor-pointer font-body">
                                Edit Note
                              </button>
                            )}
                          </div>
                          
                          {editingNoteId === a.id ? (
                            <div className="space-y-2">
                              <textarea
                                value={tempNote}
                                onChange={e => setTempNote(e.target.value)}
                                placeholder="Add an internal note..."
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-stone-300 outline-none focus:border-gold-500/50 resize-none font-body min-h-[60px]"
                              />
                              <div className="flex justify-end gap-2">
                                <button onClick={() => setEditingNoteId(null)} className="px-3 py-1.5 rounded-lg text-xs font-body text-stone-400 hover:bg-white/5 transition-colors border-0 cursor-pointer">
                                  Cancel
                                </button>
                                <button onClick={() => handleSaveNote(a.id)} disabled={updatingId === a.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-body bg-gold-500/20 text-gold-400 hover:bg-gold-500/30 transition-colors border border-gold-500/20 cursor-pointer disabled:opacity-50">
                                  {updatingId === a.id ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm font-body text-stone-300 whitespace-pre-wrap">
                              {a.notes || <span className="text-stone-600 italic">No notes added.</span>}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-col sm:flex-row xl:flex-col items-end gap-3 flex-shrink-0">
                      
                      <div className="flex items-center gap-2">
                        {a.status === "cancellation_requested" && (
                          <button onClick={() => handleApproveCancellation(a)} disabled={updatingId === a.id}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-body font-medium transition-colors cursor-pointer border disabled:opacity-50"
                            style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", borderColor: "rgba(239,68,68,0.2)" }}>
                            <Check size={14} /> Approve Cancellation
                          </button>
                        )}
                        <select value={a.status} onChange={e => handleStatusChange(a.id, e.target.value as Appointment["status"])}
                          disabled={updatingId === a.id}
                          className="bg-white/5 border border-white/10 text-stone-300 rounded-xl py-2 px-3 text-xs font-body outline-none focus:border-gold-500/40 cursor-pointer disabled:opacity-50 transition-colors">
                          {STATUSES.map(s => <option key={s} value={s}>{STATUS_COLORS[s].label}</option>)}
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <a href={`tel:${a.customer_phone.replace(/\D/g, "")}`} title="Call customer"
                          className="p-2 rounded-xl border-0 cursor-pointer transition-colors flex items-center justify-center" style={{ background: "rgba(59,130,246,0.1)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.2)", textDecoration: "none" }}>
                          <Phone size={16} />
                        </a>
                        <button onClick={() => handleWhatsApp(a)} title="Send WhatsApp message"
                          className="p-2 rounded-xl border-0 cursor-pointer transition-colors flex items-center justify-center" style={{ background: "rgba(34,197,94,0.1)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.2)" }}>
                          {updatingId === a.id && a.status === "pending" ? <Loader2 size={16} className="animate-spin" /> : <MessageCircle size={16} />}
                        </button>
                        <button onClick={() => handleDelete(a.id)} disabled={deletingId === a.id} title="Delete appointment"
                          className="p-2 rounded-xl border-0 cursor-pointer transition-colors disabled:opacity-50 flex items-center justify-center ml-2" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>
                          {deletingId === a.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                        </button>
                      </div>

                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
