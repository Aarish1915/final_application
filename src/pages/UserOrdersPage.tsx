import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/useAuth';
import { apiUrl } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import {
  Package, Clock, CheckCircle, XCircle, Truck, Calendar, ShoppingBag
} from 'lucide-react';

type OrderItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
};

type Order = {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'delivered' | 'cancelled';
  orderType: string;
  notes?: string;
  createdAt: string;
};

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'bg-sky-50 text-sky-700 border-sky-200', icon: CheckCircle },
  preparing: { label: 'Preparing', color: 'bg-violet-50 text-violet-700 border-violet-200', icon: Package },
  delivered: { label: 'Delivered', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: Truck },
  cancelled: { label: 'Cancelled', color: 'bg-red-50 text-red-600 border-red-200', icon: XCircle },
};

export default function UserOrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'delivered'>('all');

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/products'); return; }
    fetchOrders();
  }, [user, navigate, authLoading]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(apiUrl(`/api/orders/my-orders`), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        const rawOrders: Order[] = data.orders || [];

        // For orders missing item images, try to fetch from product
        const productIds = new Set<string>();
        rawOrders.forEach(o => o.items.forEach(i => {
          if (!i.image && i.productId) productIds.add(i.productId);
        }));

        const imageMap: Record<string, string> = {};
        if (productIds.size > 0) {
          await Promise.all([...productIds].map(async (pid) => {
            try {
              const r = await fetch(apiUrl(`/api/products/${pid}`));
              if (r.ok) {
                const d = await r.json();
                const p = d.product || d;
                if (p?.image) imageMap[pid] = p.image;
              }
            } catch { /* silent */ }
          }));
        }

        // Patch images into items
        const patched = rawOrders.map(o => ({
          ...o,
          items: o.items.map(i => ({
            ...i,
            image: i.image || (i.productId ? imageMap[i.productId] : undefined),
          })),
        }));

        setOrders(patched);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    if (filter === 'pending') return ['pending', 'confirmed', 'preparing'].includes(order.status);
    if (filter === 'delivered') return order.status === 'delivered';
    return true;
  });

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    } catch { return dateString; }
  };

  if (!user || authLoading) return null;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Header */}
      <section className="border-b border-[#D8EDED]/60" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F5FAFA 40%, #EFF7F7 100%)' }}>
        <div className="max-w-5xl mx-auto px-4 lg:px-8 pt-10 pb-8 md:pt-14 md:pb-10">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <p className="font-body text-[11px] tracking-[0.2em] uppercase text-[#8AACAE] mb-3">Account</p>
            <h1 className="font-heading text-2xl md:text-4xl text-[#1a1a1a] font-bold mb-2">My Orders</h1>
            <p className="font-body text-sm text-[#7A9A9C]">Track and manage your orders</p>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <div className="bg-white border-b border-[#D8EDED] sticky top-14 lg:top-16 z-20">
        <div className="max-w-5xl mx-auto px-4 lg:px-8 py-3">
          <div className="flex gap-2">
            {[
              { value: 'all', label: 'All Orders' },
              { value: 'pending', label: 'Active' },
              { value: 'delivered', label: 'Delivered' }
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value as typeof filter)}
                className={`px-4 md:px-5 py-2 rounded-lg font-body text-xs md:text-sm transition-all ${
                  filter === tab.value
                    ? 'bg-[#1A4547] text-white'
                    : 'bg-[#EFF7F7] text-[#5E8A8C] hover:bg-[#D8EDED]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="max-w-5xl mx-auto px-4 lg:px-8 py-8 md:py-12">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-[#D8EDED] p-5 animate-pulse">
                <div className="h-5 w-32 bg-[#EFF7F7] rounded mb-3" />
                <div className="h-4 w-48 bg-[#EFF7F7] rounded" />
              </div>
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-[#EFF7F7] flex items-center justify-center">
              <ShoppingBag className="text-[#9CB8BA]" size={36} />
            </div>
            <h3 className="font-heading text-lg text-[#1a1a1a] font-semibold mb-2">No orders found</h3>
            <p className="font-body text-sm text-[#7A9A9C] mb-6">Start shopping to see your orders here</p>
            <button
              onClick={() => navigate('/products')}
              className="px-6 py-3 rounded-xl bg-[#1A4547] text-white font-body text-sm hover:bg-[#122E30] transition-colors"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order, index) => {
              const StatusIcon = statusConfig[order.status].icon;
              return (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                  className="bg-white rounded-xl border border-[#D8EDED] overflow-hidden hover:shadow-[0_4px_20px_rgba(35,90,93,0.06)] transition-all"
                >
                  {/* Order Header */}
                  <div className="px-4 md:px-6 py-4 border-b border-[#D8EDED] bg-[#F5FAFA]">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2.5 mb-1.5">
                          <h3 className="font-heading text-sm md:text-base text-[#1a1a1a] font-bold">
                            Order #{order.orderNumber || order._id.slice(-8).toUpperCase()}
                          </h3>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-medium ${statusConfig[order.status].color}`}>
                            <StatusIcon size={11} />
                            {statusConfig[order.status].label}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-[#7A9A9C]">
                          <Calendar size={11} />
                          <span>{formatDate(order.createdAt)}</span>
                        </div>
                      </div>
                      <div className="text-left md:text-right">
                        <p className="font-body text-[11px] text-[#7A9A9C] mb-0.5">Total</p>
                        <p className="font-heading text-xl text-[#1a1a1a] font-bold">₹{order.total}</p>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="px-4 md:px-6 py-4">
                    <div className="space-y-3 mb-4">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex gap-3">
                          <div className="w-14 h-14 rounded-lg bg-[#EFF7F7] border border-[#D8EDED] overflow-hidden flex-shrink-0">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package size={20} className="text-[#9CB8BA]" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-heading text-[13px] text-[#1a1a1a] font-semibold leading-snug line-clamp-1">{item.name}</h4>
                            <p className="font-body text-xs text-[#7A9A9C] mt-0.5">Qty: {item.quantity} × ₹{item.price}</p>
                          </div>
                          <p className="font-heading text-sm text-[#1a1a1a] font-bold flex-shrink-0">₹{item.price * item.quantity}</p>
                        </div>
                      ))}
                    </div>

                    {order.notes && (
                      <div className="mt-3 p-3 bg-[#EFF7F7] border border-[#D8EDED] rounded-xl">
                        <p className="font-body text-[11px] text-[#7A9A9C] mb-1">Order Notes</p>
                        <p className="font-body text-sm text-[#1a1a1a]">{order.notes}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
