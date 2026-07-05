import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Star, Gift, ChefHat, Coffee, ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { apiUrl } from "@/lib/api";



/* ─── Services ─── */
const b2bServices = [
  { icon: Coffee, title: "Shop", desc: "In-house creations built around quality ingredients. Made for daily use, executed with restaurant-level discipline." },
  { icon: Gift, title: "Gifting", desc: "Curated gift hampers designed for lasting impressions." },
  { icon: ChefHat, title: "HORECA", desc: "Reliable volume supply for retail and hospitality clients." },
];

/* ─── Museum Living Gallery - Food & Ambiance ─── */
const galleryImages = [
  "/images/FOOD/Screenshot 2026-02-13 193225.png",
  "/images/FOOD/Screenshot 2026-02-13 193307.png",
  "/images/FOOD/Screenshot 2026-02-13 193211.png",
  "/images/AMBIANCE/Screenshot 2026-02-13 192813.png",
  "/images/AMBIANCE/Screenshot 2026-02-13 192909.png",
  "/images/AMBIANCE/Screenshot 2026-02-13 192722.png",
];

type Deal = {
  _id: string;
  title: string;
  type: "scroll" | "banner" | "popup";
  image?: string;
  content?: string;
  productId?: string | null;
  active?: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
};

const isDealActive = (deal: Deal) => {
  if (deal.active === false) return false;
  const now = new Date();
  if (deal.startsAt) {
    const start = new Date(deal.startsAt);
    if (start.getTime() > now.getTime()) return false;
  }
  if (deal.endsAt) {
    const end = new Date(deal.endsAt);
    if (end.getTime() < now.getTime()) return false;
  }
  return true;
};

/* ─── Animation variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};

const childFade = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const philRef = useRef(null);
  const b2bRef = useRef(null);
  const galleryRef = useRef(null);
  const newsletterRef = useRef(null);

  const philInView = useInView(philRef, { once: true, margin: "-80px" });
  const b2bInView = useInView(b2bRef, { once: true, margin: "-80px" });
  const galleryInView = useInView(galleryRef, { once: true, margin: "-80px" });
  const newsletterInView = useInView(newsletterRef, { once: true, margin: "-80px" });

  const [deals, setDeals] = useState<Deal[]>([]);
  const [shopProducts, setShopProducts] = useState<{ _id: string; name: string; price: number; mrp?: number; salePrice?: number; image: string; rating: number; reviews?: number; category?: string; bestSeller?: boolean }[]>([]);
  const [heroBanners, setHeroBanners] = useState<{ _id: string; title: string; desktopImage?: string; mobileImage?: string; image?: string; link?: string; linkEnabled?: boolean; description?: string }[]>([]);
  const [heroIndex, setHeroIndex] = useState(0);

  const bannerDeal = deals.find((d) => d.type === "banner");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(apiUrl("/api/deals"));
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        const raw: Deal[] = (data.deals || data || []) as Deal[];
        const active = raw.filter(isDealActive);
        setDeals(active);
      } catch {
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Fetch products for Best Sellers
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Try fetching best sellers first
        const res = await fetch(apiUrl("/api/products?bestSeller=true&limit=10"));
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        let items = (data.products || []).slice(0, 10);
        // Fallback: if no bestSeller products, fetch by rating
        if (items.length === 0) {
          const fallback = await fetch(apiUrl("/api/products?sort=rating&limit=10"));
          if (fallback.ok) {
            const fbData = await fallback.json();
            items = (fbData.products || []).slice(0, 10);
          }
        }
        setShopProducts(items);
      } catch { /* silent */ }
    })();
    return () => { mounted = false; };
  }, []);

  // Fetch hero banners
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(apiUrl("/api/banners"));
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        const active = (data.banners || []).filter((b: { active?: boolean }) => b.active !== false);
        if (active.length > 0) setHeroBanners(active);
      } catch { /* silent */ }
    })();
    return () => { mounted = false; };
  }, []);

  // Auto-advance hero carousel
  useEffect(() => {
    if (heroBanners.length <= 1) return;
    const timer = setInterval(() => setHeroIndex(i => (i + 1) % heroBanners.length), 5000);
    return () => clearInterval(timer);
  }, [heroBanners.length]);

  // Gallery page carousel (3 images per page)
  const [galleryPage, setGalleryPage] = useState(0);
  const galleryPageCount = Math.ceil(galleryImages.length / 3);
  useEffect(() => {
    if (galleryPageCount <= 1) return;
    const timer = setInterval(() => setGalleryPage(p => (p + 1) % galleryPageCount), 4000);
    return () => clearInterval(timer);
  }, [galleryPageCount]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ═══ HERO BANNER CAROUSEL ═══ */}
      <section ref={heroRef} className="relative w-full overflow-hidden">
        {/* Fallback static banners when no API banners loaded */}
        {heroBanners.length === 0 ? (
          <Link to="/products" className="block relative w-full">
            {/* Desktop */}
            <img
              src="/images/hero-des.jpeg"
              alt="Ingri — Shop Now"
              className="hidden md:block w-full h-auto object-cover"
              loading="eager"
            />
            {/* Mobile */}
            <img
              src="/images/hero-mobile.png"
              alt="Ingri — Shop Now"
              className="md:hidden w-full h-auto object-cover"
              loading="eager"
            />
          </Link>
        ) : (
          <div className="relative w-full">
            {/* All slides stacked — first slide sets the height, rest are absolute */}
            {heroBanners.map((banner, idx) => {
              const isActive = idx === heroIndex;
              const content = (
                <>
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
                </>
              );
              const wrapper = (banner.linkEnabled && banner.link) ? (
                <Link to={banner.link} className="block w-full">{content}</Link>
              ) : (
                <div className="w-full">{content}</div>
              );
              return (
                <div
                  key={banner._id}
                  className={`w-full transition-opacity duration-700 ease-in-out ${
                    idx === 0 ? "relative" : "absolute inset-0"
                  } ${isActive ? "opacity-100 z-[1]" : "opacity-0 z-0"}`}
                  aria-hidden={!isActive}
                >
                  {wrapper}
                </div>
              );
            })}

            {/* Dots */}
            {heroBanners.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {heroBanners.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setHeroIndex(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={`rounded-full transition-all duration-300 ${
                      idx === heroIndex
                        ? "w-7 h-2.5 bg-white"
                        : "w-2.5 h-2.5 bg-white/50 hover:bg-white/70"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {bannerDeal && (
        <section className="bg-[#111827] text-white border-b border-black/10">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center gap-6">
            {bannerDeal.image && (
              <div className="w-full md:w-1/3 overflow-hidden border border-white/10 shadow-lg">
                <img
                  src={bannerDeal.image}
                  alt={bannerDeal.title}
                  className="w-full h-40 md:h-44 object-cover"
                  loading="lazy"
                />
              </div>
            )}
            <div className="flex-1">
              <p className="font-body text-[10px] tracking-[0.3em] text-[#7A9A9C] uppercase mb-2">
                Limited-time offer
              </p>
              <h2 className="font-heading text-xl md:text-2xl text-white font-bold mb-2">
                {bannerDeal.title}
              </h2>
              {bannerDeal.content && (
                <p className="font-body text-sm text-white/70 mb-4 max-w-xl">
                  {bannerDeal.content}
                </p>
              )}
              <div className="flex flex-wrap gap-3">
                <Link
                  to={bannerDeal.productId ? `/products/${bannerDeal.productId}` : "/products"}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1A4547] text-white font-body text-sm font-medium hover:bg-[#122E30] transition-colors"
                >
                  Shop this offer
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═══ OUR PHILOSOPHY ═══ */}
      <motion.section
        ref={philRef}
        initial="hidden" animate={philInView ? "visible" : "hidden"}
        variants={fadeUp}
        className="py-20 md:py-28"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              {/* Heading — visible on both, but on mobile sits above image */}
              <p className="font-body text-xs tracking-[0.25em] text-[#7A9A9C] uppercase mb-3">WHAT WE DO</p>
              <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-[#1A3C3E] font-bold leading-tight mb-5 md:mb-6">
                Ingri at a <span className="italic font-normal text-[#5E8A8C]">Glance</span>
              </h2>

              {/* Image — mobile only, shown between heading and description */}
              <div className="relative overflow-hidden rounded-lg shadow-lg mb-5 md:hidden">
                <img
                  src="/images/AMBIANCE/Screenshot 2026-02-13 193128.png"
                  alt="Ingri"
                  className="w-full h-[260px] object-cover"
                />
              </div>

              <p className="font-body text-[15px] text-[#555] leading-[1.8] mb-7">
                 Ingri is a chef-led food and hospitality brand built on ingredient-led cooking, disciplined systems, and scalable product innovation. From dining and café formats to clean-label RTE, RTU, frozen, and freeze-dried products, Ingri bridges culinary craft with modern food technology. Designed for consistency and quality, the brand serves home kitchens, hospitality partners, and commercial clients across B2C and B2B channels.
              </p>
              <Link to="/about" className="inline-flex items-center gap-2 px-6 py-3 border border-[#1A4547] text-[#1A4547] font-heading text-sm font-semibold hover:bg-[#1A4547] hover:text-white transition-all duration-200 rounded-sm">
                Discover Our Story <ArrowRight size={15} />
              </Link>
            </div>
            {/* Image — desktop only */}
            <div className="relative overflow-hidden rounded-lg shadow-lg hidden md:block">
              <img
                src="/images/AMBIANCE/Screenshot 2026-02-13 193128.png"
                alt="Ingri"
                className="w-full h-[400px] object-cover"
              />
            </div>
          </div>
        </div>
      </motion.section>

      {/* ═══ BEST SELLERS — Horizontal Scroll ═══ */}
      <section className="py-6 md:py-10 bg-[#EFF7F7]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="font-body text-xs tracking-[0.25em] text-[#1A4547] uppercase mb-2">OUR PRODUCTS</p>
              <h2 className="font-heading text-2xl md:text-3xl text-[#1a1a1a] font-bold">Best Sellers</h2>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <button onClick={() => { const el = document.getElementById('bestseller-scroll'); if (el) el.scrollBy({ left: -300, behavior: 'smooth' }); }}
                className="w-10 h-10 rounded-full border border-[#1A4547]/20 flex items-center justify-center text-[#1A4547] hover:bg-[#1A4547] hover:text-white transition-all duration-200">
                <ChevronLeft size={18} />
              </button>
              <button onClick={() => { const el = document.getElementById('bestseller-scroll'); if (el) el.scrollBy({ left: 300, behavior: 'smooth' }); }}
                className="w-10 h-10 rounded-full border border-[#1A4547]/20 flex items-center justify-center text-[#1A4547] hover:bg-[#1A4547] hover:text-white transition-all duration-200">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div id="bestseller-scroll" className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
          {shopProducts.map((p) => {
            const mrp = p.mrp || Math.round(p.price * 1.25);
            const sale = p.salePrice || p.price;
            const discount = mrp > sale ? Math.round(((mrp - sale) / mrp) * 100) : 0;
            return (
              <Link
                key={p._id}
                to={`/products/${p._id}`}
                className="shrink-0 w-[42vw] sm:w-[30vw] md:w-[22vw] lg:w-[17vw] snap-start group"
              >
                <div className="relative bg-white border border-gray-100 rounded-xl overflow-hidden aspect-square shadow-sm">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <div className="mt-3 space-y-1 px-0.5">
                  <h3 className="font-heading text-[13px] text-[#1a1a1a] font-semibold leading-snug line-clamp-1">{p.name}</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={10} className={i < Math.round(p.rating || 0) ? "text-[#F5A623] fill-[#F5A623]" : "text-gray-200 fill-gray-200"} />
                      ))}
                    </div>
                    <span className="font-body text-[10px] text-[#1a1a1a]/50">({p.reviews || 0})</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-heading text-sm font-bold text-[#1a1a1a]">₹{sale}</span>
                    {mrp > sale && (
                      <span className="font-body text-[11px] text-[#1a1a1a]/35 line-through">MRP ₹{mrp}</span>
                    )}
                  </div>
                    <button className="w-full mt-2 py-2 bg-[#1a1a1a] text-white font-heading text-[11px] font-semibold tracking-wide rounded-lg hover:bg-[#1A4547] transition-colors">
                    Add to cart
                  </button>
                </div>
              </Link>
            );
          })}
          </div>
        </div>
        <div className="text-center mt-8">
          <Link
            to="/products"
            className="inline-flex items-center gap-2.5 px-8 py-3.5 border border-[#1A4547] text-[#1A4547] font-heading text-sm font-semibold hover:bg-[#1A4547] hover:text-white transition-all duration-200 rounded-sm"
          >
            View All Products <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* ═══ B2B & RETAIL SERVICES ═══ */}
      <motion.section
        ref={b2bRef}
        initial="hidden" animate={b2bInView ? "visible" : "hidden"}
        variants={stagger}
        className="py-12 md:py-16 bg-white relative overflow-hidden"
      >
        {/* Decorative background shapes */}
        <div className="absolute top-0 right-0 w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full bg-[#1A4547]/[0.03] -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[200px] h-[200px] md:w-[350px] md:h-[350px] rounded-full bg-[#1A4547]/[0.03] translate-y-1/3 -translate-x-1/3" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8 md:mb-10">
            <p className="font-body text-xs tracking-[0.25em] text-[#7A9A9C] uppercase mb-3">PARTNERSHIPS</p>
            <h2 className="font-heading text-2xl md:text-3xl lg:text-4xl text-[#1A3C3E] font-bold leading-tight mb-3">
              Retail Services, Gifting, <span className="italic font-normal text-[#5E8A8C]">HORECA</span>
            </h2>
            <p className="font-body text-[15px] text-[#777] leading-relaxed max-w-2xl mx-auto">
              Professional-grade culinary solutions tailored for customers, businesses, and hospitality partners who value quality as much as we do.
            </p>
          </div>

          {/* Service cards — graphic tiles */}
          <div className="grid sm:grid-cols-3 gap-5 md:gap-8 mb-8">
            {b2bServices.map((svc, i) => (
              <motion.div
                key={svc.title}
                variants={childFade}
                className="relative bg-white rounded-2xl p-6 md:p-8 border border-[#D0E8E8] shadow-[0_2px_12px_rgba(35,90,93,0.04)] group hover:shadow-[0_8px_30px_rgba(35,90,93,0.08)] transition-shadow duration-300"
              >
                {/* Number accent */}
                <span className="absolute top-5 right-5 font-heading text-[48px] md:text-[56px] font-bold text-[#1A4547]/[0.05] leading-none select-none">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="w-12 h-12 rounded-xl bg-[#1A4547]/[0.07] flex items-center justify-center mb-5">
                  <svc.icon size={22} className="text-[#1A4547]" />
                </div>
                <h4 className="font-heading text-lg font-semibold text-[#1A3C3E] mb-2">{svc.title}</h4>
                <p className="font-body text-sm text-[#888] leading-relaxed">{svc.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link
              to="/b2b"
              className="inline-flex items-center gap-2.5 px-8 py-3.5 border border-[#1A4547] text-[#1A4547] font-heading text-sm font-semibold hover:bg-[#1A4547] hover:text-white transition-all duration-200 rounded-sm"
            >
              Inquire for Horeca <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </motion.section>


      {/* ═══ CONTACT US ═══ */}
      <motion.section
        ref={newsletterRef}
        initial="hidden" animate={newsletterInView ? "visible" : "hidden"}
        variants={fadeUp}
        className="relative py-14 sm:py-16 md:py-20 overflow-hidden"
      >
        {/* Background image with refined overlay */}
        <div className="absolute inset-0">
          <img
            src="/images/AMBIANCE/Screenshot 2026-02-13 192731.png"
            alt=""
            className="w-full h-full object-cover scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20" />
        </div>

        {/* Decorative elements */}
        <div className="absolute inset-0 pointer-events-none z-[1]">
          {/* Corner accents */}
          <div className="absolute top-8 left-8 sm:top-12 sm:left-12 w-16 h-16 sm:w-20 sm:h-20 border-t border-l border-white/[0.08]" />
          <div className="absolute bottom-8 right-8 sm:bottom-12 sm:right-12 w-16 h-16 sm:w-20 sm:h-20 border-b border-r border-white/[0.08]" />
          {/* Subtle ring */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] sm:w-[400px] sm:h-[400px] md:w-[500px] md:h-[500px] rounded-full border border-white/[0.04]" />
        </div>

        <div className="relative z-10 text-center max-w-2xl mx-auto px-6">
          {/* Decorative line above label */}
          <div className="w-8 h-px bg-white/20 mx-auto mb-5" />
          <p className="font-body text-[10px] sm:text-[11px] tracking-[0.3em] text-white/40 uppercase mb-5">Let's Connect</p>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl text-white font-bold mb-5 leading-[1.15]">
            We'd Love to <span className="italic font-normal text-white/70">Hear</span><br className="hidden sm:block" /> From You
          </h2>
          <div className="w-10 h-px bg-white/15 mx-auto mb-6" />
          <p className="font-body text-[14px] sm:text-[15px] text-white/50 mb-10 max-w-md mx-auto leading-[1.8]">
            Have a question, feedback, or want to collaborate? Reach out and let's create something together.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-white text-[#1A3C3E] font-heading text-sm font-semibold hover:bg-white/90 transition-all duration-300 shadow-[0_4px_24px_rgba(0,0,0,0.25)] rounded-xl"
            >
              Get In Touch <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </motion.section>

      <Footer />
    </div>
  );
}
