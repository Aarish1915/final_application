import { useEffect, useState } from "react";
import { adminFetch } from "../App";
import { Link } from "react-router-dom";
import {
  ShoppingBag, Package, Users, IndianRupee, Clock, Truck,
  MessageSquare, CalendarCheck, ArrowUpRight, Star
} from "lucide-react";

interface Stats {
  totalUsers: number;
  totalProducts: number;
  totalReservations: number;
  todayReservations: number;
  totalOrders: number;
  pendingOrders: number;
  totalPayments: number;
  totalRevenue: number;
}

interface PendingOrder {
  _id: string;
  customerName: string;
  total: number;
  status: string;
  orderType: string;
  createdAt: string;
  items?: { name: string; quantity: number; price: number }[];
}

interface RecentInquiry {
  _id: string;
  name: string;
  subject: string;
  status: string;
  createdAt: string;
}

interface RecentReview {
  _id: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  productId: { _id: string; name: string; image?: string } | string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [recentInquiries, setRecentInquiries] = useState<RecentInquiry[]>([]);
  const [recentReviews, setRecentReviews] = useState<RecentReview[]>([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminFetch("/admin/dashboard").then(r => r.json()).then(d => setStats(d.stats)),
      adminFetch("/admin/orders?status=paid&limit=5").then(r => r.json()).then(d => setPendingOrders(d.orders || [])),
      adminFetch("/admin/inquiries?status=new&limit=5").then(r => r.json()).catch(() => ({ inquiries: [] })).then(d => setRecentInquiries(d.inquiries || [])),
      adminFetch("/admin/reviews?limit=5").then(r => r.json()).then(d => { setRecentReviews(d.reviews || []); setTotalReviews(d.pagination?.total || 0); }).catch(() => {}),
    ]).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-gray-200 border-t-[#235A5D] rounded-full animate-spin" />
    </div>
  );

  const kpiCards = [
    { label: "Revenue", value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, icon: IndianRupee, sub: "Total earnings" },
    { label: "Orders", value: stats?.totalOrders || 0, icon: ShoppingBag, sub: `${stats?.pendingOrders || 0} pending` },
    { label: "Products", value: stats?.totalProducts || 0, icon: Package, sub: "In catalog" },
    { label: "Customers", value: stats?.totalUsers || 0, icon: Users, sub: "Registered" },
  ];

  const statusStyle = (s: string) => {
    const map: Record<string, string> = {
      pending: "bg-amber-50 text-amber-600",
      preparing: "bg-blue-50 text-blue-600",
      ready: "bg-emerald-50 text-emerald-600",
      delivered: "bg-emerald-50 text-emerald-600",
      cancelled: "bg-red-50 text-red-600",
    };
    return map[s] || "bg-gray-50 text-gray-500";
  };

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-[#1A4547]">Dashboard</h1>
        <p className="text-xs text-gray-400 mt-0.5">Overview of your store</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {kpiCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">{card.label}</span>
              <card.icon size={15} className="text-gray-300" />
            </div>
            <p className="text-xl font-semibold text-[#1A4547]">{card.value}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Secondary stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
            <Clock size={16} className="text-amber-500" />
          </div>
          <div>
            <p className="text-lg font-semibold text-[#1A4547]">{stats?.pendingOrders || 0}</p>
            <p className="text-[11px] text-gray-400">Pending deliveries</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
            <CalendarCheck size={16} className="text-blue-500" />
          </div>
          <div>
            <p className="text-lg font-semibold text-[#1A4547]">{stats?.todayReservations || 0}</p>
            <p className="text-[11px] text-gray-400">Today's bookings</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
            <Truck size={16} className="text-emerald-500" />
          </div>
          <div>
            <p className="text-lg font-semibold text-[#1A4547]">{stats?.totalReservations || 0}</p>
            <p className="text-[11px] text-gray-400">Total reservations</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
            <MessageSquare size={16} className="text-purple-500" />
          </div>
          <div>
            <p className="text-lg font-semibold text-[#1A4547]">{recentInquiries.length}</p>
            <p className="text-[11px] text-gray-400">New inquiries</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-yellow-50 flex items-center justify-center">
            <Star size={16} className="text-yellow-500" />
          </div>
          <div>
            <p className="text-lg font-semibold text-[#1A4547]">{totalReviews}</p>
            <p className="text-[11px] text-gray-400">Total reviews</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Pending Deliveries */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
            <h2 className="text-sm font-medium text-gray-700">Pending Orders</h2>
            <Link to="/orders" className="text-[11px] text-gray-400 hover:text-gray-600 flex items-center gap-0.5">
              View all <ArrowUpRight size={11} />
            </Link>
          </div>
          {pendingOrders.length === 0 ? (
            <div className="py-10 text-center text-gray-300 text-sm">No pending orders</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {pendingOrders.slice(0, 5).map((order) => (
                <div key={order._id} className="px-4 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                    <ShoppingBag size={14} className="text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">{order.customerName}</p>
                    <p className="text-[11px] text-gray-400">{order.items?.length || 0} items · {order.orderType}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-800">₹{order.total}</p>
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${statusStyle(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Inquiries / Contacts */}
        <div className="bg-white rounded-xl border border-gray-100">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
            <h2 className="text-sm font-medium text-gray-700">New Inquiries</h2>
            <Link to="/inquiries" className="text-[11px] text-gray-400 hover:text-gray-600 flex items-center gap-0.5">
              View all <ArrowUpRight size={11} />
            </Link>
          </div>
          {recentInquiries.length === 0 ? (
            <div className="py-10 text-center text-gray-300 text-sm">No new inquiries</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentInquiries.slice(0, 5).map((inq) => (
                <div key={inq._id} className="px-4 py-3">
                  <p className="text-sm font-medium text-gray-700">{inq.name}</p>
                  <p className="text-[11px] text-gray-400 truncate">{inq.subject}</p>
                  <p className="text-[10px] text-gray-300 mt-1">{new Date(inq.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Latest Reviews */}
      <div className="mt-4 bg-white rounded-xl border border-gray-100">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
          <h2 className="text-sm font-medium text-gray-700">Latest Reviews</h2>
          <Link to="/reviews" className="text-[11px] text-gray-400 hover:text-gray-600 flex items-center gap-0.5">
            View all <ArrowUpRight size={11} />
          </Link>
        </div>
        {recentReviews.length === 0 ? (
          <div className="py-10 text-center text-gray-300 text-sm">No reviews yet</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentReviews.map((review) => {
              const product = typeof review.productId === "object" ? review.productId : null;
              return (
                <div key={review._id} className="px-4 py-3 flex items-start gap-3">
                  {product?.image ? (
                    <img src={product.image} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                      <Star size={14} className="text-gray-300" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-700 truncate">{review.userName}</p>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={10} className={i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"} />
                        ))}
                      </div>
                    </div>
                    {product && <p className="text-[11px] text-[#235A5D]">{product.name}</p>}
                    {review.title && <p className="text-xs text-gray-600 mt-0.5">{review.title}</p>}
                    {review.comment && <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">{review.comment}</p>}
                  </div>
                  <p className="text-[10px] text-gray-300 flex-shrink-0 mt-0.5">{new Date(review.createdAt).toLocaleDateString()}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
