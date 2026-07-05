import { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut, ShoppingBag, Heart, Search, ShoppingCart, Package, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/useAuth";

const isShop = window.location.hostname.startsWith("shop.");

// Use absolute URLs for domains ONLY if we are in production. Otherwise use relative paths for local dev!
const isDev = import.meta.env.DEV;

const navLinks = [
  { label: "Shop", path: "/products" },
  { label: "Cafe", path: "/cafe" },
  { label: "Horeca", path: "/b2b" },
  { label: "Gifting", path: "/gifting" },
  { label: "About Us", path: "/about" },
  { label: "Careers", path: "/careers" },
  { label: "Blog", path: "/blog" },
  { label: "Recipes", path: "/recipes" },
  { label: "Track Order", path: "/track-order" },
  { label: "Contact", path: "/contact" },
];

const sidePanel = {
  hidden: { x: "-102%" },
  visible: { x: 0, transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] as const } },
  exit: { x: "-102%", transition: { duration: 0.2, ease: [0.7, 0, 0.84, 0] as const } },
};

const backdrop = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.18 } },
  exit: { opacity: 0, transition: { duration: 0.14 } },
};

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartCount, setCartCount] = useState(0);

  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isShopDomain = window.location.hostname.startsWith("shop.");
  const isProductsPage = location.pathname === "/products";
  const isProductDetailPage = location.pathname.startsWith("/products/");
  const canOpenCartInPlace = isProductsPage || isProductDetailPage;

  // Cart count from localStorage
  const updateCartCount = useCallback(() => {
    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      setCartCount(cart.reduce((sum: number, item: { qty: number }) => sum + item.qty, 0));
    } catch { setCartCount(0); }
  }, []);

  useEffect(() => {
    updateCartCount();
    window.addEventListener("storage", updateCartCount);
    const interval = setInterval(updateCartCount, 1000);
    return () => { window.removeEventListener("storage", updateCartCount); clearInterval(interval); };
  }, [updateCartCount]);

  // Search sync for products page
  useEffect(() => {
    if (!isProductsPage) return;
    const q = new URLSearchParams(location.search).get("search") || "";
    setSearchQuery(q);
  }, [isProductsPage, location.search]);

  useEffect(() => {
    if (!isProductsPage) return;
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(location.search);
      const next = searchQuery.trim();
      const current = params.get("search") || "";
      if (next === current) return;
      if (next) params.set("search", next); else params.delete("search");
      const s = params.toString();
      navigate({ pathname: "/products", search: s ? `?${s}` : "" }, { replace: true });
    }, 260);
    return () => window.clearTimeout(timer);
  }, [searchQuery, isProductsPage, location.search, navigate]);

  // Scroll detection
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // Close profile dropdown on outside click — handled by overlay below

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate("/");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    navigate(q ? `/products?search=${encodeURIComponent(q)}` : "/products");
  };

  const linkClass = (path: string) =>
    `font-heading text-[12.5px] xl:text-[13px] tracking-[0.02em] font-semibold transition-colors duration-150 whitespace-nowrap relative group ${
      location.pathname === path ? "text-[#1A4547]" : "text-[#1A4547]/80 hover:text-[#1A4547]"
    }`;

  return (
    <>
      <nav
        className={`sticky top-0 z-50 bg-white border-b border-[#1A4547]/15 transition-shadow duration-200 ${
          scrolled ? "shadow-[0_2px_16px_rgba(35,90,93,0.12)]" : ""
        }`}
      >
        {/* Invisible overlay to catch taps outside profile dropdown */}
        {profileOpen && (
          <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
        )}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between h-14 lg:h-16">

            {/* ── MOBILE LAYOUT ── */}
            <div className="lg:hidden flex items-center justify-between w-full">
              {/* Left: Hamburger */}
              <button
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#EFF7F7] transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
              >
                <AnimatePresence mode="wait">
                  {mobileOpen ? (
                    <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                      <X size={22} className="text-[#1A4547]" />
                    </motion.span>
                  ) : (
                    <motion.span key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                      <Menu size={22} className="text-[#1A4547]" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              {/* Center: Logo */}
              {isShopDomain ? (
                <a
                  href="https://ingri.world"
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center"
                >
                  <img src="/ingri-green-logo.png" alt="INGRI" className="h-7 w-auto object-contain" />
                </a>
              ) : (
                <Link
                  to="/"
                  onClick={() => { if (location.pathname === "/") window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center"
                >
                  <img src="/ingri-green-logo.png" alt="INGRI" className="h-7 w-auto object-contain" />
                </Link>
              )}

              {/* Right: Cart + User */}
              <div className="flex items-center gap-2">
                <button onClick={() => { if (canOpenCartInPlace) window.dispatchEvent(new CustomEvent('open-cart')); else navigate('/products?cart=open'); }} className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#1A4547]/[0.05] transition-colors">
                  <ShoppingCart size={19} strokeWidth={1.8} className="text-[#1A4547]" />
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[15px] h-[15px] px-0.5 bg-[#1A4547] text-white text-[8px] font-bold rounded-full flex items-center justify-center ring-[1.5px] ring-white">
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* ── DESKTOP LAYOUT ── */}
            <div className="hidden lg:flex items-center flex-1">
              {/* Logo */}
              {isShopDomain ? (
                <a
                  href="https://ingri.world"
                  className="flex items-center shrink-0 mr-6 xl:mr-8 group"
                >
                  <img src="/ingri-green-logo.png" alt="INGRI" className="h-8 w-auto object-contain" />
                </a>
              ) : (
                <Link
                  to="/"
                  onClick={() => { if (location.pathname === "/") window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  className="flex items-center shrink-0 mr-6 xl:mr-8 group"
                >
                  <img src="/ingri-green-logo.png" alt="INGRI" className="h-8 w-auto object-contain" />
                </Link>
              )}

              {/* Nav links */}
              <div className="flex items-center gap-4 xl:gap-6">
                {navLinks.map((link) => (
                  link.href ? (
                    <a key={link.path} href={link.href} className={linkClass(link.path)}>
                      <span className="relative pb-1">
                        {link.label}
                        <span className="absolute -bottom-0.5 left-0 right-0 h-[1.5px] bg-[#1A4547] rounded-full transition-transform duration-300 ease-out origin-center scale-x-0 group-hover:scale-x-100" />
                      </span>
                    </a>
                  ) : (
                    <Link key={link.path} to={link.path} className={linkClass(link.path)}>
                      <span className="relative pb-1">
                        {link.label}
                        <span
                          className={`absolute -bottom-0.5 left-0 right-0 h-[1.5px] bg-[#1A4547] rounded-full transition-transform duration-300 ease-out origin-center ${
                            location.pathname === link.path
                              ? "scale-x-100"
                              : "scale-x-0 group-hover:scale-x-100"
                          }`}
                        />
                      </span>
                    </Link>
                  )
                ))}
              </div>
            </div>

            {/* Desktop right side: Cart */}
            <div className="hidden lg:flex items-center gap-4">
              <button onClick={() => { if (canOpenCartInPlace) window.dispatchEvent(new CustomEvent('open-cart')); else navigate('/products?cart=open'); }} className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#1A4547]/[0.05] transition-colors">
                <ShoppingCart size={18} strokeWidth={1.8} className="text-[#1A4547]" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-[#1A4547] text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

        </div>
      </nav>


      {/* ═══ MOBILE SIDE MENU ═══ */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="backdrop"
              variants={backdrop}
              initial="hidden" animate="visible" exit="exit"
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/40"
            />
            <motion.aside
              key="panel"
              variants={sidePanel}
              initial="hidden" animate="visible" exit="exit"
              className="fixed left-0 top-0 bottom-0 z-50 w-[80vw] max-w-[320px] bg-gradient-to-b from-[#EFF7F7] via-white to-[#E6F2F0] border-r border-[#1A4547]/10 shadow-2xl"
            >
              <div className="h-full flex flex-col">
                {/* Header */}
                <div className="h-14 shrink-0 border-b border-[#1A4547]/10 px-4 flex items-center justify-between">
                  {isShopDomain ? (
                    <a href="https://ingri.world" onClick={() => setMobileOpen(false)} className="h-10 flex items-center">
                      <img src="/ingri-green-logo.png" alt="INGRI" className="h-7 w-auto object-contain" />
                    </a>
                  ) : (
                    <Link to="/" onClick={() => setMobileOpen(false)} className="h-10 flex items-center">
                      <img src="/ingri-green-logo.png" alt="INGRI" className="h-7 w-auto object-contain" />
                    </Link>
                  )}
                  <button
                    onClick={() => setMobileOpen(false)}
                    aria-label="Close menu"
                    className="w-8 h-8 rounded-full bg-white/90 border border-[#1A4547]/15 text-[#1A4547] flex items-center justify-center hover:bg-[#EFF7F7] transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Accent bar */}
                <div className="absolute top-14 right-0 w-[4px] h-20 bg-gradient-to-b from-[#1A4547]/30 to-transparent rounded-bl" />

                {/* Nav links */}
                <div className="flex-1 overflow-y-auto px-3 pt-3 pb-2 space-y-0.5">
                  {navLinks.map((link) => (
                    link.href ? (
                      <a
                        key={link.path}
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className="block rounded-lg px-4 py-3 font-heading text-[14px] tracking-wide transition-all duration-200 text-[#1A4547]/85 hover:bg-[#1A4547]/[0.06] active:bg-[#1A4547]/10"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setMobileOpen(false)}
                        className={`block rounded-lg px-4 py-3 font-heading text-[14px] tracking-wide transition-all duration-200 ${
                          location.pathname === link.path
                            ? "bg-[#1A4547] text-white shadow-md"
                            : "text-[#1A4547]/85 hover:bg-[#1A4547]/[0.06] active:bg-[#1A4547]/10"
                        }`}
                      >
                        {link.label}
                      </Link>
                    )
                  ))}
                </div>

                {/* Bottom: Footer info */}
                <div className="shrink-0 border-t border-[#1A4547]/10 px-3 pt-3 pb-6" style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}>
                  <p className="text-center font-body text-[10px] text-[#1A4547]/40 mt-3 tracking-wide">
                    INGRI, Sector 28, Gurugram
                  </p>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

    </>
  );
}
