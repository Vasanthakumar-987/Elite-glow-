import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scissors, Plus, Pencil, Trash2, ToggleLeft, ToggleRight,
  Search, Loader2, AlertCircle, CheckCircle, X,
} from "lucide-react";
import {
  type Service, type ServiceInsert,
  fetchAllServices, insertService, updateService, deleteService, toggleServiceActive,
} from "../../lib/supabase";

const EMPTY: ServiceInsert = {
  name: "", category: "", description: "", price: 0, duration_minutes: null, is_active: true,
};

export const AdminServices: React.FC = () => {
  const [items, setItems] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState<ServiceInsert>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  /**
   * Fetch ALL services from Supabase (admin sees all, including inactive).
   * We deliberately don't use setLoading(true) on background re-fetches after
   * insert/update/delete so the list never flashes to empty.
   */
  const load = useCallback(async (showSpinner = true) => {
    if (showSpinner) { setLoading(true); setError(null); }
    const { data, error: e } = await fetchAllServices();
    if (e) {
      setError(e.message);
    } else {
      // Only update if we actually got data back — prevents wiping list on RLS edge cases
      if (data !== null) setItems(data);
    }
    if (showSpinner) setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditing(null); setForm(EMPTY); setShowForm(true); };
  const openEdit = (s: Service) => {
    setEditing(s);
    setForm({ name: s.name, category: s.category ?? "", description: s.description ?? "", price: s.price, duration_minutes: s.duration_minutes, is_active: s.is_active });
    setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditing(null); setForm(EMPTY); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || form.price < 0) return;
    setSaving(true);
    const payload = {
      ...form,
      category: form.category || null,
      description: form.description || null,
      price: Number(form.price),
      duration_minutes: form.duration_minutes ? Number(form.duration_minutes) : null,
    };

    if (editing) {
      // ── UPDATE ──────────────────────────────────────────────────────────
      const { error: e } = await updateService(editing.id, payload);
      if (e) {
        showToast(e.message, "error");
      } else {
        showToast("Service updated!");
        closeForm();
        // Optimistically update the item in place, then background-sync
        setItems(prev => prev.map(s => s.id === editing.id ? { ...s, ...payload } : s));
        load(false);
      }
    } else {
      // ── INSERT ──────────────────────────────────────────────────────────
      const { data: inserted, error: e } = await insertService(payload);
      if (e) {
        showToast(e.message, "error");
      } else {
        showToast("Service added!");
        closeForm();
        if (inserted && inserted.length > 0) {
          // Optimistically prepend the new item so the list never disappears
          setItems(prev => [inserted[0] as Service, ...prev]);
        }
        // Background full re-fetch to make sure we're in sync with DB
        load(false);
      }
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this service?")) return;
    setDeletingId(id);
    const { data, error: e } = await deleteService(id);
    if (e) {
      showToast(e.message, "error");
    } else if (!data || data.length === 0) {
      showToast("Delete blocked by Supabase RLS. Please check table permissions.", "error");
    } else {
      showToast("Deleted.");
      // Remove from state immediately — no need to re-fetch
      setItems(prev => prev.filter(s => s.id !== id));
    }
    setDeletingId(null);
  };

  const handleToggle = async (s: Service) => {
    setTogglingId(s.id);
    const newActive = !s.is_active;
    const { error: e } = await toggleServiceActive(s.id, newActive);
    if (e) {
      showToast(e.message, "error");
    } else {
      showToast(newActive ? "Set to active." : "Set to inactive.");
      // Optimistic update: flip the flag locally
      setItems(prev => prev.map(item => item.id === s.id ? { ...item, is_active: newActive } : item));
    }
    setTogglingId(null);
  };

  const filtered = items.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.category ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const inputCls = "w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-body placeholder-stone-600 focus:outline-none focus:border-gold-500/40 transition-colors";

  return (
    <div className="relative">
      <AnimatePresence>
        {toast && (
          <motion.div key="toast" initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            className="fixed top-6 right-6 z-[200] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl"
            style={{ background: toast.type === "success" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)", border: `1px solid ${toast.type === "success" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`, backdropFilter: "blur(12px)" }}>
            {toast.type === "success" ? <CheckCircle size={16} style={{ color: "#4ade80" }} /> : <AlertCircle size={16} style={{ color: "#f87171" }} />}
            <span className={`text-sm font-body ${toast.type === "success" ? "text-green-300" : "text-red-300"}`}>{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-6">
          <div className="glass-card rounded-2xl p-4 flex items-center gap-4 border border-white/5">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.15)", color: "#C9A84C" }}>
              <Scissors size={22} />
            </div>
            <div>
              <p className="text-stone-500 text-xs font-body uppercase tracking-wider mb-1">Total</p>
              <p className="text-white font-display text-2xl font-light">{items.length}</p>
            </div>
          </div>
          <div className="glass-card rounded-2xl p-4 flex items-center gap-4 border border-white/5">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.15)", color: "#4ade80" }}>
              <CheckCircle size={22} />
            </div>
            <div>
              <p className="text-stone-500 text-xs font-body uppercase tracking-wider mb-1">Active</p>
              <p className="text-white font-display text-2xl font-light">{items.filter(s => s.is_active).length}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
            <input type="text" placeholder="Search services..." value={search} onChange={e => setSearch(e.target.value)}
              className="bg-white/5 border border-white/10 text-white rounded-xl py-2.5 pl-9 pr-4 text-sm font-body outline-none focus:border-gold-500/40 transition-colors placeholder:text-stone-600 w-56" />
          </div>
          <button onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-body font-medium text-black border-0 cursor-pointer transition-all hover:scale-[1.02]"
            style={{ background: "linear-gradient(135deg, #C9A84C, #F5E68A)", boxShadow: "0 4px 16px rgba(201,168,76,0.3)" }}>
            <Plus size={15} /> Add Service
          </button>
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
          <p className="text-stone-500 text-sm font-body">Loading services...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card rounded-2xl border border-white/5 p-16 text-center">
          <div className="w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-4" style={{ background: "rgba(255,255,255,0.02)" }}>
            <Scissors size={24} className="text-stone-600" />
          </div>
          <h3 className="text-white font-display text-xl mb-2">{search ? "No results found" : "No services yet"}</h3>
          <p className="text-stone-500 text-sm font-body max-w-xs mx-auto">{search ? "Try a different search term." : "Add your first service using the button above."}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <AnimatePresence>
            {filtered.map((s, i) => (
              <motion.div key={s.id} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ delay: i * 0.04 }}
                className="glass-card rounded-2xl p-6 border border-white/5 hover:border-gold-500/15 transition-colors group">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4 className="text-white font-display text-base">{s.name}</h4>
                      {s.category && <span className="px-2 py-0.5 rounded-full text-[10px] font-body bg-stone-700/40 text-stone-400 border border-white/5">{s.category}</span>}
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-body font-medium ${s.is_active ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-stone-700/40 text-stone-500 border border-white/5"}`}>
                        {s.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    {s.description && <p className="text-stone-500 text-xs font-body line-clamp-2 mb-2">{s.description}</p>}
                    <div className="flex items-center gap-4">
                      <span className="text-gold-400 font-display text-lg">₹{s.price.toLocaleString()}</span>
                      {s.duration_minutes && <span className="text-stone-500 text-xs font-body">{s.duration_minutes} min</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-3 flex-shrink-0">
                    <button onClick={() => handleToggle(s)} disabled={togglingId === s.id} title={s.is_active ? "Set inactive" : "Set active"}
                      className="p-2 rounded-lg transition-colors border-0 cursor-pointer disabled:opacity-50"
                      style={{ background: "rgba(201,168,76,0.08)", color: "#C9A84C" }}>
                      {togglingId === s.id ? <Loader2 size={15} className="animate-spin" /> : s.is_active ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                    </button>
                    <button onClick={() => openEdit(s)} title="Edit" className="p-2 rounded-lg transition-colors border-0 cursor-pointer" style={{ background: "rgba(255,255,255,0.05)", color: "#a8a29e" }}>
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => handleDelete(s.id)} disabled={deletingId === s.id} title="Delete"
                      className="p-2 rounded-lg transition-colors border-0 cursor-pointer disabled:opacity-50"
                      style={{ background: "rgba(239,68,68,0.08)", color: "#f87171", border: "1px solid rgba(239,68,68,0.15)" }}>
                      {deletingId === s.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
            onClick={e => { if (e.target === e.currentTarget) closeForm(); }}>
            <motion.div initial={{ scale: 0.94, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.94, opacity: 0, y: 20 }} transition={{ duration: 0.25 }}
              className="w-full max-w-lg glass-card rounded-2xl p-8"
              style={{ border: "1px solid rgba(201,168,76,0.15)", maxHeight: "90vh", overflowY: "auto" }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl font-light text-white">{editing ? "Edit Service" : "Add Service"}</h2>
                <button onClick={closeForm} className="border-0 bg-transparent text-stone-500 hover:text-white cursor-pointer p-1"><X size={20} /></button>
              </div>
              <form onSubmit={handleSave} className="space-y-5">
                <div>
                  <label className="text-xs text-stone-500 uppercase tracking-wider font-body mb-2 block">Service Name <span style={{ color: "#C9A84C" }}>*</span></label>
                  <input required type="text" placeholder="e.g. Bridal Makeup" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inputCls} />
                </div>

                <div>
                  <label className="text-xs text-stone-500 uppercase tracking-wider font-body mb-2 block">Description</label>
                  <textarea rows={3} placeholder="Brief description..." value={form.description ?? ""} onChange={e => setForm({ ...form, description: e.target.value })} className={inputCls} style={{ resize: "none" }} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-stone-500 uppercase tracking-wider font-body mb-2 block">Price (₹) <span style={{ color: "#C9A84C" }}>*</span></label>
                    <input required type="number" min="0" placeholder="0" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} className={inputCls} />
                  </div>
                  <div>
                    <label className="text-xs text-stone-500 uppercase tracking-wider font-body mb-2 block">Duration (min)</label>
                    <input type="number" min="0" placeholder="60" value={form.duration_minutes ?? ""} onChange={e => setForm({ ...form, duration_minutes: e.target.value ? Number(e.target.value) : null })} className={inputCls} />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setForm({ ...form, is_active: !form.is_active })} className="border-0 bg-transparent cursor-pointer p-0">
                    {form.is_active ? <ToggleRight size={28} style={{ color: "#C9A84C" }} /> : <ToggleLeft size={28} className="text-stone-600" />}
                  </button>
                  <span className="text-sm font-body text-stone-400">{form.is_active ? "Active (visible on site)" : "Inactive (hidden from site)"}</span>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={closeForm} className="flex-1 py-3 rounded-xl font-body text-sm text-stone-400 hover:text-white border-0 cursor-pointer" style={{ background: "rgba(255,255,255,0.05)" }}>Cancel</button>
                  <button type="submit" disabled={saving} className="flex-1 py-3 rounded-xl font-body font-medium text-sm text-black border-0 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70"
                    style={{ background: "linear-gradient(135deg, #C9A84C, #F5E68A)" }}>
                    {saving && <Loader2 size={15} className="animate-spin" />}
                    {saving ? "Saving..." : editing ? "Update" : "Add Service"}
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
