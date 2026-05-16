import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star, Plus, Pencil, Trash2, ToggleLeft, ToggleRight,
  Search, Loader2, AlertCircle, Quote, CheckCircle, X,
} from "lucide-react";
import {
  type Testimonial, type TestimonialInsert,
  fetchAllTestimonials, insertTestimonial, updateTestimonial,
  deleteTestimonial, toggleTestimonialActive,
} from "../../lib/supabase";

// ─── Sub-components ───────────────────────────────────────────────────────────

const StarRating: React.FC<{ value: number; onChange?: (v: number) => void; readonly?: boolean }> = ({
  value, onChange, readonly = false,
}) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((s) => (
      <button
        key={s}
        type="button"
        disabled={readonly}
        onClick={() => onChange?.(s)}
        className="border-0 bg-transparent p-0 cursor-pointer disabled:cursor-default"
      >
        <Star
          size={16}
          fill={s <= value ? "#C9A84C" : "transparent"}
          stroke={s <= value ? "#C9A84C" : "#444"}
        />
      </button>
    ))}
  </div>
);

const EMPTY_FORM: TestimonialInsert = {
  customer_name: "", customer_role: "", message: "", rating: 5, is_active: true,
};

// ─── Main Component ───────────────────────────────────────────────────────────
export const AdminTestimonials: React.FC = () => {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [form, setForm] = useState<TestimonialInsert>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: e } = await fetchAllTestimonials();
    if (e) { setError(e.message); } else { setItems(data || []); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setShowForm(true); };
  const openEdit = (t: Testimonial) => {
    setEditing(t);
    setForm({ customer_name: t.customer_name, customer_role: t.customer_role ?? "", message: t.message, rating: t.rating, is_active: t.is_active });
    setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditing(null); setForm(EMPTY_FORM); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customer_name.trim() || !form.message.trim()) return;
    setSaving(true);
    const payload = { ...form, customer_role: form.customer_role || null };
    if (editing) {
      const { error: e } = await updateTestimonial(editing.id, payload);
      if (e) { showToast(e.message, "error"); }
      else { showToast("Testimonial updated!"); closeForm(); load(); }
    } else {
      const { error: e } = await insertTestimonial(payload);
      if (e) { showToast(e.message, "error"); }
      else { showToast("Testimonial added!"); closeForm(); load(); }
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this testimonial? This cannot be undone.")) return;
    setDeletingId(id);
    const { error: e } = await deleteTestimonial(id);
    if (e) showToast(e.message, "error");
    else { showToast("Deleted."); setItems((prev) => prev.filter((t) => t.id !== id)); }
    setDeletingId(null);
  };

  const handleToggle = async (t: Testimonial) => {
    setTogglingId(t.id);
    const { error: e } = await toggleTestimonialActive(t.id, !t.is_active);
    if (e) showToast(e.message, "error");
    else { showToast(t.is_active ? "Set to inactive." : "Set to active."); load(); }
    setTogglingId(null);
  };

  const filtered = items.filter((t) =>
    t.customer_name.toLowerCase().includes(search.toLowerCase()) ||
    t.message.toLowerCase().includes(search.toLowerCase())
  );

  const inputCls = "w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-body placeholder-stone-600 focus:outline-none focus:border-gold-500/40 transition-colors";

  return (
    <div className="relative">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="fixed top-6 right-6 z-[200] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl"
            style={{
              background: toast.type === "success" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
              border: `1px solid ${toast.type === "success" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
              backdropFilter: "blur(12px)",
            }}
          >
            {toast.type === "success"
              ? <CheckCircle size={16} style={{ color: "#4ade80" }} />
              : <AlertCircle size={16} style={{ color: "#f87171" }} />}
            <span className={`text-sm font-body ${toast.type === "success" ? "text-green-300" : "text-red-300"}`}>
              {toast.msg}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-6">
          <div className="glass-card rounded-2xl p-4 flex items-center gap-4 border border-white/5">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.15)", color: "#C9A84C" }}>
              <Quote size={22} />
            </div>
            <div>
              <p className="text-stone-500 text-xs font-body uppercase tracking-wider mb-1">Total</p>
              <p className="text-white font-display text-2xl font-light">{items.length}</p>
            </div>
          </div>
          <div className="glass-card rounded-2xl p-4 flex items-center gap-4 border border-white/5">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.15)", color: "#4ade80" }}>
              <CheckCircle size={22} />
            </div>
            <div>
              <p className="text-stone-500 text-xs font-body uppercase tracking-wider mb-1">Active</p>
              <p className="text-white font-display text-2xl font-light">{items.filter((t) => t.is_active).length}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
            <input
              type="text"
              placeholder="Search testimonials..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white/5 border border-white/10 text-white rounded-xl py-2.5 pl-9 pr-4 text-sm font-body outline-none focus:border-gold-500/40 transition-colors placeholder:text-stone-600 w-56"
            />
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-body font-medium text-black border-0 cursor-pointer transition-all hover:scale-[1.02]"
            style={{ background: "linear-gradient(135deg, #C9A84C, #F5E68A)", boxShadow: "0 4px 16px rgba(201,168,76,0.3)" }}
          >
            <Plus size={15} /> Add Testimonial
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-400">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <p className="text-sm font-body">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 size={28} className="text-gold-500 animate-spin mb-3" />
          <p className="text-stone-500 text-sm font-body">Loading testimonials...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card rounded-2xl border border-white/5 p-16 text-center">
          <div className="w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-4" style={{ background: "rgba(255,255,255,0.02)" }}>
            <Quote size={24} className="text-stone-600" />
          </div>
          <h3 className="text-white font-display text-xl mb-2">
            {search ? "No results found" : "No testimonials yet"}
          </h3>
          <p className="text-stone-500 text-sm font-body max-w-xs mx-auto">
            {search ? "Try a different search term." : "Add your first testimonial using the button above."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <AnimatePresence>
            {filtered.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ delay: i * 0.04 }}
                className="glass-card rounded-2xl p-6 border border-white/5 hover:border-gold-500/15 transition-colors group"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-white font-display text-base">{t.customer_name}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-body font-medium ${t.is_active ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-stone-700/40 text-stone-500 border border-white/5"}`}>
                        {t.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    {t.customer_role && (
                      <p className="text-stone-500 text-xs font-body">{t.customer_role}</p>
                    )}
                    <div className="mt-1.5"><StarRating value={t.rating} readonly /></div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleToggle(t)}
                      disabled={togglingId === t.id}
                      title={t.is_active ? "Set inactive" : "Set active"}
                      className="p-2 rounded-lg transition-colors border-0 cursor-pointer disabled:opacity-50"
                      style={{ background: "rgba(201,168,76,0.08)", color: "#C9A84C" }}
                    >
                      {togglingId === t.id
                        ? <Loader2 size={15} className="animate-spin" />
                        : t.is_active ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                    </button>
                    <button
                      onClick={() => openEdit(t)}
                      title="Edit"
                      className="p-2 rounded-lg transition-colors border-0 cursor-pointer"
                      style={{ background: "rgba(255,255,255,0.05)", color: "#a8a29e" }}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      disabled={deletingId === t.id}
                      title="Delete"
                      className="p-2 rounded-lg transition-colors border-0 cursor-pointer disabled:opacity-50"
                      style={{ background: "rgba(239,68,68,0.08)", color: "#f87171", border: "1px solid rgba(239,68,68,0.15)" }}
                    >
                      {deletingId === t.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                    </button>
                  </div>
                </div>
                <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                  <p className="text-stone-300 text-sm font-body leading-relaxed line-clamp-3">{t.message}</p>
                </div>
                <p className="text-stone-700 text-[11px] font-body mt-3">
                  {new Date(t.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
            onClick={(e) => { if (e.target === e.currentTarget) closeForm(); }}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 20 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-lg glass-card rounded-2xl p-8"
              style={{ border: "1px solid rgba(201,168,76,0.15)", maxHeight: "90vh", overflowY: "auto" }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl font-light text-white">
                  {editing ? "Edit Testimonial" : "Add Testimonial"}
                </h2>
                <button onClick={closeForm} className="border-0 bg-transparent text-stone-500 hover:text-white cursor-pointer p-1 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-5">
                <div>
                  <label className="text-xs text-stone-500 uppercase tracking-wider font-body mb-2 block">
                    Customer Name <span style={{ color: "#C9A84C" }}>*</span>
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Priya Sharma"
                    value={form.customer_name}
                    onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="text-xs text-stone-500 uppercase tracking-wider font-body mb-2 block">Role / Description</label>
                  <input
                    type="text"
                    placeholder="e.g. Regular Client, Bride"
                    value={form.customer_role ?? ""}
                    onChange={(e) => setForm({ ...form, customer_role: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="text-xs text-stone-500 uppercase tracking-wider font-body mb-2 block">
                    Message <span style={{ color: "#C9A84C" }}>*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="What did the customer say?"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className={inputCls}
                    style={{ resize: "none" }}
                  />
                </div>
                <div>
                  <label className="text-xs text-stone-500 uppercase tracking-wider font-body mb-3 block">Rating</label>
                  <StarRating value={form.rating} onChange={(v) => setForm({ ...form, rating: v })} />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, is_active: !form.is_active })}
                    className="border-0 bg-transparent cursor-pointer p-0"
                  >
                    {form.is_active
                      ? <ToggleRight size={28} style={{ color: "#C9A84C" }} />
                      : <ToggleLeft size={28} className="text-stone-600" />}
                  </button>
                  <span className="text-sm font-body text-stone-400">
                    {form.is_active ? "Active (visible on site)" : "Inactive (hidden from site)"}
                  </span>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeForm}
                    className="flex-1 py-3 rounded-xl font-body text-sm text-stone-400 hover:text-white border-0 cursor-pointer transition-colors"
                    style={{ background: "rgba(255,255,255,0.05)" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-3 rounded-xl font-body font-medium text-sm text-black border-0 cursor-pointer flex items-center justify-center gap-2 transition-all hover:scale-[1.01] disabled:opacity-70"
                    style={{ background: "linear-gradient(135deg, #C9A84C, #F5E68A)" }}
                  >
                    {saving && <Loader2 size={15} className="animate-spin" />}
                    {saving ? "Saving..." : editing ? "Update" : "Add Testimonial"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
