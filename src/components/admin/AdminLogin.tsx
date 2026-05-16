import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Lock } from "lucide-react";

interface AdminLoginProps {
  onLogin: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // 1. Clean the input (removes accidental spaces at start/end)
    const cleanPassword = password.trim();

    // 2. Debugging: Verify exactly what was entered (remove in production!)
    console.log("Attempted password:", `"${cleanPassword}"`);

    // Simulate slight delay for smooth UI feel
    await new Promise((r) => setTimeout(r, 600));

    // 3. Best Practice: Use Environment Variable (fallback to Admin123)
    // To set this, add VITE_ADMIN_PASSWORD=YourSecurePassword to your .env file
    const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "Admin@01";

    if (cleanPassword === ADMIN_PASSWORD) {
      console.log("Login successful!");
      onLogin();
    } else {
      console.error("Login failed. Password did not match.");
      setError("Incorrect password. Please try again.");
      // UX Improvement: Clear the password field on failure
      setPassword("");
    }
    setLoading(false);
  };

  const inputBase =
    "w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-4 text-white text-sm font-body placeholder-stone-700 focus:outline-none focus:border-gold-500/40 transition-colors duration-300";

  return (
    <div className="min-h-screen flex items-center justify-center px-6"
      style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.06) 0%, #0a0a0a 60%)" }}>

      {/* Decorative orb */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)", filter: "blur(60px)" }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: "linear-gradient(135deg, #C9A84C, #F5E68A)" }}>
            <span className="text-black font-accent font-bold">EG</span>
          </div>
          <h1 className="font-display text-3xl text-white font-light mb-1">Admin Access</h1>
          <p className="text-stone-500 text-sm font-body">Enter the master password</p>
        </div>

        <div className="glass-card rounded-2xl p-8 border border-white/5">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-xs text-stone-500 uppercase tracking-wider font-body mb-3 block">Master Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-600" />
                <input
                  type={showPass ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputBase} pl-11 pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-600 hover:text-stone-400 border-0 bg-transparent cursor-pointer p-0 transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <p
                    className="text-red-400 text-xs font-body text-center bg-red-500/10 rounded-lg px-4 py-3"
                    style={{ border: "1px solid rgba(248,113,113,0.2)" }}
                  >
                    {error}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-body font-medium text-sm text-black border-0 cursor-pointer transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
              style={{
                background: "linear-gradient(135deg, #C9A84C, #F5E68A)",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading && <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />}
              {loading ? "Verifying..." : "Unlock Dashboard"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
