import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, Building2, Truck,
  Gift, Handshake, Package, Globe, Mail,
  RefreshCw, Users, Clock, TrendingUp
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OptimizedImage from "@/components/OptimizedImage";

const services = [
  { icon: Building2, title: "Ready To Use", desc: "Premium gravies, bases, pastes, and marinades for restaurants and cloud kitchens. Just heat, plate, and serve.", tags: ["Gravies & Bases", "Bulk Packs"] },
  { icon: Package, title: "Ready To Eat", desc: "Chef-crafted meals ready to reheat. Perfect for corporate canteens, airlines, and retail shelves.", tags: ["Cold Chain", "Zero Preservatives"] },
  { icon: Handshake, title: "Restaurant Partnerships", desc: "White-label our signature recipes for your menu. Keep your brand, serve Ingri quality.", tags: ["White Label", "Staff Training"] },
  { icon: Gift, title: "Corporate Gifting", desc: "Premium hampers featuring artisan gravies, spice blends, and gourmet condiments with custom branding.", tags: ["Custom Branding", "Festival Collections"] },
];

const partnerLogos = [
  { src: "/images/Logos/1200x630wa.png", alt: "Partner logo" },
  { src: "/images/Logos/7-eleven_logo.svg.png", alt: "7-Eleven logo" },
  { src: "/images/Logos/aa378ed3-3b9e-4761-9afc-1105c21532c9.webp", alt: "Partner brand logo" },
  { src: "/images/Logos/amazon-logo-2000.webp", alt: "Amazon logo" },
  { src: "/images/Logos/Bigbasket_Logo.png", alt: "BigBasket logo" },
  { src: "/images/Logos/Blinkit-yellow-rounded.svg", alt: "Blinkit logo" },
  { src: "/images/Logos/fabindiaFoods.webp", alt: "Fabindia Foods logo" },
  { src: "/images/Logos/Flipkart-Logo.wine.png", alt: "Flipkart logo" },
  { src: "/images/Logos/logo.jpg", alt: "Partner store logo" },
  { src: "/images/Logos/thumbnail_Store-logo.jpg", alt: "Store logo" },
  { src: "/images/Logos/Zepto-Featured-Image-Option-2.png", alt: "Zepto logo" },
];

export default function B2BPage() {
  const servicesRef = useRef(null);
  const servicesInView = useInView(servicesRef, { once: true, margin: "-80px" });

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ═══ Hero ═══ */}
      <section className="relative pt-10 pb-8 sm:pt-14 sm:pb-10 md:pt-20 md:pb-14 overflow-hidden bg-[#F5FAFA]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 right-[10%] w-64 h-64 rounded-full bg-[#1A4547]/[0.03]" />
          <div className="absolute bottom-10 left-[5%] w-48 h-48 rounded-full bg-[#1A4547]/[0.04]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#1A4547]/[0.02]" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <p className="font-body text-xs tracking-[0.25em] text-[#7A9A9C] uppercase mb-4">OUR SERVICES</p>
              <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl text-[#1A3C3E] font-bold leading-tight mb-5">
                Horeca & Wholesale <br />
                <span className="italic font-normal text-[#5E8A8C]">Solutions</span>
              </h1>

              {/* Image — mobile only, between heading and text */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
                className="rounded-2xl overflow-hidden border border-[#1A4547]/10 mb-6 lg:hidden">
                <OptimizedImage src="/images/AMBIANCE/Screenshot 2026-02-13 193045.png" alt="Horeca solutions"
                  className="w-full h-auto" loading="eager" />
              </motion.div>

              <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}
                className="font-body text-[15px] md:text-base text-[#555] leading-[1.8] max-w-lg mb-8">
                Professional-grade bulk packs tailored for restaurants, cloud kitchens, and catering partners. Precision, efficiency, and consistent flavour at scale.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.5 }}
                className="flex flex-wrap gap-3">
                <a href="mailto:b2b@ingri.world"
                  className="inline-flex items-center gap-2 bg-[#1A4547] text-white font-body text-sm font-semibold tracking-wide px-7 py-3.5 rounded-xl hover:bg-[#4A2E17] transition-all shadow-sm">
                  <Mail size={16} /> Partner With Us
                </a>
                <Link to="/products?isB2B=true"
                  className="inline-flex items-center gap-2 border border-[#1A4547]/20 text-[#1A4547] font-body text-sm font-medium tracking-wide px-7 py-3.5 rounded-xl hover:bg-[#1A4547]/[0.04] transition-all">
                  View Catalogue <ArrowRight size={15} />
                </Link>
              </motion.div>
            </motion.div>

            {/* Image — desktop only */}
            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.9, delay: 0.3 }}
              className="rounded-2xl overflow-hidden border border-[#1A4547]/10 hidden lg:block">
              <OptimizedImage src="/images/AMBIANCE/Screenshot 2026-02-13 193045.png" alt="Horeca solutions"
                className="w-full h-[380px] object-cover" loading="eager" priority={true} width={700} height={380} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ Services ═══ */}
      <section ref={servicesRef} className="relative py-12 sm:py-16 lg:py-24 overflow-hidden bg-white">
        {/* Top separator shape */}
        <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0]">
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-8 sm:h-12">
            <path d="M0,60 C360,0 1080,0 1440,60 L1440,0 L0,0 Z" fill="#F5FAFA" />
          </svg>
        </div>
        {/* Bottom separator shape */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] rotate-180">
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-8 sm:h-12">
            <path d="M0,60 C360,0 1080,0 1440,60 L1440,0 L0,0 Z" fill="#F5FAFA" />
          </svg>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={servicesInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}
            className="text-center mb-10 sm:mb-14">
            <p className="font-body text-xs tracking-[0.25em] text-[#7A9A9C] uppercase mb-4">WHAT WE OFFER</p>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl text-[#1A3C3E] font-bold">
              Our <span className="italic font-normal text-[#5E8A8C]">Services</span>
            </h2>
            <div className="w-12 h-px bg-[#1A4547]/20 mx-auto mt-5" />
          </motion.div>

          <div className="lg:grid lg:grid-cols-2 lg:gap-x-10 lg:gap-y-0">
            {services.map((s, i) => (
              <motion.div key={s.title} initial={{ opacity: 0, y: 20 }} animate={servicesInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.08 }}
                className="group flex gap-5 py-7 sm:py-8 border-b border-[#1A4547]/[0.08] last:border-b-0 lg:[&:nth-last-child(2)]:border-b-0">
                <div className="shrink-0">
                  <div className="w-12 h-12 rounded-2xl bg-[#F5FAFA] border border-[#1A4547]/15 flex items-center justify-center shadow-[0_2px_12px_rgba(35,90,93,0.06)] group-hover:shadow-[0_4px_20px_rgba(35,90,93,0.1)] transition-shadow">
                    <s.icon size={22} className="text-[#1A4547]" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading text-lg text-[#1A3C3E] font-bold mb-1.5">{s.title}</h3>
                  <p className="font-body text-[14px] text-[#555] leading-[1.8] mb-3">{s.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {s.tags.map(t => (
                      <span key={t} className="font-body text-[11px] tracking-wide text-[#1A4547] bg-[#1A4547]/[0.04] border border-[#1A4547]/[0.08] px-3 py-1 rounded-full">{t}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Why INGRI ═══ */}
      <section className="py-12 sm:py-16 lg:py-24 bg-[#F5FAFA] overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.7 }}>
              <p className="font-body text-xs tracking-[0.25em] text-[#7A9A9C] uppercase mb-4">SETTING THE STANDARD</p>
              <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-[#1A3C3E] font-bold mb-6 leading-tight">
                Why <span className="italic font-normal text-[#5E8A8C]">Ingri</span>
              </h2>

              {/* Image — mobile only */}
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.6, delay: 0.1 }}
                className="rounded-2xl overflow-hidden border border-[#1A4547]/10 mb-6 lg:hidden">
                <OptimizedImage src="/images/FOOD/Screenshot 2026-02-13 193211.png" alt="Ingri quality"
                  className="w-full h-auto" loading="lazy" />
              </motion.div>

              <div className="space-y-6">
                {[
                  { icon: RefreshCw, title: "More Output Consistency", desc: "Standardised recipes and processes ensure every batch tastes exactly the same, every single time." },
                  { icon: Users, title: "Less Reliance on Skilled Labour", desc: "Our ready-to-use products simplify kitchen operations — no need for specialised chefs." },
                  { icon: Clock, title: "Lesser Prep Time", desc: "Cut hours of prep down to minutes. Just heat, plate, and serve restaurant-quality dishes." },
                  { icon: TrendingUp, title: "Higher Profit Margin", desc: "Lower food waste, reduced labour costs, and consistent portioning drive better margins." },
                ].map((item, i) => (
                  <motion.div key={item.title} initial={{ opacity: 0, x: -15 }} whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }} transition={{ delay: 0.1 + i * 0.08, duration: 0.4 }}
                    className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#1A4547]/[0.06] flex items-center justify-center shrink-0 mt-0.5">
                      <item.icon size={18} className="text-[#1A4547]" />
                    </div>
                    <div>
                      <h3 className="font-heading text-[15px] font-bold text-[#1A3C3E] mb-1">{item.title}</h3>
                      <p className="font-body text-[13px] text-[#555] leading-[1.8]">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Image — desktop only */}
            <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.8, delay: 0.15 }}
              className="rounded-2xl overflow-hidden border border-[#1A4547]/10 hidden lg:block">
              <OptimizedImage src="/images/FOOD/Screenshot 2026-02-13 193211.png" alt="Ingri quality"
                className="w-full h-[520px] object-cover" loading="lazy" width={600} height={520} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ Partnerships ═══ */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white border-y border-[#1A4547]/[0.06]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6 }}
            className="text-center mb-6 sm:mb-8">
            <p className="font-body text-xs tracking-[0.25em] text-[#7A9A9C] uppercase mb-3">COLLABORATIONS</p>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl text-[#1A3C3E] font-bold leading-tight">
              Our <span className="italic font-normal text-[#5E8A8C]">Partnerships</span>
            </h2>
            <p className="font-body text-[13px] sm:text-[14px] text-[#666] leading-[1.7] max-w-2xl mx-auto mt-2 sm:mt-3 px-2 sm:px-0">
              A full-network view of the brands, retailers, and horeca partners that move with Ingri across formats and cities.
            </p>
            <div className="w-12 h-px bg-[#1A4547]/20 mx-auto mt-4" />
          </motion.div>

          <div className="grid gap-3 sm:grid-cols-3 sm:gap-4 mb-8">
            {[
              { icon: Handshake, title: "HoReCa Partners", desc: "Hotels, restaurants, and cafés trust Ingri for consistent, chef-grade products.", stat: "150+", statLabel: "Active Partners" },
              { icon: Building2, title: "Corporate Tie-ups", desc: "Long-term partnerships with corporates for catering and gifting solutions.", stat: "12+", statLabel: "Cities Served" },
              { icon: Globe, title: "Nationwide Reach", desc: "Expanding our partner network across major cities in India.", stat: "50K+", statLabel: "Units Monthly" },
            ].map((p, i) => (
              <motion.div key={p.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.12, duration: 0.5 }}
                className="rounded-2xl border border-[#1A4547]/10 bg-[#F5FAFA] px-4 py-3 text-center shadow-[0_8px_20px_rgba(35,90,93,0.06)] sm:px-4 sm:py-3.5">
                <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center mx-auto mb-2 shadow-[0_2px_8px_rgba(35,90,93,0.06)]">
                  <p.icon size={15} className="text-[#1A4547]" />
                </div>
                <h3 className="font-heading text-[14px] sm:text-[15px] font-bold text-[#1A3C3E] mb-1">{p.title}</h3>
                <p className="font-body text-[11px] sm:text-[12px] text-[#555] leading-[1.5] mb-2">{p.desc}</p>
                <div className="pt-2 border-t border-[#1A4547]/[0.06]">
                  <span className="font-heading text-lg sm:text-xl font-bold text-[#1A4547]">{p.stat}</span>
                  <p className="font-body text-[10px] tracking-[0.1em] text-[#7A9A9C] uppercase mt-0.5">{p.statLabel}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* ── Logo marquee ── */}
          <div className="relative mt-14 sm:mt-16 lg:mt-20">
            <div className="overflow-hidden w-full">
              <div className="product-scroll-track flex w-max items-center gap-10 sm:gap-12 lg:gap-16 pr-10 sm:pr-12 lg:pr-16">
                {[...partnerLogos, ...partnerLogos].map((logo, index) => (
                  <div
                    key={`${logo.src}-${index}`}
                    className="shrink-0 flex items-center justify-center"
                  >
                    <img
                      src={logo.src}
                      alt={logo.alt}
                      loading="lazy"
                      className="max-h-14 sm:max-h-16 md:max-h-[72px] w-auto max-w-[140px] sm:max-w-[170px] md:max-w-[200px] object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
