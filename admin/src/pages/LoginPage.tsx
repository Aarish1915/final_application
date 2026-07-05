import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAdminAuth } from "../App";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const { admin, login, loading } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <div className="w-6 h-6 border-2 border-gray-200 border-t-[#235A5D] rounded-full animate-spin" />
    </div>
  );

  if (admin) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src="/ingri-green-logo.png" alt="INGRI" className="h-14 w-auto object-contain mx-auto mb-3" />
          <p className="text-xs text-gray-400 mt-1">Admin Panel</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-sm font-medium text-gray-700 mb-1">Sign in</h2>
          <p className="text-xs text-gray-400 mb-5">Enter your credentials to continue</p>

          {error && (
            <div className="mb-4 px-3 py-2 bg-red-50 text-red-600 text-xs rounded-lg">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="admin@ingri.com" required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-[#235A5D]/30 focus:border-gray-300 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Password</label>
              <div className="relative">
                <input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-[#235A5D]/30 focus:border-gray-300 outline-none transition-all pr-10" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={submitting}
              className="w-full py-2 bg-[#235A5D] text-white text-sm font-medium rounded-lg hover:bg-[#2D7275] transition-colors disabled:opacity-50">
              {submitting ? (
                <span className="inline-flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : "Sign in"}
            </button>
          </form>

          <p className="text-center text-[10px] text-gray-300 mt-5">Authorized personnel only</p>
        </div>
      </div>
    </div>
  );
}
