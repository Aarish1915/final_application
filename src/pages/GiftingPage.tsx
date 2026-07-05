import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Gift, Heart, Package, Star, Sparkles, Mail, CheckCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OptimizedImage from "@/components/OptimizedImage";

const giftCategories = [
  { icon: Gift, title: "Corporate Gifting", desc: "Premium hampers designed for lasting professional impressions. Custom branding available for bulk orders.", tags: ["Custom Branding", "Bulk Orders"] },
  { icon: Heart, title: "Personal Occasions", desc: "Celebrate birthdays, anniversaries, and festivals with curated flavors that speak from the heart.", tags: ["Festivals", "Celebrations"] },
  { icon: Package, title: "Custom Hampers", desc: "Build your own gift box with our range of artisanal gravies, spice blends, and gourmet products.", tags: ["Build Your Own", "Artisanal"] },
  { icon: Sparkles, title: "Festive Collections", desc: "Seasonal limited-edition hampers crafted for Diwali, Christmas, Eid, and every celebration in between.", tags: ["Limited Edition", "Seasonal"] },
];

const highlights = [
  { stat: "500+", label: "Hampers Delivered", desc: "Across corporate and personal gifting" },
  { stat: "50+", label: "Corporate Partners", desc: "Trusted by leading companies" },
  { stat: "100%", label: "Handcrafted", desc: "Every hamper assembled with care" },
];

export default function GiftingPage() {
  const categoriesRef = useRef(null);
  const highlightsRef = useRef(null);
  const categoriesInView = useInView(categoriesRef, { once: true, margin: "-80px" });
  const highlightsInView = useInView(highlightsRef, { once: true, margin: "-80px" });

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
              <p className="font-body text-xs tracking-[0.25em] text-[#7A9A9C] uppercase mb-4">GIFTING</p>
              <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl text-[#1A3C3E] font-bold leading-tight mb-5">
                Curated Gift <span className="italic font-normal text-[#5E8A8C]">Hampers</span>
              </h1>

              {/* Image — mobile only */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
                className="rounded-2xl overflow-hidden border border-[#1A4547]/10 mb-6 lg:hidden">
                <OptimizedImage src="/images/FOOD/Screenshot 2026-02-13 193512.png" alt="Curated gift hampers"
                  className="w-full h-auto" loading="eager" />
              </motion.div>

              <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}
                className="font-body text-[15px] md:text-base text-[#555] leading-[1.8] max-w-lg mb-8">
                Thoughtfully crafted gift collections featuring our finest ready-to-eat meals and artisanal spice blends — perfect for every occasion.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.5 }}
                className="flex flex-wrap gap-3">
                <Link to="/products?isGift=true"
                  className="inline-flex items-center gap-2 bg-[#1A4547] text-white font-body text-sm font-semibold tracking-wide px-7 py-3.5 rounded-xl hover:bg-[#4A2E17] transition-all shadow-sm">
                  Explore Gifts <ArrowRight size={15} />
                </Link>
                <Link to="/contact"
                  className="inline-flex items-center gap-2 border border-[#1A4547]/20 text-[#1A4547] font-body text-sm font-medium tracking-wide px-7 py-3.5 rounded-xl hover:bg-[#1A4547]/[0.04] transition-all">
                  <Mail size={16} /> Custom Orders
                </Link>
              </motion.div>
            </motion.div>

            {/* Image — desktop only */}
            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.9, delay: 0.3 }}
              className="rounded-2xl overflow-hidden border border-[#1A4547]/10 hidden lg:block">
              <OptimizedImage src="/images/FOOD/Screenshot 2026-02-13 193512.png" alt="Curated gift hampers"
                className="w-full h-[380px] object-cover" loading="eager" priority={true} width={700} height={380} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ Gift Categories ═══ */}
      <section ref={categoriesRef} className="relative py-12 sm:py-16 lg:py-24 overflow-hidden bg-white">
        <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0]">
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-8 sm:h-12">
            <path d="M0,60 C360,0 1080,0 1440,60 L1440,0 L0,0 Z" fill="#F5FAFA" />
          </svg>
        </div>
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] rotate-180">
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-8 sm:h-12">
            <path d="M0,60 C360,0 1080,0 1440,60 L1440,0 L0,0 Z" fill="#F5FAFA" />
          </svg>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={categoriesInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}
            className="text-center mb-10 sm:mb-14">
            <p className="font-body text-xs tracking-[0.25em] text-[#7A9A9C] uppercase mb-4">WHAT WE OFFER</p>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl text-[#1A3C3E] font-bold">
              Gifting <span className="italic font-normal text-[#5E8A8C]">Options</span>
            </h2>
            <div className="w-12 h-px bg-[#1A4547]/20 mx-auto mt-5" />
          </motion.div>

          <div className="lg:grid lg:grid-cols-2 lg:gap-x-10 lg:gap-y-0">
            {giftCategories.map((s, i) => (
              <motion.div key={s.title} initial={{ opacity: 0, y: 20 }} animate={categoriesInView ? { opacity: 1, y: 0 } : {}}
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

      {/* ═══ Highlights ═══ */}
      <section ref={highlightsRef} className="py-12 sm:py-16 lg:py-20 bg-[#F5FAFA]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={highlightsInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}
            className="text-center mb-10 sm:mb-14">
            <p className="font-body text-xs tracking-[0.25em] text-[#7A9A9C] uppercase mb-4">BY THE NUMBERS</p>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl text-[#1A3C3E] font-bold">
              Gifting at <span className="italic font-normal text-[#5E8A8C]">Scale</span>
            </h2>
            <div className="w-12 h-px bg-[#1A4547]/20 mx-auto mt-5" />
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-6">
            {highlights.map((h, i) => (
              <motion.div key={h.label} initial={{ opacity: 0, y: 20 }} animate={highlightsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.12, duration: 0.5 }}
                className="rounded-2xl border border-[#1A4547]/10 bg-white px-6 py-6 text-center shadow-[0_8px_20px_rgba(35,90,93,0.06)]">
                <span className="font-heading text-3xl sm:text-4xl font-bold text-[#1A4547]">{h.stat}</span>
                <h3 className="font-heading text-[15px] font-bold text-[#1A3C3E] mt-2 mb-1">{h.label}</h3>
                <p className="font-body text-[12px] text-[#555] leading-[1.6]">{h.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ How It Works ═══ */}
      <section className="py-12 sm:py-16 lg:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.7 }}>
              <p className="font-body text-xs tracking-[0.25em] text-[#7A9A9C] uppercase mb-4">HOW IT WORKS</p>
              <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-[#1A3C3E] font-bold mb-6 leading-tight">
                Simple Steps to the <span className="italic font-normal text-[#5E8A8C]">Perfect</span> Gift
              </h2>

              {/* Image — mobile only */}
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.6, delay: 0.1 }}
                className="rounded-2xl overflow-hidden border border-[#1A4547]/10 mb-6 lg:hidden">
                <OptimizedImage src="/images/FOOD/Screenshot 2026-02-13 193500.png" alt="Gift hamper process"
                  className="w-full h-auto" loading="lazy" />
              </motion.div>

              <div className="space-y-6">
                {[
                  { step: "01", title: "Choose Your Hamper", desc: "Browse our curated collections or tell us your budget and preferences." },
                  { step: "02", title: "Personalise It", desc: "Add a custom message, choose packaging, and select your products." },
                  { step: "03", title: "We Deliver", desc: "Beautifully packaged and delivered to your doorstep or directly to the recipient." },
                ].map((item, i) => (
                  <motion.div key={item.step} initial={{ opacity: 0, x: -15 }} whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }} transition={{ delay: 0.1 + i * 0.08, duration: 0.4 }}
                    className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#1A4547]/[0.06] flex items-center justify-center shrink-0 mt-0.5">
                      <span className="font-heading text-sm font-bold text-[#1A4547]">{item.step}</span>
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
              <OptimizedImage src="/images/FOOD/Screenshot 2026-02-13 193500.png" alt="Gift hamper process"
                className="w-full h-[520px] object-cover" loading="lazy" width={600} height={520} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="relative py-14 sm:py-16 lg:py-20 overflow-hidden">
        <div className="absolute inset-0">
          <img src="/images/AMBIANCE/Screenshot 2026-02-13 193054.png" alt="" className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20" />
        </div>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-8 left-8 sm:top-12 sm:left-12 w-16 h-16 sm:w-20 sm:h-20 border-t border-l border-white/[0.08]" />
          <div className="absolute bottom-8 right-8 sm:bottom-12 sm:right-12 w-16 h-16 sm:w-20 sm:h-20 border-b border-r border-white/[0.08]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] sm:w-[400px] sm:h-[400px] rounded-full border border-white/[0.04]" />
        </div>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6 }}>
            <div className="w-8 h-px bg-white/20 mx-auto mb-5" />
            <p className="font-body text-xs tracking-[0.25em] text-white/40 uppercase mb-4">GET STARTED</p>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl text-white font-bold mb-5">
              Ready to Send Something <span className="italic font-normal text-white/70">Special?</span>
            </h2>
            <div className="w-12 h-px bg-white/15 mx-auto mb-6" />
            <p className="font-body text-[15px] text-white/60 leading-[1.8] max-w-xl mx-auto mb-10">
              Whether it's a single hamper or a thousand, we'll help you create the perfect gift. Reach out and let's make it happen.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/products?isGift=true"
                className="inline-flex items-center gap-2 bg-white text-[#1A3C3E] font-body text-sm font-semibold tracking-wide px-8 py-3.5 rounded-xl hover:bg-white/90 transition-all shadow-lg">
                <Gift size={16} /> Browse Hampers <ArrowRight size={15} />
              </Link>
              <Link to="/contact"
                className="inline-flex items-center gap-2 border border-white/20 text-white font-body text-sm font-medium tracking-wide px-8 py-3.5 rounded-xl hover:bg-white/10 transition-all">
                <Mail size={16} /> Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
