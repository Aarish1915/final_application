import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { Package, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { apiUrl } from '@/lib/api';
import { useAuth } from '../context/useAuth';

export default function TrackOrderPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading, loginWithToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && user) {
      navigate('/my-orders');
    }
  }, [user, authLoading, navigate]);

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/auth/google'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential })
      });
      const data = await res.json();
      if (res.ok) {
        await loginWithToken(data.token, data.user);
        navigate('/my-orders'); 
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch {
      setError('An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        await loginWithToken(data.token, data.user);
        navigate('/my-orders');
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch {
      setError('Network error, please try again');
    } finally {
      setLoading(false);
    }
  };


  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
      <div className="min-h-screen bg-[#F5FAFA] flex flex-col">
        <Navbar />
        
        <main className="flex-1 flex items-center justify-center py-20 px-4">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 md:p-12 rounded-3xl shadow-[0_8px_30px_rgba(26,69,71,0.04)] max-w-md w-full text-center border border-[#1A4547]/10"
          >
            <div className="w-16 h-16 bg-[#1A4547]/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Package className="text-[#1A4547] w-8 h-8" />
            </div>
            
            <h1 className="font-heading text-2xl text-[#1A3C3E] font-bold mb-3">Track Your Orders</h1>
            <p className="text-gray-500 font-body text-sm mb-8">
              Sign in securely with Google to view the live status of all your past guest orders.
            </p>
            
            <div className="bg-gray-50 rounded-xl p-4 mb-8 flex items-start gap-3 text-left border border-gray-100">
              <ShieldCheck className="text-emerald-500 w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-xs text-gray-500 font-body leading-relaxed">
                We'll automatically match any orders placed using your Google email address. No password required.
              </p>
            </div>
            
            {error && (
              <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-lg font-medium">
                {error}
              </div>
            )}
            
            <form onSubmit={handleManualLogin} className="flex flex-col gap-4 mb-6">
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address" 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1A4547]/20 focus:border-[#1A4547] text-sm"
              />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password" 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1A4547]/20 focus:border-[#1A4547] text-sm"
              />
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#1A4547] text-white font-medium rounded-xl py-3 hover:bg-[#113032] transition-colors mt-2 disabled:opacity-70 flex justify-center items-center"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="flex items-center gap-4 mb-6">
              <div className="h-px bg-gray-200 flex-1"></div>
              <span className="text-gray-400 text-sm font-medium">or</span>
              <div className="h-px bg-gray-200 flex-1"></div>
            </div>
            
            <div className="flex justify-center mb-4 min-h-[44px]">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google Login Failed')}
                useOneTap
                theme="outline"
                shape="rectangular"
                width="100%"
                text="continue_with"
              />
            </div>
            
            <p className="text-xs text-gray-400 mt-6">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </motion.div>
        </main>
        
        <Footer />
      </div>
    </GoogleOAuthProvider>
  );
}
