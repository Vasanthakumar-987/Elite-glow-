import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Image, Plus, Pencil, Trash2, ToggleLeft, ToggleRight,
  Search, Loader2, AlertCircle, CheckCircle, X,
} from "lucide-react";
import {
  type GalleryItem, type GalleryInsert,
  fetchAllGallery, insertGallery, updateGallery, deleteGallery, toggleGalleryActive,
} from "../../lib/supabase";

const EMPTY: GalleryInsert = {
  title: "", image_url: "", category: "", description: "", price: "", is_active: true,
};

export const AdminGallery: React.FC = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<GalleryItem | null>(null);
  const [form, setForm] = useState<GalleryInsert>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState(false);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  /**
   * Fetch ALL gallery items from Supabase.
   * showSpinner=false is used for background re-fetches after mutations
   * so the list never flashes to empty while awaiting the response.
   */
  const load = useCallback(async (showSpinner = true) => {
    if (showSpinner) { setLoading(true); setError(null); }
    const { data, error: e } = await fetchAllGallery();
    if (e) {
      setError(e.message);
    } else {
      // Guard: only update state if data is non-null (prevents wiping list on RLS edge cases)
      if (data !== null) setItems(data);
    }
    if (showSpinner) setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditing(null); setForm(EMPTY); setPreviewError(false); setShowForm(true); };
  const openEdit = (g: GalleryItem) => {
    setEditing(g);
    setForm({ title: g.title ?? "", image_url: g.image_url, category: g.category ?? "", description: g.description ?? "", price: g.price ?? "", is_active: g.is_active });
    setPreviewError(false);
    setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditing(null); setForm(EMPTY); setPreviewError(false); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.image_url.trim()) return;
    setSaving(true);
    const payload = { ...form, title: form.title || null, category: form.category || null, description: form.description || null, price: form.price || null };

    if (editing) {
      // ── UPDATE ──────────────────────────────────────────────────────────
      const { error: e } = await updateGallery(editing.id, payload);
      if (e) {
        showToast(e.message, "error");
      } else {
        showToast("Image updated!");
        closeForm();
        // Optimistic in-place update, then background sync
        setItems(prev => prev.map(g => g.id === editing.id ? { ...g, ...payload } : g));
        load(false);
      }
    } else {
      // ── INSERT ──────────────────────────────────────────────────────────
      const { data: inserted, error: e } = await insertGallery(payload);
      if (e) {
        showToast(e.message, "error");
      } else {
        showToast("Image added!");
        closeForm();
        if (inserted && inserted.length > 0) {
          // Optimistically prepend — existing items are preserved in prev
          setItems(prev => [inserted[0] as GalleryItem, ...prev]);
        }
        // Background full re-fetch for DB consistency
        load(false);
      }
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this gallery item?")) return;
    setDeletingId(id);
    const { data, error: e } = await deleteGallery(id);
    if (e) {
      showToast(e.message, "error");
    } else if (!data || data.length === 0) {
      showToast("Delete blocked by Supabase RLS. Please check table permissions.", "error");
    } else {
      showToast("Deleted.");
      // Remove only the targeted item — all others remain intact
      setItems(prev => prev.filter(g => g.id !== id));
    }
    setDeletingId(null);
  };

  const handleToggle = async (g: GalleryItem) => {
    setTogglingId(g.id);
    const newActive = !g.is_active;
    const { error: e } = await toggleGalleryActive(g.id, newActive);
    if (e) {
      showToast(e.message, "error");
    } else {
      showToast(newActive ? "Set to active." : "Set to inactive.");
      // Optimistic flip — no full re-fetch needed
      setItems(prev => prev.map(item => item.id === g.id ? { ...item, is_active: newActive } : item));
    }
    setTogglingId(null);
  };

  const filtered = items.filter(g =>
    (g.title ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (g.category ?? "").toLowerCase().includes(search.toLowerCase())
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
              <Image size={22} />
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
              <p className="text-white font-display text-2xl font-light">{items.filter(g => g.is_active).length}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
            <input type="text" placeholder="Search gallery..." value={search} onChange={e => setSearch(e.target.value)}
              className="bg-white/5 border border-white/10 text-white rounded-xl py-2.5 pl-9 pr-4 text-sm font-body outline-none focus:border-gold-500/40 transition-colors placeholder:text-stone-600 w-56" />
          </div>
          <button onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-body font-medium text-black border-0 cursor-pointer transition-all hover:scale-[1.02]"
            style={{ background: "linear-gradient(135deg, #C9A84C, #F5E68A)", boxShadow: "0 4px 16px rgba(201,168,76,0.3)" }}>
            <Plus size={15} /> Add Image
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
          <p className="text-stone-500 text-sm font-body">Loading gallery...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card rounded-2xl border border-white/5 p-16 text-center">
          <div className="w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-4" style={{ background: "rgba(255,255,255,0.02)" }}>
            <Image size={24} className="text-stone-600" />
          </div>
          <h3 className="text-white font-display text-xl mb-2">{search ? "No results found" : "No images yet"}</h3>
          <p className="text-stone-500 text-sm font-body max-w-xs mx-auto">{search ? "Try a different search term." : "Add your first gallery image using the button above."}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence>
            {filtered.map((g, i) => (
              <motion.div key={g.id} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ delay: i * 0.03 }}
                className="relative group rounded-2xl overflow-hidden border border-white/5 hover:border-gold-500/20 transition-colors aspect-square">
                <img src={g.image_url} alt={g.title ?? "Gallery"} className="w-full h-full object-cover"
                  onError={e => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1560066984-138daaa0b9d5?w=400"; }} />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      {g.title && <p className="text-white text-xs font-body font-medium line-clamp-1">{g.title}</p>}
                      {g.category && <p className="text-stone-400 text-[10px] font-body">{g.category}</p>}
                    </div>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-body ${g.is_active ? "bg-green-500/20 text-green-400" : "bg-stone-700/60 text-stone-500"}`}>
                      {g.is_active ? "Active" : "Off"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 justify-end">
                    <button onClick={() => handleToggle(g)} disabled={togglingId === g.id} title={g.is_active ? "Deactivate" : "Activate"}
                      className="p-1.5 rounded-lg border-0 cursor-pointer disabled:opacity-50" style={{ background: "rgba(201,168,76,0.15)", color: "#C9A84C" }}>
                      {togglingId === g.id ? <Loader2 size={13} className="animate-spin" /> : g.is_active ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
                    </button>
                    <button onClick={() => openEdit(g)} title="Edit" className="p-1.5 rounded-lg border-0 cursor-pointer" style={{ background: "rgba(255,255,255,0.1)", color: "#a8a29e" }}>
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => handleDelete(g.id)} disabled={deletingId === g.id} title="Delete"
                      className="p-1.5 rounded-lg border-0 cursor-pointer disabled:opacity-50" style={{ background: "rgba(239,68,68,0.15)", color: "#f87171" }}>
                      {deletingId === g.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
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
                <h2 className="font-display text-2xl font-light text-white">{editing ? "Edit Image" : "Add Image"}</h2>
                <button onClick={closeForm} className="border-0 bg-transparent text-stone-500 hover:text-white cursor-pointer p-1"><X size={20} /></button>
              </div>
              <form onSubmit={handleSave} className="space-y-5">
                <div>
                  <label className="text-xs text-stone-500 uppercase tracking-wider font-body mb-2 block">Image URL <span style={{ color: "#C9A84C" }}>*</span></label>
                  <input required type="url" placeholder="https://example.com/image.jpg" value={form.image_url}
                    onChange={e => { setForm({ ...form, image_url: e.target.value }); setPreviewError(false); }}
                    className={inputCls} />
                  {form.image_url && (
                    <div className="mt-3 rounded-xl overflow-hidden aspect-video bg-black/30">
                      {previewError ? (
                        <div className="w-full h-full flex items-center justify-center text-stone-600 text-xs font-body">Invalid image URL</div>
                      ) : (
                        <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" onError={() => setPreviewError(true)} />
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-xs text-stone-500 uppercase tracking-wider font-body mb-2 block">Title</label>
                  <input type="text" placeholder="e.g. Bridal Updo" value={form.title ?? ""} onChange={e => setForm({ ...form, title: e.target.value })} className={inputCls} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-stone-500 uppercase tracking-wider font-body mb-2 block">Category</label>
                    <input type="text" placeholder="e.g. Hair, Makeup" value={form.category ?? ""} onChange={e => setForm({ ...form, category: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className="text-xs text-stone-500 uppercase tracking-wider font-body mb-2 block">Price</label>
                    <input type="text" placeholder="e.g. 800" value={form.price ?? ""} onChange={e => setForm({ ...form, price: e.target.value })} className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-stone-500 uppercase tracking-wider font-body mb-2 block">Description</label>
                  <textarea rows={2} placeholder="Brief description..." value={form.description ?? ""} onChange={e => setForm({ ...form, description: e.target.value })} className={inputCls} style={{ resize: "none" }} />
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
                    {saving ? "Saving..." : editing ? "Update" : "Add Image"}
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
