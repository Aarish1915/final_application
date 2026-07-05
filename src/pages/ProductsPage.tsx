import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/useAuth';
import { apiUrl } from '@/lib/api';
import {
  Search, ChevronDown, ShoppingBag, Heart, Star,
  Plus, Minus, Trash2, X, ArrowRight, Package,
} from 'lucide-react';

const fallbackProducts: any[] = [];

// Fallback lists — empty by default, populated from admin settings API
const defaultCategoryList: string[] = [];
const defaultStorageList: string[] = [];
const sortOptions = [
  { label: "Featured", value: "" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Rating", value: "rating" },
  { label: "Name A-Z", value: "name" },
];

type Product = {
  _id: string; name: string; category: string; price: number;
  mrp?: number; salePrice?: number; discount?: number;
  bestSeller?: boolean; isAddon?: boolean;
  image: string; rating: number; description?: string; reviews?: number;
  intentions?: string[]; storage?: string;
};
type CartItem = { _id: string; name: string; price: number; image: string; qty: number };
type WishlistEntry = { _id: string };

export default function ProductsPage() {
  const location = useLocation();
  const [products, setProducts] = useState<Product[]>(fallbackProducts);

  // Dynamic categories & storage from backend settings
  const [categoryList, setCategoryList] = useState<string[]>(defaultCategoryList);
  const [storageList, setStorageList] = useState<string[]>(defaultStorageList);

  useEffect(() => {
    fetch(apiUrl("/api/settings/product-config"))
      .then(r => r.json())
      .then(data => {
        setCategoryList(data.categories || []);
        setStorageList(data.storageTypes || []);
      })
      .catch(() => { /* keep defaults */ });

    // Fetch actual products from backend
    fetch(apiUrl("/api/products"))
      .then(r => r.json())
      .then(data => {
        if (data.products && data.products.length > 0) {
          // Map backend _id to our local structure if needed
          const formattedProducts = data.products.map((p: any) => ({
            ...p,
            _id: p.id || p._id
          }));
          setProducts(formattedProducts);
        }
      })
      .catch(() => { console.error("Failed to fetch products from backend"); });
  }, []);

  // Categories: use only what's configured in admin settings (no merging from products)
  const dynamicCategories = useMemo(() => {
    return ["All Products", ...categoryList];
  }, [categoryList]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState(() => new URLSearchParams(window.location.search).get('search') || "");
  const [searchQuery, setSearchQuery] = useState(() => new URLSearchParams(window.location.search).get('search') || "");
  const [activeCategory, setActiveCategory] = useState(() => new URLSearchParams(window.location.search).get('category') || "All Products");
  const [isGiftFilter, setIsGiftFilter] = useState(() => new URLSearchParams(window.location.search).get('isGift') === 'true');
  const [isB2BFilter, setIsB2BFilter] = useState(() => new URLSearchParams(window.location.search).get('isB2B') === 'true');
  const [activeStorage, setActiveStorage] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(true);
  const [storageOpen, setStorageOpen] = useState(true);
  const [priceOpen, setPriceOpen] = useState(true);
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ couponId: string; code: string; discount: number; description: string } | null>(null);
  const [addonProducts, setAddonProducts] = useState<Product[]>([]);

  type SiteReview = { _id: string; userName: string; rating: number; title: string; comment: string };
  const [siteReviews, setSiteReviews] = useState<SiteReview[]>([]);

  type ShopBanner = { _id: string; title: string; desktopImage?: string; mobileImage?: string; image?: string; description?: string };
  const [shopBanners, setShopBanners] = useState<ShopBanner[]>([]);
  const [shopBannerIndex, setShopBannerIndex] = useState(0);

  const { user } = useAuth();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  const PRODUCTS_PER_PAGE = isMobile ? 16 : 15;
  const getEffectivePrice = (p: Product) => p.salePrice || p.price;
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  // MRP breakdown: find original MRP from products list for each cart item
  const cartMrpTotal = cart.reduce((sum, item) => {
    const prod = products.find(p => p._id === item._id);
    const mrp = prod?.mrp || item.price;
    return sum + mrp * item.qty;
  }, 0);
  const cartDiscount = cartMrpTotal - cartTotal;
  const couponDiscount = appliedCoupon?.discount || 0;
  const cartSubtotal = cartTotal - couponDiscount;
  const shippingFee = cartSubtotal < 499 ? 49 : 0;
  const cartFinalTotal = cartSubtotal + shippingFee;

  // Load saved coupon from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('appliedCoupon');
    if (saved) { try { setAppliedCoupon(JSON.parse(saved)); } catch { /* ignore */ } }
  }, []);

  // Re-validate coupon when cart total changes
  useEffect(() => {
    if (!appliedCoupon) return;
    (async () => {
      try {
        const res = await fetch(apiUrl('/api/coupons/validate'), {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: appliedCoupon.code, orderTotal: cartTotal, userId: user?.id }),
        });
        if (res.ok) {
          const data = await res.json();
          const updated = { couponId: data.couponId, code: data.code, discount: data.discount, description: data.description || '' };
          setAppliedCoupon(updated);
          localStorage.setItem('appliedCoupon', JSON.stringify(updated));
        } else { setAppliedCoupon(null); localStorage.removeItem('appliedCoupon'); }
      } catch { /* keep existing */ }
    })();
  }, [cartTotal, cart.length]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true); setCouponError('');
    try {
      const res = await fetch(apiUrl('/api/coupons/validate'), {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim(), orderTotal: cartTotal, userId: user?.id }),
      });
      const data = await res.json();
      if (!res.ok) { setCouponError(data.error || 'Invalid coupon'); setAppliedCoupon(null); localStorage.removeItem('appliedCoupon'); }
      else {
        const coupon = { couponId: data.couponId, code: data.code, discount: data.discount, description: data.description || '' };
        setAppliedCoupon(coupon); setCouponError('');
        localStorage.setItem('appliedCoupon', JSON.stringify(coupon));
      }
    } catch { setCouponError('Failed to validate coupon'); }
    setCouponLoading(false);
  };

  const removeCoupon = () => { setAppliedCoupon(null); setCouponCode(''); setCouponError(''); localStorage.removeItem('appliedCoupon'); };

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('wishlist') || '[]') as WishlistEntry[];
    setWishlist(saved.map((item) => item._id));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => { setSearchQuery(searchInput); setCurrentPage(1); }, 500);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    const urlSearch = new URLSearchParams(location.search).get('search') || "";
    if (urlSearch) {
      setSearchInput(urlSearch);
      setSearchQuery(urlSearch);
    }
   
  }, [location.search]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (activeCategory !== "All Products") params.append("category", activeCategory);
        if (searchQuery) params.append("search", searchQuery);
        if (sortBy) params.append("sort", sortBy);
        if (isGiftFilter) params.append("isGift", "true");
        if (isB2BFilter) params.append("isB2B", "true");
        params.append("page", currentPage.toString());
        params.append("limit", "200");
        const res = await fetch(apiUrl(`/api/products?${params.toString()}`));
        if (res.ok) {
          const data = await res.json();
          if (data.products?.length > 0) {
            setProducts(data.products);
            setTotalPages(data.pagination?.pages || 1);
          } else if (searchQuery) {
            // Search returned no results — show empty, not fallback
            setProducts([]);
            setTotalPages(1);
          } else {
            setProducts(fallbackProducts);
          }
        } else setProducts(fallbackProducts);
      } catch { setProducts(fallbackProducts); }
      finally { setLoading(false); }
    };
    fetchProducts();
  }, [activeCategory, searchQuery, sortBy, currentPage, isGiftFilter, isB2BFilter]);

  /* Fetch addon products for cart suggestions */
  useEffect(() => {
    const fetchAddons = async () => {
      try {
        const res = await fetch(apiUrl('/api/products?isAddon=true&limit=12'));
        if (res.ok) {
          const data = await res.json();
          if (data.products?.length > 0) setAddonProducts(data.products);
          else setAddonProducts(fallbackProducts.slice(0, 6));
        } else setAddonProducts(fallbackProducts.slice(0, 6));
      } catch { setAddonProducts(fallbackProducts.slice(0, 6)); }
    };
    fetchAddons();
  }, []);

  // Fetch site reviews
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(apiUrl("/api/site-reviews"));
        if (res.ok) { const data = await res.json(); setSiteReviews(data.reviews || []); }
      } catch { /* silent */ }
    })();
  }, []);

  // Fetch shop hero banners
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(apiUrl("/api/shop-banners"));
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        const active = (data.banners || []).filter((b: { active?: boolean }) => b.active !== false);
        if (active.length > 0) setShopBanners(active);
      } catch { /* silent */ }
    })();
    return () => { mounted = false; };
  }, []);

  // Auto-advance shop banner carousel
  useEffect(() => {
    if (shopBanners.length <= 1) return;
    const timer = setInterval(() => setShopBannerIndex(i => (i + 1) % shopBanners.length), 5000);
    return () => clearInterval(timer);
  }, [shopBanners.length]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(saved);
  }, []);

  // Listen for open-cart event from Navbar
  useEffect(() => {
    const handler = () => setCartOpen(true);
    window.addEventListener('open-cart', handler);
    return () => window.removeEventListener('open-cart', handler);
  }, []);

  // Auto-open cart when navigated with ?cart=open
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('cart') === 'open') {
      setCartOpen(true);
      params.delete('cart');
      const remaining = params.toString();
      navigate({ pathname: '/products', search: remaining ? `?${remaining}` : '' }, { replace: true });
    }
  }, [location.search, navigate]);

  const saveCart = (items: CartItem[]) => {
    localStorage.setItem('cart', JSON.stringify(items));
    setCart(items);
  };

  const addToCart = (product: Product) => {
    const updated = [...cart];
    const ex = updated.find(c => c._id === product._id);
    const effectivePrice = product.salePrice || product.price;
    if (ex) { ex.qty += 1; }
    else { updated.push({ _id: product._id, name: product.name, price: effectivePrice, image: product.image, qty: 1 }); }
    saveCart(updated);
    setCartOpen(true);
  };
  const updateQty = (id: string, d: number) => {
    const updated = cart.map(c => c._id === id ? { ...c, qty: Math.max(0, c.qty + d) } : c).filter(c => c.qty > 0);
    saveCart(updated);
  };
  const removeFromCart = (id: string) => saveCart(cart.filter(c => c._id !== id));
  const toggleWishlist = (pid: string) => {
    const p = products.find(x => x._id === pid);
    if (!p) return;
    const saved = JSON.parse(localStorage.getItem('wishlist') || '[]') as WishlistEntry[];
    const exists = saved.find((item) => item._id === pid);
    const updated = exists ? saved.filter((item) => item._id !== pid) : [...saved, p];
    localStorage.setItem('wishlist', JSON.stringify(updated));
    setWishlist(updated.map((item) => item._id));
  };

  const handleBuyNow = () => {
    setCartOpen(false);
    navigate('/checkout');
  };

  const toggleStorage = (s: string) => {
    setActiveStorage(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
    setCurrentPage(1);
  };

  // Apply all client-side filters: search + price range + storage
  const filteredProducts = products.filter(p => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!p.name?.toLowerCase().includes(q) && !p.category?.toLowerCase().includes(q) && !p.description?.toLowerCase().includes(q)) return false;
    }
    const ep = getEffectivePrice(p);
    if (ep < priceRange[0] || ep > priceRange[1]) return false;
    if (activeStorage.length > 0) {
      const productStorage = (p as Record<string, unknown>).storage as string | undefined;
      if (!productStorage || !activeStorage.some(s => s.toLowerCase() === productStorage.toLowerCase())) return false;
    }
    return true;
  });

  // Apply client-side sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price_asc": return getEffectivePrice(a) - getEffectivePrice(b);
      case "price_desc": return getEffectivePrice(b) - getEffectivePrice(a);
      case "rating": return b.rating - a.rating;
      case "name": return a.name.localeCompare(b.name);
      default: return 0; // Featured — original order
    }
  });

  const paginatedProducts = sortedProducts.slice((currentPage - 1) * PRODUCTS_PER_PAGE, currentPage * PRODUCTS_PER_PAGE);
  const totalProductCount = sortedProducts.length;
  const effectiveTotalPages = Math.max(1, Math.ceil(totalProductCount / PRODUCTS_PER_PAGE));

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Shop | Ingri World - Ready to Cook Indian Food</title>
        <meta name="description" content="Shop authentic Indian ready-to-cook curries, biryanis, and snacks at Ingri World. Browse our frozen and shelf-stable products." />
      </Helmet>
      <Navbar />

      {/* ══ SHOP HERO BANNER CAROUSEL ══ */}
      {shopBanners.length > 0 && (
        <section className="relative w-full overflow-hidden">
          <div className="relative w-full">
            {shopBanners.map((banner, idx) => {
              const isActive = idx === shopBannerIndex;
              return (
                <div
                  key={banner._id}
                  className={`w-full transition-opacity duration-700 ease-in-out ${
                    idx === 0 ? "relative" : "absolute inset-0"
                  } ${isActive ? "opacity-100 z-[1]" : "opacity-0 z-0"}`}
                  aria-hidden={!isActive}
                >
                  <img
                    src={banner.desktopImage || banner.image || ""}
                    alt={banner.title}
                    className="hidden md:block w-full h-auto object-cover"
                    loading={idx === 0 ? "eager" : "lazy"}
                  />
                  <img
                    src={banner.mobileImage || banner.desktopImage || banner.image || ""}
                    alt={banner.title}
                    className="md:hidden w-full h-auto object-cover"
                    loading={idx === 0 ? "eager" : "lazy"}
                  />
                </div>
              );
            })}
            {shopBanners.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {shopBanners.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setShopBannerIndex(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={`rounded-full transition-all duration-300 ${
                      idx === shopBannerIndex
                        ? "w-7 h-2.5 bg-white"
                        : "w-2.5 h-2.5 bg-white/50 hover:bg-white/70"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ══ Breadcrumb + Sort Bar — Desktop ══ */}
      <div className="hidden md:block border-b border-[#D8EDED]/60 bg-[#F5FAFA]">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-body text-[11px] tracking-wider uppercase text-[#8AACAE]">
            <Link to="/" className="hover:text-[#1A4547] transition-colors">Home</Link>
            <span className="text-[#A8C8CA]">/</span>
            <span className="text-[#5E8A8C]">Shop</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-body text-[11px] tracking-wide text-[#8AACAE]">{totalProductCount} products</span>
            <div className="relative">
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md border border-[#D0E8E8] bg-white/70 backdrop-blur-sm font-body text-[11px] tracking-wide text-[#5E8A8C] hover:border-[#9CB8BA] hover:text-[#1A4547] transition-all"
            >
              {sortOptions.find(o => o.value === sortBy)?.label || "Featured"}
              <ChevronDown size={13} className="text-[#8AACAE]" />
            </button>
            {showSortDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowSortDropdown(false)} />
                <div className="absolute right-0 top-full mt-1.5 z-20 bg-white rounded-md border border-[#D0E8E8] shadow-[0_8px_24px_rgba(35,90,93,0.08)] min-w-[180px] overflow-hidden">
                  {sortOptions.map(opt => (
                    <button key={opt.value}
                      onClick={() => { setSortBy(opt.value); setCurrentPage(1); setShowSortDropdown(false); }}
                      className={`w-full text-left px-4 py-2.5 font-body text-[13px] transition-colors ${sortBy === opt.value ? "bg-[#1A4547] text-white" : "text-[#5E8A8C] hover:bg-[#EFF7F7]"}`}
                    >{opt.label}</button>
                  ))}
                </div>
              </>
            )}
          </div>
          </div>
        </div>
      </div>

      {/* ══ Mobile — Breadcrumbs ══ */}
      <div className="md:hidden bg-[#F5FAFA] border-b border-[#D8EDED]/60">
        <div className="px-4 pt-3 pb-3 flex items-center gap-1.5 font-body text-[10px] tracking-wider uppercase text-[#8AACAE]">
          <Link to="/" className="hover:text-[#1A4547] transition-colors">Home</Link>
          <span className="text-[#A8C8CA]">/</span>
          <span className="text-[#5E8A8C]">Shop</span>
        </div>
      </div>

      {/* ══ Mobile Pinned Bottom Search & Filter ══ */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#D8EDED]/60 px-4 py-3 shadow-[0_-4px_16px_rgba(35,90,93,0.08)] pb-[calc(12px+env(safe-area-inset-bottom))]">
        <div className="flex gap-2.5">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CB8BA]" />
            <input
              type="text" placeholder="Search products..."
              value={searchInput} onChange={e => setSearchInput(e.target.value)} autoComplete="off"
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-[#D0E8E8] bg-white font-body text-sm text-[#1a1a1a] placeholder:text-[#9CB8BA] focus:outline-none focus:border-[#5E9A9C] transition-colors shadow-sm"
            />
          </div>
          <button onClick={() => setMobileFiltersOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg border border-[#D0E8E8] bg-white font-body text-xs text-[#5E8A8C] hover:border-[#9CB8BA] transition-colors flex-shrink-0 shadow-sm">
            <ChevronDown size={13} /> Filters
          </button>
        </div>
      </div>



      {/* ══ MAIN LAYOUT: Left sidebar filters + Right product grid ══ */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-10">
        <div className="flex gap-10">

          {/* ── LEFT SIDEBAR (like reference image) ── */}
          <aside className="hidden lg:block w-[250px] flex-shrink-0">
            <div className="sticky top-6 space-y-8">

              {/* Search */}
              <div>
                <h3 className="font-heading text-xs tracking-[0.2em] uppercase text-[#1a1a1a] font-bold mb-4">Search Catalog</h3>
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#CCC]" />
                  <input
                    type="text" placeholder="Search products..."
                    value={searchInput} onChange={e => setSearchInput(e.target.value)} autoComplete="off"
                    className="w-full pl-10 pr-4 py-2.5 border border-[#EAEAEA] bg-white font-body text-sm text-[#1a1a1a] placeholder:text-[#CCC] focus:outline-none focus:border-[#1A4547] transition-colors"
                  />
                </div>
              </div>

              {/* Category — checkbox style like reference */}
              <div>
                <button onClick={() => setCategoryOpen(!categoryOpen)} className="flex items-center justify-between w-full mb-4">
                  <h3 className="font-heading text-xs tracking-[0.2em] uppercase text-[#1a1a1a] font-bold">Category</h3>
                  <ChevronDown size={16} className={`text-[#999] transition-transform ${categoryOpen ? '' : '-rotate-90'}`} />
                </button>
                {categoryOpen && (
                  <div className="space-y-2.5">
                    {dynamicCategories.map(cat => (
                      <label key={cat} className="flex items-center gap-3 cursor-pointer group" onClick={() => { setActiveCategory(cat); setCurrentPage(1); }}>
                        <div className={`w-4 h-4 border flex items-center justify-center transition-colors ${activeCategory === cat ? 'bg-[#1A4547] border-[#1A4547]' : 'border-[#DDD] group-hover:border-[#999]'}`}>
                          {activeCategory === cat && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </div>
                        <span className={`font-body text-sm ${activeCategory === cat ? 'text-[#1a1a1a]' : 'text-[#666]'}`}>{cat}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* By Storage */}
              <div>
                <button onClick={() => setStorageOpen(!storageOpen)} className="flex items-center justify-between w-full mb-4">
                  <h3 className="font-heading text-xs tracking-[0.2em] uppercase text-[#1a1a1a] font-bold">By Storage</h3>
                  <ChevronDown size={16} className={`text-[#999] transition-transform ${storageOpen ? '' : '-rotate-90'}`} />
                </button>
                {storageOpen && (
                  <div className="space-y-2.5">
                    {storageList.map(item => (
                      <label key={item} className="flex items-center gap-3 cursor-pointer group" onClick={() => toggleStorage(item)}>
                        <div className={`w-4 h-4 border flex items-center justify-center transition-colors ${activeStorage.includes(item) ? 'bg-[#1A4547] border-[#1A4547]' : 'border-[#DDD] group-hover:border-[#999]'}`}>
                          {activeStorage.includes(item) && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </div>
                        <span className={`font-body text-sm ${activeStorage.includes(item) ? 'text-[#1a1a1a]' : 'text-[#666]'}`}>{item}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Price Range */}
              <div>
                <button onClick={() => setPriceOpen(!priceOpen)} className="flex items-center justify-between w-full mb-4">
                  <h3 className="font-heading text-xs tracking-[0.2em] uppercase text-[#1a1a1a] font-bold">Price Range</h3>
                  <ChevronDown size={16} className={`text-[#999] transition-transform ${priceOpen ? '' : '-rotate-90'}`} />
                </button>
                {priceOpen && (
                  <div>
                    <label htmlFor="price-range" className="sr-only">Maximum price range</label>
                    <input id="price-range" type="range" min={0} max={5000} step={100} value={priceRange[1]}
                      onChange={e => { setPriceRange([priceRange[0], Number(e.target.value)]); setCurrentPage(1); }}
                      className="w-full accent-[#1A4547]" />
                    <div className="flex justify-between font-body text-xs text-[#999] mt-1">
                      <span>₹{priceRange[0]}</span><span>₹{priceRange[1]}</span>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </aside>

          {/* ── PRODUCT GRID (3 columns, rectangular cards like reference) ── */}
          <div className="flex-1 min-w-0">
            {/* Mobile sort indicator */}
            <div className="lg:hidden mb-4 flex items-center justify-between">
              <span className="font-body text-[11px] text-[#8AACAE]">{totalProductCount} products</span>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-2.5 sm:gap-x-5 lg:gap-x-6 gap-y-5 sm:gap-y-8 lg:gap-y-10">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-[170px] sm:h-[220px] lg:h-[280px] bg-[#F5F5F5] rounded-sm" />
                    <div className="mt-4 space-y-2">
                      <div className="h-3 w-16 bg-[#F0F0F0] rounded" />
                      <div className="h-4 w-40 bg-[#F0F0F0] rounded" />
                      <div className="h-3 w-20 bg-[#F0F0F0] rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <Package className="mx-auto text-[#DDD] mb-4" size={48} />
                <p className="font-body text-[#999]">No products found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-3 sm:gap-x-5 lg:gap-x-6 gap-y-6 sm:gap-y-8 lg:gap-y-10">
                {paginatedProducts.map((product, i) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.04 }}
                    className="group rounded-md overflow-hidden border border-[#EAEAEA] bg-white hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300"
                  >
                    {/* Image */}
                    <Link to={`/products/${product._id}`} className="block relative h-[155px] sm:h-[220px] lg:h-[280px] overflow-hidden bg-[#F8F7F4]">
                      <img src={product.image} alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      {/* Wishlist */}
                      <button aria-label="Add to wishlist" title="Add to wishlist" onClick={e => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product._id); }}
                        className="absolute top-2 right-2 sm:top-3 sm:right-3 w-7 h-7 sm:w-8 sm:h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shadow-sm">
                        <Heart size={14} className={wishlist.includes(product._id) ? "fill-red-500 text-red-500" : "text-[#999]"} />
                      </button>
                    </Link>

                    {/* Info */}
                    <div className="p-2.5 sm:p-4">
                      <p className="font-body text-[10px] tracking-[0.2em] uppercase text-[#999] mb-1">{product.category}</p>
                      <Link to={`/products/${product._id}`}>
                        <h3 className="font-heading text-[12px] sm:text-[15px] text-[#1a1a1a] font-semibold leading-snug mb-1 line-clamp-2 group-hover:text-[#1A4547] transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-1 mb-2">
                        <Star size={12} className="fill-[#F5A623] text-[#F5A623]" />
                        <span className="font-body text-[11px] sm:text-xs text-[#1a1a1a]">{product.rating}</span>
                        <span className="hidden sm:inline font-body text-xs text-[#CCC]">({product.reviews})</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex flex-col">
                          <span className="font-body text-[13px] sm:text-lg text-[#1a1a1a] font-medium">₹{(product.salePrice || product.price).toFixed(2)}</span>
                          {(product.mrp || 0) > (product.salePrice || product.price) && (
                            <div className="flex items-center gap-1.5">
                              <span className="font-body text-[10px] sm:text-xs text-[#999] line-through">₹{product.mrp}</span>
                            </div>
                          )}
                        </div>
                        {(!product.inStock || product.quantity <= 0) ? (
                          <div className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-sm bg-[#F5F5F5] text-[#999] font-body text-[10px] sm:text-[11px] font-medium uppercase tracking-wider text-center cursor-not-allowed">
                            Out of Stock
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(product)}
                            className="px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-sm bg-[#1a1a1a] text-white font-body text-[11px] sm:text-xs tracking-wide hover:bg-[#1A4547] transition-colors flex items-center gap-1"
                          >
                            <ShoppingBag size={11} /> Add
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {effectiveTotalPages > 1 && (
              <div className="mt-14 flex items-center justify-center gap-2">
                <button onClick={() => { window.scrollTo({ top: 0 }); setTimeout(() => setCurrentPage(p => Math.max(1, p - 1)), 50); }} disabled={currentPage === 1}
                  className="px-4 py-2 border border-[#EAEAEA] text-[#1a1a1a] font-body text-sm hover:bg-[#F8F8F8] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                  ← Previous
                </button>
                {Array.from({ length: effectiveTotalPages }, (_, i) => i + 1).map(page => (
                  <button key={page} onClick={() => { window.scrollTo({ top: 0 }); setTimeout(() => setCurrentPage(page), 50); }}
                    className={`min-w-[40px] h-10 font-body text-sm transition-all ${currentPage === page ? 'bg-[#1a1a1a] text-white' : 'border border-[#EAEAEA] text-[#1a1a1a] hover:bg-[#F8F8F8]'}`}>
                    {page}
                  </button>
                ))}
                <button onClick={() => { window.scrollTo({ top: 0 }); setTimeout(() => setCurrentPage(p => Math.min(effectiveTotalPages, p + 1)), 50); }} disabled={currentPage === effectiveTotalPages}
                  className="px-4 py-2 border border-[#EAEAEA] text-[#1a1a1a] font-body text-sm hover:bg-[#F8F8F8] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══ CUSTOMER REVIEWS SECTION ══ */}
      {siteReviews.length > 0 && (
        <section className="border-t border-[#D8EDED] bg-white">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 py-12 md:py-16">
            <div className="text-center mb-8 md:mb-10">
              <p className="font-body text-xs tracking-[0.25em] text-[#7A9A9C] uppercase mb-2">What People Say</p>
              <h2 className="font-heading text-2xl md:text-3xl text-[#1a1a1a] font-bold">Customer Reviews</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {siteReviews.slice(0, 6).map(r => (
                <div key={r._id} className="bg-white rounded-xl border border-[#D8EDED] p-5 md:p-6 shadow-[0_1px_4px_rgba(35,90,93,0.04)]">
                  <div className="flex items-center gap-0.5 mb-3">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} size={14} className={i <= r.rating ? "text-[#F5A623] fill-[#F5A623]" : "text-gray-200 fill-gray-200"} />
                    ))}
                  </div>
                  {r.title && <p className="font-heading text-sm font-semibold text-[#1a1a1a] mb-1.5">{r.title}</p>}
                  <p className="font-body text-sm text-[#666] leading-relaxed mb-4 line-clamp-3">{r.comment}</p>
                  <p className="font-body text-xs text-[#7A9A9C] font-medium">— {r.userName}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/919999999999"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-[84px] md:bottom-8 right-4 md:right-8 z-40 w-12 h-12 md:w-14 md:h-14 bg-[#25D366] text-white rounded-full shadow-[0_4px_14px_rgba(37,211,102,0.4)] flex items-center justify-center hover:bg-[#1EBE57] hover:shadow-[0_6px_20px_rgba(37,211,102,0.5)] transition-all"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      </a>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black" onClick={() => setMobileFiltersOpen(false)} />
            <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-80 max-w-[85vw] bg-white shadow-2xl flex flex-col">
              <div className="flex items-center justify-between px-6 py-5 border-b border-[#EAEAEA]">
                <h3 className="font-heading text-sm tracking-[0.15em] uppercase font-bold text-[#1a1a1a]">Search Catalog</h3>
                <button aria-label="Close filters" title="Close filters" onClick={() => setMobileFiltersOpen(false)} className="text-[#999] hover:text-[#1a1a1a]"><X size={20} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#CCC]" />
                  <input type="text" placeholder="Search products..." value={searchInput} onChange={e => setSearchInput(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 border border-[#EAEAEA] font-body text-sm text-[#1a1a1a] placeholder:text-[#CCC] focus:outline-none focus:border-[#1A4547]" />
                </div>
                <div>
                  <h4 className="font-heading text-xs tracking-[0.15em] uppercase font-bold text-[#1a1a1a] mb-3">Category</h4>
                  <div className="space-y-2">
                    {dynamicCategories.map(cat => (
                      <label key={cat} className="flex items-center gap-3 cursor-pointer" onClick={() => { setActiveCategory(cat); setCurrentPage(1); }}>
                        <div className={`w-4 h-4 border flex items-center justify-center ${activeCategory === cat ? 'bg-[#1A4547] border-[#1A4547]' : 'border-[#DDD]'}`}>
                          {activeCategory === cat && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </div>
                        <span className="font-body text-sm text-[#666]">{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-heading text-xs tracking-[0.15em] uppercase font-bold text-[#1a1a1a] mb-3">By Storage</h4>
                  <div className="space-y-2">
                    {storageList.map(item => (
                      <label key={item} className="flex items-center gap-3 cursor-pointer" onClick={() => toggleStorage(item)}>
                        <div className={`w-4 h-4 border flex items-center justify-center ${activeStorage.includes(item) ? 'bg-[#1A4547] border-[#1A4547]' : 'border-[#DDD]'}`}>
                          {activeStorage.includes(item) && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </div>
                        <span className="font-body text-sm text-[#666]">{item}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-heading text-xs tracking-[0.15em] uppercase font-bold text-[#1a1a1a] mb-3">Sort By</h4>
                  <div className="space-y-1">
                    {sortOptions.map(opt => (
                      <button key={opt.value} onClick={() => { setSortBy(opt.value); setCurrentPage(1); }}
                        className={`w-full text-left px-3 py-2 font-body text-sm transition-all ${sortBy === opt.value ? "bg-[#1a1a1a] text-white" : "text-[#666] hover:bg-[#F8F8F8]"}`}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="border-t border-[#EAEAEA] p-4">
                <button onClick={() => setMobileFiltersOpen(false)} className="w-full py-3 bg-[#1a1a1a] text-white font-body text-sm tracking-wide">Apply Filters</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>



      {/* ══ CART — Desktop: animated sidebar ══ */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="fixed inset-0 z-50 bg-black/25 backdrop-blur-[8px] hidden md:block" onClick={() => setCartOpen(false)} />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 32, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-[420px] bg-[#F5FAFA] shadow-[-8px_0_30px_rgba(0,0,0,0.1)] hidden md:flex flex-col">
              <div className="flex items-center justify-between px-5 py-4 bg-white border-b border-[#D8EDED]">
                <div className="flex items-center gap-3"><ShoppingBag size={18} className="text-[#1A4547]" /><h3 className="font-heading text-base text-[#1a1a1a] font-bold">Your Cart</h3>{cartCount > 0 && <span className="bg-[#1A4547] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{cartCount}</span>}</div>
                <button aria-label="Close cart" title="Close cart" onClick={() => setCartOpen(false)} className="w-8 h-8 rounded-full bg-[#EFF7F7] flex items-center justify-center text-[#5E8A8C] hover:bg-[#D8EDED] hover:text-[#1A4547] transition-colors"><X size={16} /></button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {cart.length === 0 ? (
                  <div className="text-center py-20 px-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#EFF7F7] flex items-center justify-center"><ShoppingBag className="text-[#9CB8BA]" size={28} /></div>
                    <p className="font-heading text-sm text-[#1a1a1a] font-semibold mb-1">Your cart is empty</p>
                    <p className="font-body text-xs text-[#7A9A9C] mb-5">Add something delicious to get started</p>
                    <button onClick={() => setCartOpen(false)} className="font-body text-xs text-[#1A4547] font-medium border border-[#D0E8E8] rounded-lg px-5 py-2.5 hover:bg-[#EFF7F7] transition-colors">Continue Shopping</button>
                  </div>
                ) : (
                  <>
                    <div className="px-4 py-3 space-y-2.5">
                      {cart.map(item => (
                        <div key={item._id} className="flex gap-3 p-3 bg-white rounded-xl border border-[#D8EDED] shadow-[0_1px_4px_rgba(35,90,93,0.04)]">
                          <img src={item.image} alt={item.name} className="w-[68px] h-[68px] object-cover rounded-lg flex-shrink-0" />
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div><p className="font-heading text-[13px] text-[#1a1a1a] font-semibold leading-snug line-clamp-2">{item.name}</p><p className="font-body text-xs text-[#7A9A9C] mt-0.5">₹{item.price} each</p></div>
                            <div className="flex items-center justify-between mt-1.5">
                              <div className="flex items-center border border-[#D0E8E8] rounded-lg overflow-hidden">
                                <button aria-label="Decrease quantity" title="Decrease quantity" onClick={() => updateQty(item._id, -1)} className="w-7 h-7 flex items-center justify-center text-[#5E8A8C] hover:bg-[#EFF7F7] transition-colors"><Minus size={12} /></button>
                                <span className="font-body text-xs text-[#1a1a1a] w-7 text-center font-semibold">{item.qty}</span>
                                <button aria-label="Increase quantity" title="Increase quantity" onClick={() => updateQty(item._id, 1)} className="w-7 h-7 flex items-center justify-center text-[#5E8A8C] hover:bg-[#EFF7F7] transition-colors"><Plus size={12} /></button>
                              </div>
                              <div className="flex items-center gap-3"><p className="font-heading text-sm text-[#1a1a1a] font-bold">₹{item.price * item.qty}</p><button aria-label="Remove from cart" title="Remove from cart" onClick={() => removeFromCart(item._id)} className="text-[#9CB8BA] hover:text-red-400 transition-colors"><Trash2 size={13} /></button></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {addonProducts.filter(a => !cart.some(c => c._id === a._id)).length > 0 && (
                      <div className="mt-3 border-t border-[#D8EDED] pt-4 pb-2">
                        <div className="px-5 mb-3 flex items-center gap-2"><Plus size={13} className="text-[#1A4547]" /><h4 className="font-heading text-xs tracking-[0.1em] uppercase text-[#5E8A8C] font-bold">You might also like</h4></div>
                        <div className="flex gap-2.5 overflow-x-auto px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                          {addonProducts.filter(a => !cart.some(c => c._id === a._id)).slice(0, 8).map(addon => (
                            <div key={addon._id} className="min-w-[130px] max-w-[130px] bg-white rounded-xl border border-[#D8EDED] overflow-hidden shadow-[0_1px_4px_rgba(35,90,93,0.04)] flex-shrink-0">
                              <div className="h-[90px] bg-[#EFF7F7] overflow-hidden"><img src={addon.image} alt={addon.name} className="w-full h-full object-cover" /></div>
                              <div className="p-2.5"><p className="font-heading text-[11px] text-[#1a1a1a] font-semibold leading-snug line-clamp-2 mb-1.5">{addon.name}</p><div className="flex items-center justify-between"><span className="font-body text-[11px] text-[#1A4547] font-semibold">₹{addon.salePrice || addon.price}</span><button onClick={() => addToCart(addon)} className="w-6 h-6 rounded-full bg-[#1A4547] text-white flex items-center justify-center hover:bg-[#122E30] transition-colors"><Plus size={12} /></button></div></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="mx-4 mt-2 mb-3 p-3 bg-white rounded-xl border border-[#D8EDED]">
                      <p className="font-heading text-xs tracking-[0.08em] uppercase text-[#5E8A8C] font-bold mb-2">Apply Coupon</p>
                      {appliedCoupon ? (
                        <div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-[#1A4547] bg-[#F5EFE7] px-2 py-1 rounded">{appliedCoupon.code}</span>
                              <span className="font-body text-[11px] text-[#5E8A8C]">Applied</span>
                            </div>
                            <button onClick={removeCoupon} className="text-[10px] text-[#7A9A9C] hover:text-red-500 font-medium transition-colors">Remove</button>
                          </div>
                          <p className="font-body text-[11px] text-[#6B8F71] mt-1.5">You save ₹{appliedCoupon.discount} on this order</p>
                        </div>
                      ) : (
                        <>
                          <div className="flex gap-2">
                            <input type="text" placeholder="Enter code" value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} className="flex-1 px-3 py-2 border border-[#D0E8E8] rounded-lg font-body text-xs text-[#1a1a1a] placeholder:text-[#9CB8BA] focus:outline-none focus:border-[#5E9A9C]" />
                            <button onClick={handleApplyCoupon} disabled={couponLoading} className="px-4 py-2 rounded-lg font-body text-xs font-medium bg-[#1A4547] text-white hover:bg-[#122E30] transition-colors disabled:opacity-50">{couponLoading ? '...' : 'Apply'}</button>
                          </div>
                          {couponError && <p className="font-body text-[11px] text-red-500 mt-1.5">{couponError}</p>}
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
              {cart.length > 0 && (
                <div className="bg-white border-t border-[#D8EDED] px-5 py-4">
                  <div className="space-y-1.5 mb-4">
                    <div className="flex justify-between font-body text-xs text-[#7A9A9C]"><span>Total MRP</span><span className="text-[#1a1a1a] font-medium">₹{cartMrpTotal}</span></div>
                    {cartDiscount > 0 && <div className="flex justify-between font-body text-xs text-[#7A9A9C]"><span>Discount on MRP</span><span className="text-[#25A56A] font-medium">-₹{cartDiscount}</span></div>}
                    {couponDiscount > 0 && <div className="flex justify-between font-body text-xs text-[#7A9A9C]"><span>Coupon ({appliedCoupon?.code})</span><span className="text-[#25A56A] font-medium">-₹{couponDiscount}</span></div>}
                    <div className="flex justify-between font-body text-xs text-[#7A9A9C]">
                      <span>Shipping</span>
                      {shippingFee === 0 ? (
                        <span className="text-[#25A56A] font-medium">Free</span>
                      ) : (
                        <span className="font-medium">₹{shippingFee}</span>
                      )}
                    </div>
                    <div className="h-px bg-[#D8EDED] my-1" />
                    <div className="flex justify-between font-heading text-base text-[#1a1a1a] font-bold"><span>Total</span><span>₹{cartFinalTotal}</span></div>
                  </div>
                  <button type="button" onClick={handleBuyNow} className="w-full py-3.5 bg-[#1A4547] text-white font-body text-sm tracking-wide rounded-xl hover:bg-[#122E30] transition-colors shadow-[0_4px_12px_rgba(35,90,93,0.2)]">Proceed to Checkout</button>
                  <button onClick={() => setCartOpen(false)} className="w-full mt-2 py-2 font-body text-xs text-[#5E8A8C] hover:text-[#1A4547] transition-colors">Continue Shopping</button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ══ CART — Mobile: instant full-page, no animations ══ */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 bg-[#F5FAFA] md:hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-3.5 bg-white border-b border-[#D8EDED]">
            <button aria-label="Close cart" title="Close cart" onClick={() => setCartOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center text-[#5E8A8C]"><ArrowRight size={18} className="rotate-180" /></button>
            <div className="flex items-center gap-2"><h3 className="font-heading text-[15px] text-[#1a1a1a] font-bold">My Cart</h3>{cartCount > 0 && <span className="bg-[#1A4547] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{cartCount}</span>}</div>
            <div className="w-8" />
          </div>
          <div className="flex-1 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="text-center py-24 px-6">
                <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-[#EFF7F7] flex items-center justify-center"><ShoppingBag className="text-[#9CB8BA]" size={32} /></div>
                <p className="font-heading text-base text-[#1a1a1a] font-semibold mb-1">Your cart is empty</p>
                <p className="font-body text-sm text-[#7A9A9C] mb-6">Explore our collection and add items you love</p>
                <button onClick={() => setCartOpen(false)} className="font-body text-sm text-[#1A4547] font-medium border border-[#D0E8E8] rounded-xl px-6 py-3 hover:bg-[#EFF7F7] transition-colors">Start Shopping</button>
              </div>
            ) : (
              <>
                <div className="px-4 pt-4 pb-2 space-y-3">
                  <p className="font-heading text-xs tracking-[0.1em] uppercase text-[#5E8A8C] font-bold px-1">Items in your cart</p>
                  {cart.map(item => (
                    <div key={item._id} className="flex gap-3 p-3 bg-white rounded-2xl border border-[#D8EDED] shadow-[0_1px_4px_rgba(35,90,93,0.04)]">
                      <img src={item.image} alt={item.name} className="w-[72px] h-[72px] object-cover rounded-xl flex-shrink-0" />
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div><p className="font-heading text-[13px] text-[#1a1a1a] font-semibold leading-snug line-clamp-2">{item.name}</p><p className="font-body text-[11px] text-[#7A9A9C] mt-0.5">₹{item.price} each</p></div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-[#D0E8E8] rounded-lg overflow-hidden">
                            <button aria-label="Decrease quantity" title="Decrease quantity" onClick={() => updateQty(item._id, -1)} className="w-8 h-8 flex items-center justify-center text-[#5E8A8C] active:bg-[#EFF7F7]"><Minus size={13} /></button>
                            <span className="font-body text-sm text-[#1a1a1a] w-8 text-center font-semibold">{item.qty}</span>
                            <button aria-label="Increase quantity" title="Increase quantity" onClick={() => updateQty(item._id, 1)} className="w-8 h-8 flex items-center justify-center text-[#5E8A8C] active:bg-[#EFF7F7]"><Plus size={13} /></button>
                          </div>
                          <div className="flex items-center gap-3"><p className="font-heading text-[15px] text-[#1a1a1a] font-bold">₹{item.price * item.qty}</p><button aria-label="Remove from cart" title="Remove from cart" onClick={() => removeFromCart(item._id)} className="text-[#9CB8BA] hover:text-red-400 transition-colors"><Trash2 size={14} /></button></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {addonProducts.filter(a => !cart.some(c => c._id === a._id)).length > 0 && (
                  <div className="mt-4 border-t border-[#D8EDED] pt-4 pb-2">
                    <div className="px-5 mb-3 flex items-center gap-2"><Plus size={14} className="text-[#1A4547]" /><h4 className="font-heading text-xs tracking-[0.1em] uppercase text-[#5E8A8C] font-bold">You might also like</h4></div>
                    <div className="flex gap-3 overflow-x-auto px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                      {addonProducts.filter(a => !cart.some(c => c._id === a._id)).slice(0, 8).map(addon => (
                        <div key={addon._id} className="min-w-[140px] max-w-[140px] bg-white rounded-2xl border border-[#D8EDED] overflow-hidden shadow-[0_1px_4px_rgba(35,90,93,0.04)] flex-shrink-0">
                          <div className="h-[100px] bg-[#EFF7F7] overflow-hidden"><img src={addon.image} alt={addon.name} className="w-full h-full object-cover" /></div>
                          <div className="p-2.5"><p className="font-heading text-[11px] text-[#1a1a1a] font-semibold leading-snug line-clamp-2 mb-2">{addon.name}</p><div className="flex items-center justify-between"><span className="font-body text-[12px] text-[#1A4547] font-semibold">₹{addon.salePrice || addon.price}</span><button onClick={() => addToCart(addon)} className="w-7 h-7 rounded-full bg-[#1A4547] text-white flex items-center justify-center active:bg-[#122E30]"><Plus size={13} /></button></div></div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="mx-4 mt-3 p-4 bg-white rounded-2xl border border-[#D8EDED]">
                  <p className="font-heading text-xs tracking-[0.08em] uppercase text-[#5E8A8C] font-bold mb-2.5">Apply Coupon</p>
                  {appliedCoupon ? (
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-[#1A4547] bg-[#F5EFE7] px-2.5 py-1 rounded-lg">{appliedCoupon.code}</span>
                          <span className="font-body text-xs text-[#5E8A8C]">Applied</span>
                        </div>
                        <button onClick={removeCoupon} className="text-xs text-[#7A9A9C] hover:text-red-500 font-medium transition-colors">Remove</button>
                      </div>
                      <p className="font-body text-xs text-[#6B8F71] mt-2">You save ₹{appliedCoupon.discount} on this order</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex gap-2">
                        <input type="text" placeholder="Enter coupon code" value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} className="flex-1 px-3.5 py-2.5 border border-[#D0E8E8] rounded-xl font-body text-sm text-[#1a1a1a] placeholder:text-[#9CB8BA] focus:outline-none focus:border-[#5E9A9C]" />
                        <button onClick={handleApplyCoupon} disabled={couponLoading} className="px-5 py-2.5 rounded-xl font-body text-sm font-medium bg-[#1A4547] text-white active:bg-[#122E30] transition-colors disabled:opacity-50">{couponLoading ? '...' : 'Apply'}</button>
                      </div>
                      {couponError && <p className="font-body text-xs text-red-500 mt-2">{couponError}</p>}
                    </>
                  )}
                </div>
                <div className="mx-4 mt-3 mb-4 p-4 bg-white rounded-2xl border border-[#D8EDED]">
                  <p className="font-heading text-xs tracking-[0.08em] uppercase text-[#5E8A8C] font-bold mb-3">Price Details</p>
                  <div className="space-y-2.5">
                    <div className="flex justify-between font-body text-sm text-[#666]"><span>Total MRP ({cartCount} items)</span><span className="text-[#1a1a1a]">₹{cartMrpTotal}</span></div>
                    {cartDiscount > 0 && <div className="flex justify-between font-body text-sm text-[#666]"><span>Discount on MRP</span><span className="text-[#25A56A] font-medium">-₹{cartDiscount}</span></div>}
                    {couponDiscount > 0 && <div className="flex justify-between font-body text-sm text-[#666]"><span>Coupon ({appliedCoupon?.code})</span><span className="text-[#25A56A] font-medium">-₹{couponDiscount}</span></div>}
                    <div className="flex justify-between font-body text-sm text-[#666]">
                      <span>Delivery</span>
                      {shippingFee === 0 ? (
                        <span className="text-[#25A56A] font-medium">Free</span>
                      ) : (
                        <span className="font-medium">₹{shippingFee}</span>
                      )}
                    </div>
                    <div className="h-px bg-[#D8EDED]" />
                    <div className="flex justify-between font-heading text-base text-[#1a1a1a] font-bold"><span>Total Amount</span><span>₹{cartFinalTotal}</span></div>
                  </div>
                </div>
              </>
            )}
          </div>
          {cart.length > 0 && (
            <div className="bg-white border-t border-[#D8EDED] px-4 py-4">
              <div className="flex items-center justify-between">
                <div><p className="font-body text-[11px] text-[#7A9A9C]">Total Amount</p><p className="font-heading text-lg text-[#1a1a1a] font-bold">₹{cartFinalTotal}</p></div>
                <button type="button" onClick={handleBuyNow} className="px-8 py-3.5 bg-[#1A4547] text-white font-body text-sm font-medium tracking-wide rounded-xl active:bg-[#122E30] shadow-[0_4px_12px_rgba(35,90,93,0.25)]">Checkout</button>
              </div>
            </div>
          )}
        </div>
      )}

      <Footer />
    </div>
  );
}
