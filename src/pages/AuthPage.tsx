import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Lock, ArrowLeft } from "lucide-react";
import { useAuth } from "../context/useAuth";

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") === "register" ? true : false;
  const redirectTo = searchParams.get("redirect") || "/";

  const [isRegister, setIsRegister] = useState(defaultTab);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { user, login, register } = useAuth();
  const navigate = useNavigate();

  // If already logged in, redirect
  useEffect(() => {
    if (user) navigate(redirectTo, { replace: true });
  }, [user, navigate, redirectTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isRegister) {
        await register(form.name, form.email, form.password);
      } else {
        await login(form.email, form.password);
      }
      navigate(redirectTo, { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F9F9] flex flex-col">
      {/* Top bar */}
      <div className="px-4 sm:px-6 py-4 flex items-center">
        <Link to="/" className="flex items-center gap-2 text-[#1A4547]/60 hover:text-[#1A4547] transition-colors font-body text-sm">
          <ArrowLeft size={16} />
          <span className="hidden sm:inline">Back to Home</span>
        </Link>
      </div>

      {/* Centered card */}
      <div className="flex-1 flex items-center justify-center px-4 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          {/* Logo + heading */}
          <div className="text-center mb-8">
            <img src="/ingri-green-logo.png" alt="INGRI" className="h-12 sm:h-14 w-auto object-contain mx-auto mb-5" />
            <h1 className="font-heading text-2xl sm:text-3xl text-[#1A4547] font-bold">
              {isRegister ? "Create your account" : "Welcome back"}
            </h1>
            <p className="font-body text-sm text-[#1A4547]/50 mt-2">
              {isRegister ? "Join Ingri to start shopping" : "Sign in to your Ingri account"}
            </p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(35,90,93,0.08)] border border-[#1A4547]/[0.06] p-6 sm:p-8">
            {/* Tabs */}
            <div className="flex rounded-full bg-[#F2F9F9] border border-[#1A4547]/[0.08] p-1 mb-6">
              <button
                onClick={() => { setIsRegister(false); setError(""); }}
                className={`flex-1 py-2.5 rounded-full font-body text-sm transition-all duration-200 ${
                  !isRegister ? "bg-[#1A4547] text-white shadow-sm font-medium" : "text-[#1A4547]/50 hover:text-[#1A4547]/70"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setIsRegister(true); setError(""); }}
                className={`flex-1 py-2.5 rounded-full font-body text-sm transition-all duration-200 ${
                  isRegister ? "bg-[#1A4547] text-white shadow-sm font-medium" : "text-[#1A4547]/50 hover:text-[#1A4547]/70"
                }`}
              >
                Register
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-body">
                  {error}
                </div>
              )}

              <AnimatePresence mode="wait">
                {isRegister && (
                  <motion.div
                    key="name"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="relative mb-4">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1A4547]/30" size={16} />
                      <input
                        type="text"
                        placeholder="Full name"
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        required={isRegister}
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-[#F2F9F9] border border-[#1A4547]/[0.08] font-body text-sm text-[#1A4547] placeholder:text-[#1A4547]/30 focus:outline-none focus:border-[#1A4547]/30 focus:bg-white transition-all"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1A4547]/30" size={16} />
                <input
                  type="email"
                  placeholder="Email address"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-[#F2F9F9] border border-[#1A4547]/[0.08] font-body text-sm text-[#1A4547] placeholder:text-[#1A4547]/30 focus:outline-none focus:border-[#1A4547]/30 focus:bg-white transition-all"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1A4547]/30" size={16} />
                <input
                  type="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={6}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-[#F2F9F9] border border-[#1A4547]/[0.08] font-body text-sm text-[#1A4547] placeholder:text-[#1A4547]/30 focus:outline-none focus:border-[#1A4547]/30 focus:bg-white transition-all"
                />
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3.5 rounded-full bg-[#1A4547] text-white font-body text-sm font-medium tracking-wide hover:bg-[#122E30] transition-all duration-200 disabled:opacity-50 shadow-md mt-2"
              >
                {loading ? "Please wait..." : isRegister ? "Create Account" : "Sign In"}
              </motion.button>
            </form>
          </div>

          {/* Footer text */}
          <p className="text-center font-body text-xs text-[#1A4547]/40 mt-6">
            By continuing, you agree to Ingri's Terms of Service and Privacy Policy.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
