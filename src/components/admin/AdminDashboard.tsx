import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, LogOut, Search, Trash2, Calendar, User,
  Mail, ChevronRight, AlertCircle, Inbox, Loader2, Quote,
  Scissors, Image, CalendarDays, BarChart2, CheckCircle,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { AdminTestimonials } from "./AdminTestimonials";
import { AdminServices } from "./AdminServices";
import { AdminGallery } from "./AdminGallery";
import { AdminAppointments } from "./AdminAppointments";
import { AdminAnalytics } from "./AdminAnalytics";

interface AdminDashboardProps {
  onLogout: () => void;
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
}

type Tab = "analytics" | "messages" | "testimonials" | "services" | "gallery" | "appointments";

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("analytics");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // Incrementing this triggers AdminAnalytics to refetch from Supabase
  const [analyticsRefreshKey, setAnalyticsRefreshKey] = useState(0);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const { data, error: fetchError } = await supabase
        .from("contact_messages").select("*").order("created_at", { ascending: false });
      if (fetchError) throw fetchError;
      setMessages(data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load messages.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (activeTab === "messages") fetchMessages();
  }, [activeTab, fetchMessages]);

  const deleteMessage = async (id: string) => {
    if (!window.confirm("Delete this message? This cannot be undone.")) return;
    try {
      setDeletingId(id);
      const { data, error: e } = await supabase.from("contact_messages").delete().eq("id", id).select();
      if (e) throw e;
      if (!data || data.length === 0) {
        throw new Error("Message could not be deleted from Supabase. This is likely blocked by your Supabase Row Level Security (RLS) policies. Please enable DELETE permissions for anon on the contact_messages table in your Supabase dashboard.");
      }
      // 1. Remove from local messages list immediately
      setMessages((prev) => prev.filter((m) => m.id !== id));
      // 2. Force analytics to refetch so Total Messages count drops
      setAnalyticsRefreshKey((k) => k + 1);
      showToast("Message deleted successfully.");
    } catch (err: unknown) {
      showToast("Failed to delete: " + (err instanceof Error ? err.message : "Unknown error"), "error");
    } finally { setDeletingId(null); }
  };

  const filteredMessages = messages.filter((msg) =>
    msg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateStr: string) =>
    new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(dateStr));

  const TAB_LABELS: Record<Tab, string> = {
    analytics: "Analytics", messages: "Messages", testimonials: "Testimonials",
    services: "Services", gallery: "Gallery", appointments: "Appointments",
  };

  const navItems: { id: Tab; icon: React.ReactNode; label: string }[] = [
    { id: "analytics",    icon: <BarChart2 size={18} />,     label: "Analytics" },
    { id: "messages",     icon: <MessageSquare size={18} />, label: "Messages" },
    { id: "testimonials", icon: <Quote size={18} />,         label: "Testimonials" },
    { id: "services",     icon: <Scissors size={18} />,      label: "Services" },
    { id: "gallery",      icon: <Image size={18} />,         label: "Gallery" },
    { id: "appointments", icon: <CalendarDays size={18} />,  label: "Appointments" },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: "#080808" }}>

      {/* ── Global Toast ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {toast && (
          <motion.div key="toast" initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            className="fixed top-6 right-6 z-[300] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl"
            style={{ background: toast.type === "success" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)", border: `1px solid ${toast.type === "success" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`, backdropFilter: "blur(12px)" }}>
            {toast.type === "success" ? <CheckCircle size={16} style={{ color: "#4ade80" }} /> : <AlertCircle size={16} style={{ color: "#f87171" }} />}
            <span className={`text-sm font-body ${toast.type === "success" ? "text-green-300" : "text-red-300"}`}>{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex flex-col"
        style={{ width: sidebarOpen ? 240 : 72, background: "rgba(12,12,12,0.98)", borderRight: "1px solid rgba(201,168,76,0.1)", transition: "width 0.3s ease", position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 20, overflow: "hidden" }}>

        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #C9A84C, #F5E68A)" }}>
            <span className="text-black font-bold text-xs font-accent">EG</span>
          </div>
          {sidebarOpen && <span className="font-display text-base text-white whitespace-nowrap">Elite Glow</span>}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 space-y-1 px-3 overflow-y-auto">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer border-0 text-left"
              style={activeTab === item.id
                ? { background: "rgba(201,168,76,0.1)", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.2)" }
                : { background: "transparent", color: "#78716c", border: "1px solid transparent" }}>
              <span className="flex-shrink-0">{item.icon}</span>
              {sidebarOpen && <span className="text-sm font-body whitespace-nowrap">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-6">
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-stone-600 hover:text-red-400 transition-colors cursor-pointer border-0 bg-transparent">
            <LogOut size={18} className="flex-shrink-0" />
            {sidebarOpen && <span className="text-sm font-body">Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* ── Main ────────────────────────────────────────────────────────────── */}
      <main style={{ marginLeft: sidebarOpen ? 240 : 72, flex: 1, transition: "margin-left 0.3s ease" }} className="flex flex-col min-h-screen">
        {/* Topbar */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-8 py-5"
          style={{ background: "rgba(8,8,8,0.95)", borderBottom: "1px solid rgba(255,255,255,0.05)", backdropFilter: "blur(12px)" }}>
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-stone-500 hover:text-stone-300 border-0 bg-transparent cursor-pointer p-1">
              <ChevronRight size={18} style={{ transform: sidebarOpen ? "rotate(180deg)" : "none", transition: "transform 0.3s" }} />
            </button>
            <div>
              <h1 className="text-white font-display text-2xl font-light">{TAB_LABELS[activeTab]}</h1>
              <p className="text-stone-600 text-xs font-body">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #C9A84C, #F5E68A)" }}>
              <span className="text-black font-bold text-xs">A</span>
            </div>
            <span className="text-stone-400 text-sm font-body hidden sm:block">Admin</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 flex-1">
          <AnimatePresence mode="wait">
            {activeTab === "analytics" && (
              <motion.div key="analytics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                {/* Pass refreshKey so analytics re-fetches when messages are deleted */}
                <AdminAnalytics refreshKey={analyticsRefreshKey} />
              </motion.div>
            )}
            {activeTab === "testimonials" && (
              <motion.div key="testimonials" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                <AdminTestimonials />
              </motion.div>
            )}
            {activeTab === "services" && (
              <motion.div key="services" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                <AdminServices />
              </motion.div>
            )}
            {activeTab === "gallery" && (
              <motion.div key="gallery" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                <AdminGallery />
              </motion.div>
            )}
            {activeTab === "appointments" && (
              <motion.div key="appointments" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                <AdminAppointments />
              </motion.div>
            )}
            {activeTab === "messages" && (
              <motion.div key="messages" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                {/* Stats + Search */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                  <div className="glass-card rounded-2xl p-4 flex items-center gap-4 border border-white/5">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.15)", color: "#C9A84C" }}>
                      <Inbox size={24} />
                    </div>
                    <div>
                      <p className="text-stone-500 text-xs font-body uppercase tracking-wider mb-1">Total Messages</p>
                      {/* This reflects the live messages array — updates immediately on delete */}
                      <p className="text-white font-display text-2xl font-light">{messages.length}</p>
                    </div>
                  </div>
                  <div className="relative w-full md:w-80">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500" />
                    <input type="text" placeholder="Search by name, email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 text-white rounded-xl py-3 pl-10 pr-4 text-sm font-body outline-none focus:border-gold-500/50 transition-colors placeholder:text-stone-600" />
                  </div>
                </div>
                {error && (
                  <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex gap-3 text-red-400">
                    <AlertCircle size={20} className="flex-shrink-0 mt-0.5" /><p className="text-sm font-body">{error}</p>
                  </div>
                )}
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 size={32} className="text-gold-500 animate-spin mb-4" />
                    <p className="text-stone-500 text-sm font-body">Loading messages...</p>
                  </div>
                ) : filteredMessages.length === 0 ? (
                  <div className="glass-card rounded-2xl border border-white/5 p-16 text-center">
                    <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4" style={{ background: "rgba(255,255,255,0.02)" }}>
                      <MessageSquare size={28} className="text-stone-600" />
                    </div>
                    <h3 className="text-white font-display text-xl mb-2">No messages found</h3>
                    <p className="text-stone-500 text-sm font-body max-w-sm mx-auto">{searchQuery ? "Try adjusting your search." : "No contact messages yet."}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <AnimatePresence>
                      {filteredMessages.map((msg, i) => (
                        <motion.div key={msg.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.05 }}
                          className="glass-card rounded-2xl p-6 relative group border border-white/5 hover:border-gold-500/20 transition-colors">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center text-gold-500 border border-white/5"><User size={18} /></div>
                              <div>
                                <h4 className="text-white font-display text-lg tracking-wide">{msg.name}</h4>
                                <a href={`mailto:${msg.email}`} className="text-stone-400 hover:text-gold-400 text-xs font-body flex items-center gap-1.5 transition-colors">
                                  <Mail size={12} />{msg.email}
                                </a>
                              </div>
                            </div>
                            <button onClick={() => deleteMessage(msg.id)} disabled={deletingId === msg.id}
                              className="transition-all p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 cursor-pointer disabled:opacity-50" title="Delete this message">
                              {deletingId === msg.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                            </button>
                          </div>
                          <div className="bg-black/20 rounded-xl p-4 mb-4 border border-white/5">
                            <p className="text-stone-300 text-sm font-body leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                          </div>
                          <div className="flex items-center gap-1.5 text-stone-600 text-xs font-body">
                            <Calendar size={12} />{formatDate(msg.created_at)}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};
