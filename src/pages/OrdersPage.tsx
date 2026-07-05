import { useEffect, useState, useCallback } from 'react';
import { motion } from "framer-motion";
import { useAuth } from '../context/useAuth';
import { apiUrl } from '@/lib/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ShoppingBag, Package, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

type OrderItem = { name: string; price: number; quantity: number };
type OrderSummary = {
  _id: string;
  orderId?: string;
  createdAt?: string;
  status?: string;
  total?: number;
  items?: OrderItem[];
};

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  preparing: "bg-blue-50 text-blue-700 border-blue-200",
  ready: "bg-emerald-50 text-emerald-700 border-emerald-200",
  delivered: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-red-50 text-red-600 border-red-200",
};

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");

  const parseError = async (res: Response) => {
    const requestId = res.headers.get("X-Request-Id") || "";
    try {
      const data = await res.json();
      const message = data?.details || data?.error || res.statusText || "Request failed";
      return { message, requestId };
    } catch {
      return { message: res.statusText || "Request failed", requestId };
    }
  };

  const fetchOrders = useCallback(async (isPolling = false) => {
    if (!isPolling) setLoading(true);
    setOrdersError("");
    try {
      const params = new URLSearchParams();
      if (user?.email) params.set('email', user.email);
      const res = await fetch(apiUrl(`/api/orders?${params.toString()}`));
      if (!res.ok) {
        const err = await parseError(res);
        console.error("Orders fetch failed", { status: res.status, ...err });
        if (!isPolling) setOrdersError(err.requestId ? `${err.message} (ref: ${err.requestId})` : err.message);
        if (!isPolling) setOrders([]);
        return;
      }
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      if (!isPolling) {
        const msg = err instanceof Error ? err.message : "Unable to load orders";
        setOrdersError(msg);
      }
    } finally {
      if (!isPolling) setLoading(false);
    }
  }, [user]);

  // Initial fetch
  useEffect(() => { fetchOrders(false); }, [fetchOrders]);

  // Real-time polling every 30 seconds for instant order status updates
  useEffect(() => {
    const interval = setInterval(() => fetchOrders(true), 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const formatDate = (d?: string) => {
    if (!d) return "";
    try { return new Date(d).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }); }
    catch { return d; }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-28 pb-12 overflow-hidden bg-gradient-to-br from-[#EFF7F7] via-white to-[#FAFAF7]">
        <div className="absolute top-16 right-16 w-72 h-72 rounded-full bg-[#C8A951]/8 blur-3xl" />
        <div className="absolute bottom-10 left-10 w-48 h-48 rounded-full bg-[#C8A951]/6 blur-3xl" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white border border-[#C8A951]/25 shadow-[0_4px_20px_rgba(200,169,81,0.12)] mb-5">
              <ShoppingBag className="w-6 h-6 text-[#C8A951]" />
            </div>
            <p className="font-body text-xs tracking-[0.3em] text-[#C8A951] uppercase mb-3">Order History</p>
            <h1 className="font-heading text-3xl md:text-4xl text-[#333] font-bold mb-3">
              Your Orders
            </h1>
            <p className="font-body text-[#333]/40 text-sm max-w-md mx-auto">
              Track your order status in real-time. Updates refresh automatically.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Orders List */}
      <section className="py-10">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          {ordersError && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 font-body">
              {ordersError}
            </div>
          )}

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-[#EAEAEA] p-6 animate-pulse">
                  <div className="flex justify-between mb-4">
                    <div className="space-y-2">
                      <div className="h-3 w-20 bg-[#F0F0F0] rounded" />
                      <div className="h-4 w-32 bg-[#F0F0F0] rounded" />
                    </div>
                    <div className="h-6 w-20 bg-[#F0F0F0] rounded-full" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 w-full bg-[#F0F0F0] rounded" />
                    <div className="h-3 w-2/3 bg-[#F0F0F0] rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 bg-white rounded-2xl border border-[#EAEAEA]"
            >
              <Package className="mx-auto text-[#C8A951]/30 mb-4" size={48} />
              <h3 className="font-heading text-lg text-[#333] font-semibold mb-2">No orders yet</h3>
              <p className="font-body text-sm text-[#333]/40 mb-6">Your order history will appear here once you place an order.</p>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 font-body text-sm text-[#C8A951] font-medium hover:gap-3 transition-all"
              >
                Browse Products <ArrowRight size={14} />
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {orders.map((o, i) => (
                <motion.div
                  key={o._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.06 }}
                  className="bg-white rounded-2xl border border-[#EAEAEA] overflow-hidden hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:border-[#C8A951]/15 transition-all duration-300"
                >
                  {/* Order header */}
                  <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F5F5F5]">
                    <div>
                      <p className="font-body text-[10px] tracking-wider text-[#333]/35 uppercase">Order ID</p>
                      <p className="font-mono text-sm font-semibold text-[#333]">{o.orderId || o._id}</p>
                      <p className="font-body text-[11px] text-[#333]/35 flex items-center gap-1 mt-0.5">
                        <Clock size={10} /> {formatDate(o.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex px-3 py-1 text-[11px] font-medium rounded-full capitalize border ${STATUS_COLOR[o.status || "pending"] || STATUS_COLOR.pending}`}>
                        {o.status || "pending"}
                      </span>
                      <span className="font-heading text-base font-bold text-[#333]">₹{o.total}</span>
                    </div>
                  </div>

                  {/* Order items */}
                  <div className="px-6 py-3">
                    {o.items?.map((it, idx) => (
                      <div key={idx} className="flex justify-between items-center py-2 border-b last:border-0 border-[#F8F8F8]">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-[#C8A951]/40" />
                          <span className="font-body text-sm text-[#333]">{it.name}</span>
                          <span className="font-body text-[11px] text-[#333]/30">× {it.quantity}</span>
                        </div>
                        <span className="font-body text-sm text-[#333]/70">₹{it.price * it.quantity}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
