import { useState, useEffect, createContext, useContext, type ReactNode } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard, Users, ShoppingBag, CreditCard, CalendarCheck,
  Package, LogOut, Menu, X, BookOpen, Image, MessageSquare, Star, Tag, ChevronDown, UtensilsCrossed, Briefcase, FileText, MapPin
} from "lucide-react";

import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import UsersPage from "./pages/UsersPage";
import ProductsPage from "./pages/ProductsPage";
import OrdersPage from "./pages/OrdersPage";
import PaymentsPage from "./pages/PaymentsPage";
import ReservationsPage from "./pages/ReservationsPage";
import BlogsPage from "./pages/BlogsPage";
import BannersPage from "./pages/BannersPage";
import ShopBannersPage from "./pages/ShopBannersPage";
import InquiriesPage from "./pages/InquiriesPage";
import ReviewsPage from "./pages/ReviewsPage";
import CouponsPage from "./pages/CouponsPage";
import RecipesPage from "./pages/RecipesPage";
import CareersPage from "./pages/CareersPage";
import MenuPage from "./pages/MenuPage";
import PincodesPage from "./pages/PincodesPage";
import AdminLayout from './components/AdminLayout';
import AuthGuard from './components/AuthGuard';

/* ═══════════════ API Helper ═══════════════ */
let API = import.meta.env.VITE_API_URL || "https://ingri-api.duckdns.org/api";
if (API && !API.endsWith('/api') && API !== "http://localhost:5000/api") {
  API = API.endsWith('/') ? `${API}api` : `${API}/api`;
}

const fetchCache = new Map<string, { data: any, timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 2; // 2 minutes

export async function adminFetch(path: string, options: RequestInit = {}) {
  const isGet = !options.method || options.method.toUpperCase() === 'GET';
  
  // Clear cache on any mutation (POST/PUT/DELETE) to ensure fresh data
  if (!isGet) {
    fetchCache.clear();
  } else {
    // Check cache for GET requests
    const cached = fetchCache.get(path);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return new Response(JSON.stringify(cached.data), { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
  }

  const token = localStorage.getItem("admin_token");
  try {
    const res = await fetch(`${API}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
    if (!res.ok) {
      const clonedRes = res.clone();
      try {
        const errorText = await clonedRes.text();
        try {
          const errorData = JSON.parse(errorText);
          console.error(`API Error [${res.status}] ${path}:`, errorData);
        } catch {
          console.error(`API Error [${res.status}] ${path}:`, errorText);
        }
      } catch {
        console.error(`API Error [${res.status}] ${path}: Could not read response`);
      }
    }
    
    // Save successful GET requests to cache
    if (res.ok && isGet && !path.includes('/uploads/')) {
      const clone = res.clone();
      clone.json().then(data => {
        fetchCache.set(path, { data, timestamp: Date.now() });
      }).catch(() => {});
    }

    if (res.status === 401) {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");
      window.dispatchEvent(new Event("auth_change"));
    }
    return res;
  } catch (error) {
    console.error(`Network Error ${path}:`, error);
    throw error;
  }
}

/* ═══════════════ Auth Context ═══════════════ */
interface AdminUser { id: string; name: string; email: string; role: string; }
interface AuthCtx { admin: AdminUser | null; loading: boolean; login: (email: string, password: string) => Promise<void>; logout: () => void; }

const AuthContext = createContext<AuthCtx>({ admin: null, loading: true, login: async () => {}, logout: () => {} });
export const useAdminAuth = () => useContext(AuthContext);

function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) { setLoading(false); return; }
    adminFetch("/admin/me")
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => setAdmin(data.admin))
      .catch(() => { localStorage.removeItem("admin_token"); setAdmin(null); })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const res = await adminFetch("/admin/login", { method: "POST", body: JSON.stringify({ email, password }) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");
    localStorage.setItem("admin_token", data.token);
    setAdmin(data.admin);
  };

  const logout = () => { localStorage.removeItem("admin_token"); setAdmin(null); };

  return <AuthContext.Provider value={{ admin, loading, login, logout }}>{children}</AuthContext.Provider>;
}

/* ═══════════════ Sidebar ═══════════════ */
const NAV_ITEMS: { path: string; icon: typeof LayoutDashboard; label: string; children?: { path: string; label: string }[] }[] = [
  { path: "/", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/orders", icon: ShoppingBag, label: "Orders" },
  { path: "/products", icon: Package, label: "Products" },
  { path: "/users", icon: Users, label: "Customers" },
  { path: "/payments", icon: CreditCard, label: "Payments" },
  { path: "/reservations", icon: CalendarCheck, label: "Reservations" },
  { path: "/inquiries", icon: MessageSquare, label: "Inquiries" },
  { path: "/reviews", icon: Star, label: "Reviews", children: [
    { path: "/reviews", label: "Product Reviews" },
    { path: "/reviews?tab=site", label: "Site Reviews" },
  ]},
  { path: "/blogs", icon: BookOpen, label: "Blog" },
  { path: "/recipes", icon: UtensilsCrossed, label: "Recipes" },
  { path: "/banners", icon: Image, label: "Banners", children: [
    { path: "/banners", label: "Home Banners" },
    { path: "/shop-banners", label: "Shop Banners" },
  ]},
  { path: "/careers", icon: Briefcase, label: "Careers" },
  { path: "/menu", icon: FileText, label: "Cafe Menu" },
  { path: "/coupons", icon: Tag, label: "Coupons" },
  { path: "/pincodes", icon: MapPin, label: "Delivery Zones" },
];

function Sidebar({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
  const location = useLocation();
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<string | null>(
    location.pathname === "/reviews" || location.pathname === "/reviews?tab=site" ? "/reviews"
    : location.pathname === "/banners" || location.pathname === "/shop-banners" ? "/banners"
    : null
  );

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/20 z-40 lg:hidden" onClick={() => setOpen(false)} />}
      <aside className={`fixed top-0 left-0 h-full bg-white border-r border-gray-100 z-50 transition-transform duration-200 flex flex-col
        w-56 ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:z-auto`}>

        {/* Logo */}
        <div className="px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/ingri-green-logo.png" alt="INGRI" className="h-10 w-auto object-contain" />
          </div>
          <button className="lg:hidden text-gray-400 hover:text-gray-600" onClick={() => setOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path));
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expanded === item.path;

            if (hasChildren) {
              return (
                <div key={item.path}>
                  <button onClick={() => setExpanded(isExpanded ? null : item.path)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 w-full
                      ${active
                        ? "bg-[#235A5D] text-white shadow-sm"
                        : "text-gray-500 hover:bg-[#F0F7F7] hover:text-[#235A5D]"
                      }`}>
                    <item.icon size={16} strokeWidth={active ? 2 : 1.5} />
                    <span className="flex-1 text-left">{item.label}</span>
                    <ChevronDown size={14} className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                  </button>
                  {isExpanded && (
                    <div className="ml-7 mt-0.5 space-y-0.5">
                      {item.children!.map((child) => {
                        const childActive = (location.pathname + location.search) === child.path;
                        return (
                          <Link key={child.path} to={child.path} onClick={() => setOpen(false)}
                            className={`block px-3 py-1.5 rounded-md text-[12px] font-medium transition-all duration-150
                              ${childActive
                                ? "text-[#235A5D] bg-[#F0F7F7]"
                                : "text-gray-400 hover:text-[#235A5D] hover:bg-[#F0F7F7]"
                              }`}>
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link key={item.path} to={item.path} onClick={() => setOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150
                  ${active
                    ? "bg-[#235A5D] text-white shadow-sm"
                    : "text-gray-500 hover:bg-[#F0F7F7] hover:text-[#235A5D]"
                  }`}>
                <item.icon size={16} strokeWidth={active ? 2 : 1.5} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-gray-100">
          <div className="flex items-center gap-2.5 px-3 mb-3">
            <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-[11px] font-semibold text-gray-600">
              {admin?.name?.charAt(0) || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-700 truncate">{admin?.name}</p>
              <p className="text-[10px] text-gray-400 truncate">{admin?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors">
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </aside>
    </>
  );
}

/* ═══════════════ Layout ═══════════════ */
function AdminLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { admin, loading } = useAdminAuth();

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <div className="w-6 h-6 border-2 border-gray-200 border-t-[#235A5D] rounded-full animate-spin" />
    </div>
  );

  if (!admin) return <Navigate to="/login" replace />;

  return (
    <div className="flex h-screen overflow-hidden bg-[#fafafa]">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-12 bg-white border-b border-gray-100 flex items-center px-4 gap-4 shrink-0">
          <button className="lg:hidden text-gray-400 hover:text-gray-600" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <div className="flex-1" />
          <span className="text-[10px] text-gray-300 font-medium">Ingri Admin</span>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

/* ═══════════════ App ═══════════════ */
export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<AdminLayout><DashboardPage /></AdminLayout>} />
        <Route path="/users" element={<AdminLayout><UsersPage /></AdminLayout>} />
        <Route path="/products" element={<AdminLayout><ProductsPage /></AdminLayout>} />
        <Route path="/orders" element={<AdminLayout><OrdersPage /></AdminLayout>} />
        <Route path="/payments" element={<AdminLayout><PaymentsPage /></AdminLayout>} />
        <Route path="/reservations" element={<AdminLayout><ReservationsPage /></AdminLayout>} />
        <Route path="/blogs" element={<AdminLayout><BlogsPage /></AdminLayout>} />
        <Route path="/banners" element={<AdminLayout><BannersPage /></AdminLayout>} />
        <Route path="/shop-banners" element={<AdminLayout><ShopBannersPage /></AdminLayout>} />
        <Route path="/inquiries" element={<AdminLayout><InquiriesPage /></AdminLayout>} />
        <Route path="/reviews" element={<AdminLayout><ReviewsPage /></AdminLayout>} />
        <Route path="/recipes" element={<AdminLayout><RecipesPage /></AdminLayout>} />
        <Route path="/careers" element={<AdminLayout><CareersPage /></AdminLayout>} />
        <Route path="/menu" element={<AdminLayout><MenuPage /></AdminLayout>} />
        <Route path="/coupons" element={<AdminLayout><CouponsPage /></AdminLayout>} />
        <Route path="/pincodes" element={<AdminLayout><PincodesPage /></AdminLayout>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
