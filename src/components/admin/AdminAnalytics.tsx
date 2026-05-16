import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  MessageSquare, Quote, Scissors, CalendarDays, Image,
  Loader2, AlertCircle, RefreshCw,
} from "lucide-react";
import { fetchAnalytics, type AnalyticsData } from "../../lib/supabase";

interface StatCardProps {
  label: string;
  value: number;
  sub?: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  border: string;
  delay?: number;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, sub, icon, color, bg, border, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    className="glass-card rounded-2xl p-5 border border-white/5 hover:border-gold-500/15 transition-colors"
  >
    <div className="flex items-start justify-between mb-4">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: bg, border: `1px solid ${border}`, color }}>
        {icon}
      </div>
    </div>
    <p className="text-stone-500 text-[10px] font-body uppercase tracking-[0.15em] mb-1">{label}</p>
    <p className="text-white font-display text-3xl font-light">{value.toLocaleString()}</p>
    {sub && <p className="text-stone-600 text-xs font-body mt-1">{sub}</p>}
  </motion.div>
);

interface AdminAnalyticsProps {
  /** Increment this value from outside to force a data refresh */
  refreshKey?: number;
}

export const AdminAnalytics: React.FC<AdminAnalyticsProps> = ({ refreshKey = 0 }) => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const result = await fetchAnalytics();
      setData(result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load analytics.");
    }
    setLoading(false);
  };

  // Refetch whenever the tab is first shown OR refreshKey changes (e.g. after delete)
  useEffect(() => { load(); }, [refreshKey]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 size={32} className="text-gold-500 animate-spin mb-4" />
        <p className="text-stone-500 text-sm font-body">Loading analytics...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-400">
        <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-body">{error || "Unknown error"}</p>
          <button onClick={load} className="mt-3 flex items-center gap-2 text-xs font-body text-stone-400 hover:text-white border-0 bg-transparent cursor-pointer">
            <RefreshCw size={12} /> Retry
          </button>
        </div>
      </div>
    );
  }

  const sections = [
    {
      title: "Messages",
      cards: [
        { label: "Total Messages", value: data.totalMessages, icon: <MessageSquare size={18} />, color: "#C9A84C", bg: "rgba(201,168,76,0.08)", border: "rgba(201,168,76,0.15)" },
      ],
    },
    {
      title: "Testimonials",
      cards: [
        { label: "Total Testimonials", value: data.totalTestimonials, sub: `${data.activeTestimonials} active`, icon: <Quote size={18} />, color: "#C9A84C", bg: "rgba(201,168,76,0.08)", border: "rgba(201,168,76,0.15)" },
        { label: "Active on Site", value: data.activeTestimonials, icon: <Quote size={18} />, color: "#4ade80", bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.15)" },
      ],
    },
    {
      title: "Services",
      cards: [
        { label: "Total Services", value: data.totalServices, sub: `${data.activeServices} active`, icon: <Scissors size={18} />, color: "#C9A84C", bg: "rgba(201,168,76,0.08)", border: "rgba(201,168,76,0.15)" },
        { label: "Active Services", value: data.activeServices, icon: <Scissors size={18} />, color: "#4ade80", bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.15)" },
      ],
    },
    {
      title: "Appointments",
      cards: [
        { label: "Total Bookings", value: data.totalAppointments, icon: <CalendarDays size={18} />, color: "#C9A84C", bg: "rgba(201,168,76,0.08)", border: "rgba(201,168,76,0.15)" },
        { label: "Pending", value: data.pendingAppointments, icon: <CalendarDays size={18} />, color: "#fbbf24", bg: "rgba(251,191,36,0.08)", border: "rgba(251,191,36,0.15)" },
        { label: "Confirmed", value: data.confirmedAppointments, icon: <CalendarDays size={18} />, color: "#60a5fa", bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.15)" },
        { label: "Completed", value: data.completedAppointments, icon: <CalendarDays size={18} />, color: "#4ade80", bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.15)" },
      ],
    },
    {
      title: "Gallery",
      cards: [
        { label: "Total Images", value: data.totalGallery, sub: `${data.activeGallery} active`, icon: <Image size={18} />, color: "#C9A84C", bg: "rgba(201,168,76,0.08)", border: "rgba(201,168,76,0.15)" },
        { label: "Active Images", value: data.activeGallery, icon: <Image size={18} />, color: "#4ade80", bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.15)" },
      ],
    },
  ];

  let delayCounter = 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-stone-500 text-xs font-body uppercase tracking-wider">Overview</p>
          <p className="text-stone-700 text-xs font-body mt-0.5">Last updated: {new Date().toLocaleTimeString("en-IN")}</p>
        </div>
        <button onClick={load}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-body text-stone-400 hover:text-white border border-white/10 hover:border-white/20 cursor-pointer bg-transparent transition-colors">
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      {sections.map((section) => (
        <div key={section.title} className="mb-8">
          <p className="text-xs text-stone-500 uppercase tracking-[0.2em] font-accent mb-4"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.5rem" }}>
            {section.title}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {section.cards.map((card) => {
              delayCounter += 0.06;
              return <StatCard key={card.label} {...card} delay={delayCounter} />;
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
