import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OptimizedImage from "@/components/OptimizedImage";
import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect, useCallback } from "react";

function useCountUp(end: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  const hasRun = useRef(false);
  const tick = useCallback(() => {
    if (!start || hasRun.current) return;
    hasRun.current = true;
    const startTime = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration, start]);
  useEffect(() => { tick(); }, [tick]);
  return count;
}

const leaders = [
  {
    name: "Chef Sunil Chauhan",
    role: "FOUNDER",
    image: "/images/FOUNDERS/chef.png",
    bio: "A graduate of IHM Pusa with over three decades of culinary leadership. Renowned for uniting tradition with disciplined innovation, he builds concepts rooted in precision and scalability.",
    achievements: "His work reflects a rare balance of craft, structure, and enduring standards.",
  },
  {
    name: "Ilisha Chauhan",
    role: "CO-FOUNDER",
    image: "/images/FOUNDERS/Ilisha Chauhan.png",
    bio: "As Co-Founder Ilisha shapes the brand's operational backbone and creative direction. Educated at Queen Mary University of London, she integrates strategic thinking with an instinctive understanding of craft and experience.",
    achievements: "Her approach ensures Ingri grows with both precision and purpose.",
  },
];

const stats = [
  { value: 120, suffix: "k+", label: "Customers Served" },
  { value: 2019, suffix: "", label: "Year Founded" },
  { value: 50, suffix: "+", label: "Menu Items" },
  { value: 20, suffix: "+", label: "Horeca Partners" },
  { value: 3, suffix: "", label: "Locations" },
];

function CountUpStats() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const c0 = useCountUp(stats[0].value, 2000, inView);
  const c1 = useCountUp(stats[1].value, 2000, inView);
  const c2 = useCountUp(stats[2].value, 1500, inView);
  const c3 = useCountUp(stats[3].value, 1500, inView);
  const c4 = useCountUp(stats[4].value, 1000, inView);
  const counts = [c0, c1, c2, c3, c4];

  return (
    <div ref={ref} className="flex flex-wrap justify-center">
      {stats.map((stat, i) => (
        <div key={stat.label} className="w-1/2 sm:w-1/3 lg:w-1/5 py-8 text-center">
          <div className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-[#1A4547] mb-3">
            {inView ? counts[i].toLocaleString() : "0"}{stat.suffix}
          </div>
          <div className="w-6 h-px bg-[#1A4547]/15 mx-auto mb-3" />
          <p className="font-body text-[11px] sm:text-xs tracking-[0.15em] text-[#7A9A9C] uppercase">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}

export default function AboutPage() {
  const storyRef = useRef(null);
  const teamRef = useRef(null);
  const storyInView = useInView(storyRef, { once: true, margin: "-80px" });
  const teamInView = useInView(teamRef, { once: true, margin: "-80px" });

  return (
    <div className="min-h-screen bg-[#FFFFFF]">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-16 pb-14 sm:pt-20 sm:pb-18 md:pt-28 md:pb-24 overflow-hidden bg-[#F5FAFA]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 right-[10%] w-64 h-64 rounded-full bg-[#1A4547]/[0.03]" />
          <div className="absolute bottom-10 left-[5%] w-48 h-48 rounded-full bg-[#1A4547]/[0.04]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#1A4547]/[0.02]" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-body text-xs tracking-[0.25em] text-[#7A9A9C] uppercase mb-4"
          >
            OUR STORY
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="font-heading text-4xl sm:text-5xl md:text-6xl text-[#1A3C3E] font-bold leading-tight mb-5"
          >
            Good <span className="italic font-normal text-[#5E8A8C]">INGRI-dients.</span>
            <br />
            Good Food
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="font-body text-[15px] md:text-base text-[#555] leading-[1.8] max-w-2xl mx-auto"
          >
            Ingri is a contemporary food brand grounded in ingredient-led cooking and precise execution. Every format we build reflects the same commitment to quality, structure, and experience.
          </motion.p>
        </div>
      </section>

      {/* Our Values - Crafted with Intention */}
      <section ref={storyRef} className="relative py-12 sm:py-16 lg:py-24 overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mobile: heading → image → text | Desktop: side by side */}
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={storyInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7 }}
              className="lg:order-1"
            >
              <p className="font-body text-xs tracking-[0.25em] text-[#7A9A9C] uppercase mb-4">OUR VALUES</p>
              <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-[#1A3C3E] font-bold mb-6 leading-tight">
                Crafted with <span className="italic font-normal text-[#5E8A8C]">Intention</span>
              </h2>
              {/* Image — shown here on mobile only */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={storyInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="rounded-2xl overflow-hidden border border-[#1A4547]/10 mb-6 lg:hidden"
              >
                <OptimizedImage
                  src="/images/FOOD/Screenshot 2026-02-13 193225.png"
                  alt="INGRI Food"
                  className="w-full h-auto"
                  loading="lazy"
                />
              </motion.div>
              <div className="space-y-5">
                <p className="font-body text-[15px] text-[#555] leading-[1.8]">
                  ingri was shaped by the belief that true quality lies in the unseen details. Behind every product and format is a backbone of systems, sourcing standards, and deliberate execution. As the brand grows, that foundation remains constant — ensuring that every extension of ingri carries the same integrity and measured refinement.
                </p>
              </div>
            </motion.div>
            {/* Image — desktop only */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={storyInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="rounded-2xl overflow-hidden border border-[#1A4547]/10 hidden lg:block lg:order-2"
            >
              <OptimizedImage
                src="/images/FOOD/Screenshot 2026-02-13 193225.png"
                alt="INGRI Food"
                className="w-full h-[500px] object-cover"
                loading="lazy"
                width={600}
                height={500}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* What We Do - Our Expertise */}
      <section className="relative py-12 sm:py-16 lg:py-24 overflow-hidden" style={{ background: "#F8F8F8" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
            {/* Image — desktop only, left side */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
              className="rounded-2xl overflow-hidden border border-[#1A4547]/10 hidden lg:block lg:order-1"
            >
              <OptimizedImage
                src="/images/AMBIANCE/Screenshot 2026-02-13 192909.png"
                alt="Our Expertise"
                className="w-full h-[500px] object-cover"
                loading="lazy"
                width={600}
                height={500}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="lg:order-2"
            >
              <p className="font-body text-xs tracking-[0.3em] text-[#888] uppercase mb-4">OUR EXPERTISE</p>
              <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-[#1A3C3E] font-bold mb-6 leading-tight">
                What We <span className="italic font-normal text-[#5E8A8C]">Do</span>
              </h2>
              {/* Image — mobile only, between heading and text */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="rounded-2xl overflow-hidden border border-[#1A4547]/10 mb-6 lg:hidden"
              >
                <OptimizedImage
                  src="/images/AMBIANCE/Screenshot 2026-02-13 192909.png"
                  alt="Our Expertise"
                  className="w-full h-auto"
                  loading="lazy"
                />
              </motion.div>
              <div className="space-y-5">
                <p className="font-body text-[15px] text-[#555] leading-[1.8]">
                  At Ingri, we develop ingredient-led food solutions designed for both home kitchens and professional environments. From ready-to-eat and ready-to-use products to frozen, freeze-dried, and specialty formats, our focus is on delivering consistent quality through chef-led processes and clean-label ingredients.
                </p>
                <p className="font-body text-[15px] text-[#555] leading-[1.8]">
                  Serving home cooks, restaurants, and hospitality partners, Ingri combines culinary expertise with modern food systems to create products that balance convenience, flavour, and reliability.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Philosophy Quote */}
      <section className="relative py-12 sm:py-16 lg:py-20 bg-white overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-6xl text-[#1A4547]/20 mb-6">&ldquo;</div>
            <p className="font-heading text-2xl md:text-3xl lg:text-4xl text-[#1A3C3E] font-medium italic leading-relaxed mb-4">
              We don&apos;t just create dishes; we create standards.
            </p>
            <p className="font-heading text-xl md:text-2xl lg:text-3xl text-[#1A3C3E] font-medium italic leading-relaxed mb-4">
              What we build is designed to last.
            </p>
            <p className="font-heading text-xl md:text-2xl lg:text-3xl text-[#1A3C3E] font-medium italic leading-relaxed mb-8">
              In flavour, in systems, and in experience.
            </p>
            <div className="w-16 h-px bg-[#1A4547] mx-auto mb-4" />
            <p className="font-body text-sm tracking-[0.2em] text-[#888] uppercase">
              THE INGRI PHILOSOPHY
            </p>
          </motion.div>
        </div>
      </section>

      {/* Meet the Founders */}
      <section ref={teamRef} className="relative py-16 sm:py-20 lg:py-28 overflow-hidden bg-[#F5FAFA]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={teamInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16 sm:mb-20 lg:mb-24"
          >
            <p className="font-body text-xs tracking-[0.25em] text-[#7A9A9C] uppercase mb-4">THE VISIONARIES</p>
            <h3 className="font-heading text-3xl md:text-4xl text-[#1A3C3E] font-bold mb-6">
              Meet the <span className="italic font-normal text-[#5E8A8C]">Founders</span>
            </h3>
            <div className="w-12 h-px bg-[#1A4547]/20 mx-auto mb-6" />
            <p className="font-body text-[15px] text-[#555] leading-[1.8] max-w-2xl mx-auto">
              Two minds united by a singular vision: to redefine culinary excellence through precision, authenticity, and unwavering standards.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-10 lg:gap-14">
            {leaders.map((l, i) => (
              <motion.div
                key={l.name}
                initial={{ opacity: 0, y: 40 }}
                animate={teamInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.2 + i * 0.15 }}
                className="bg-white rounded-2xl p-6 sm:p-8 flex flex-col items-center text-center shadow-[0_4px_24px_rgba(35,90,93,0.06)] border border-[#1A4547]/[0.06]"
              >
                <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full overflow-hidden mb-6 ring-[3px] ring-[#1A4547]/[0.08] ring-offset-4 ring-offset-white">
                  <img src={l.image} alt={l.name} className="w-full h-full object-cover" />
                </div>
                <p className="font-body text-[10px] tracking-[0.3em] text-[#7A9A9C] uppercase mb-1.5">{l.role}</p>
                <h4 className="font-heading text-xl sm:text-2xl text-[#1A3C3E] font-bold mb-4">{l.name}</h4>
                <p className="font-body text-[14px] text-[#555] leading-[1.8] mb-4">{l.bio}</p>
                {l.achievements && (
                  <p className="font-body text-[13px] text-[#5E8A8C] italic leading-relaxed mt-auto pt-4 border-t border-[#1A4547]/[0.06] w-full">{l.achievements}</p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* A Glimpse into the Company */}
      <section className="relative py-12 sm:py-16 lg:py-24 overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10 sm:mb-16"
          >
            <p className="font-body text-xs tracking-[0.25em] text-[#7A9A9C] uppercase mb-3 sm:mb-4">THE COMPANY</p>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl text-[#1a1a1a] font-bold mb-6">A Glimpse into the Company</h2>
            <p className="font-body text-[#666] max-w-4xl mx-auto leading-relaxed text-base md:text-lg">
              Founded with the ambition to create a world-class food enterprise that prioritizes accountability, honesty, and quality, ingri was born from the recognition that discerning customers seek high-quality, origin-focused products that bring them joy. Our vision is to cultivate a transparent organization driven by its people, where individuals can truly be themselves and excel.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6, delay: 0.1 }} className="bg-[#F8F8F8] p-6 rounded-xl text-center">
              <div className="text-4xl mb-3">☕</div>
              <h3 className="font-heading text-lg text-[#1a1a1a] font-bold mb-2">Museo Camera Cafe</h3>
              <p className="font-body text-[#666] text-sm leading-relaxed">Our flagship location within the prestigious photography museum</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6, delay: 0.3 }} className="bg-[#F8F8F8] p-6 rounded-xl text-center">
              <div className="text-4xl mb-3">🏪</div>
              <h3 className="font-heading text-lg text-[#1a1a1a] font-bold mb-2">Retail Products</h3>
              <p className="font-body text-[#666] text-sm leading-relaxed">Bringing ingri quality to your home with curated retail offerings</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6, delay: 0.4 }} className="bg-[#F8F8F8] p-6 rounded-xl text-center">
              <div className="text-4xl mb-3">🤝</div>
              <h3 className="font-heading text-lg text-[#1a1a1a] font-bold mb-2">Horeca Partnerships</h3>
              <p className="font-body text-[#666] text-sm leading-relaxed">Collaborating with hotels, restaurants, and corporate clients</p>
            </motion.div>
          </div>
          
        </div>
      </section>

      {/* Numbers */}
      <section className="relative py-16 sm:py-20 lg:py-28 overflow-hidden bg-[#F5FAFA]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-16"
          >
            <p className="font-body text-xs tracking-[0.25em] text-[#7A9A9C] uppercase mb-4">BY THE NUMBERS</p>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl text-[#1A3C3E] font-bold">
              Built on <span className="italic font-normal text-[#5E8A8C]">Consistency</span>
            </h2>
          </motion.div>
          <CountUpStats />
        </div>
      </section>

      <Footer />
    </div>
  );
}
