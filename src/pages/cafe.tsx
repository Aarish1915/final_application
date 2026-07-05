import { motion, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Clock, Phone, Star, ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OptimizedImage from "@/components/OptimizedImage";
import { apiUrl } from "@/lib/api";

/* ─── Ambiance gallery images ─── */
const ambianceImages = [
  "/images/AMBIANCE/Screenshot 2026-02-13 192813.png",
  "/images/AMBIANCE/Screenshot 2026-02-13 192806.png",
  "/images/AMBIANCE/Screenshot 2026-02-13 192750.png",
  "/images/AMBIANCE/Screenshot 2026-02-13 192739.png",
  "/images/AMBIANCE/Screenshot 2026-02-13 192731.png",
  "/images/AMBIANCE/Screenshot 2026-02-13 192722.png",
  "/images/AMBIANCE/Screenshot 2026-02-13 192852.png",
  "/images/AMBIANCE/Screenshot 2026-02-13 192830.png",
  "/images/AMBIANCE/Screenshot 2026-02-13 192822.png",
  "/images/AMBIANCE/Screenshot 2026-02-13 192909.png",
  "/images/AMBIANCE/Screenshot 2026-02-13 192917.png",
  "/images/AMBIANCE/Screenshot 2026-02-13 192929.png",
  "/images/AMBIANCE/Screenshot 2026-02-13 192938.png",
  "/images/AMBIANCE/Screenshot 2026-02-13 193004.png",
  "/images/AMBIANCE/Screenshot 2026-02-13 193012.png",
];

/* ─── Testimonials ─── */
const testimonials = [
  {
    name: "Marc Hildreth",
    text: "What a gem in the heart of the city. Came for breakfast... They've got delicious food, great service and the bright, charming interiors are the icing on the cake. Highly recommended 👍 5⭐'s",
    rating: 5,
    source: "Google Reviews",
    platform: "google",
    timeAgo: "a year ago",
    details: { service: "Dine in", mealType: "Breakfast", priceRange: "₹1,200-1,400" },
  },
  {
    name: "Komal",
    text: "Good food, 5 star hospitality. Must visit place",
    rating: 5,
    source: "Zomato",
    platform: "zomato",
    timeAgo: "7 days ago",
  },
  {
    name: "Ravi Kumar",
    text: "We had a fantastic experience at Ingri at Museo Café! The service was truly amazing-attentive, friendly, and quick. The firewood pizza was a standout--delicious, perfectly cooked, and hygienic, with a great balance of flavors. The ambiance was warm and inviting, making it a perfect spot to relax and enjoy a meal.",
    rating: 5,
    source: "Google Reviews",
    platform: "google",
    timeAgo: "11 months ago",
    details: { service: "Dine in", mealType: "Lunch" },
  },
  {
    name: "Shyatto Raha",
    text: "Food is absolutely delicious, very warm staff and attentive service. Love the setting and ambience",
    rating: 5,
    source: "Zomato",
    platform: "zomato",
    timeAgo: "one month ago",
  },
  {
    name: "Annie Madonna",
    text: "I recently visited this lovely cafe, and it was such a wonderful experience! From the moment you walk in, the cozy, inviting ambiance sets the perfect mood. The food was amazing! Every dish was beautifully plated and absolutely delicious.",
    rating: 5,
    source: "Google Reviews",
    platform: "google",
    timeAgo: "8 months ago",
    details: { priceRange: "₹2,000+" },
  },
  {
    name: "Gautam Sharma",
    text: "I had a wonderful experience at Ingre, located within Museo Camera in Gurgaon. The atmosphere was exceptional, and I was thoroughly impressed by the incredible quality of the food and the service provided. It is truly a standout dining destination in the area.",
    rating: 5,
    source: "Google Reviews",
    platform: "google",
    timeAgo: "2 months ago",
    details: { mealType: "Lunch" },
  },
  {
    name: "Varun",
    text: "Brilliant team and service, very warm and hospitable. Great menu, food selection",
    rating: 5,
    source: "Zomato",
    platform: "zomato",
    timeAgo: "Feb 01, 2025",
  },
  {
    name: "Deepinder Sondhi",
    text: "Beautiful calm cafe at the only camera museum in India. The menu is varied with unique dishes which are well executed. We had loads of food including Taiwanese pork belly, stuffed chicken breast, tacos, spaghetti, pizza, masala chai ice cream and tiramisu which were all great. One word to describe this place is Exceptional.",
    rating: 5,
    source: "Google Reviews",
    platform: "google",
    timeAgo: "a month ago",
    details: { mealType: "Lunch" },
  },
  {
    name: "Shivani",
    text: "This place never makes me upset and who ever I bring gets happy here. Great food and ambience. I just love it here always, one of my few go to places",
    rating: 5,
    source: "Zomato",
    platform: "zomato",
    timeAgo: "one month ago",
  },
];

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

/* ─── Testimonials Paginated Slider Component ─── */
function TestimonialsSection({ testRef, testInView }: { testRef: React.RefObject<HTMLElement | null>; testInView: boolean }) {
  const [reviewPage, setReviewPage] = useState(0);
  const perPage = 3;
  const pageCount = Math.ceil(testimonials.length / perPage);

  useEffect(() => {
    if (pageCount <= 1) return;
    const timer = setInterval(() => setReviewPage((p) => (p + 1) % pageCount), 5000);
    return () => clearInterval(timer);
  }, [pageCount]);

  const currentReviews = testimonials.slice(reviewPage * perPage, reviewPage * perPage + perPage);

  return (
    <motion.section
      ref={testRef}
      initial="hidden" animate={testInView ? "visible" : "hidden"}
      variants={stagger}
      className="py-12 md:py-20 bg-[#F5FAFA]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div variants={childFade} className="text-center mb-8 sm:mb-12">
          <p className="font-body text-xs tracking-[0.25em] text-[#1A4547] uppercase mb-3">REVIEWS</p>
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl text-[#1A3C3E] font-bold mb-3">
            What Our Guests <span className="italic font-normal text-[#5E8A8C]">Say</span>
          </h2>
          <p className="font-body text-sm text-[#555]/70 max-w-md mx-auto">Real experiences from our valued guests</p>
        </motion.div>

        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={reviewPage}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
            >
              {currentReviews.map((t) => (
                <div
                  key={t.name + t.timeAgo}
                  className="relative bg-white rounded-xl overflow-hidden border border-[#D0E8E8] shadow-[0_2px_12px_rgba(35,90,93,0.04)] hover:shadow-[0_8px_30px_rgba(35,90,93,0.08)] transition-all duration-500"
                >
                  <div className="absolute top-0 right-0 px-3 py-1 text-[10px] font-body tracking-wider uppercase rounded-bl-lg bg-[#1A4547]/10 text-[#1A4547]">
                    {t.source}
                  </div>
                  <div className="p-5 pt-8">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-heading text-sm font-bold bg-gradient-to-br from-[#1A4547] to-[#5E8A8C]">
                        {t.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div className="flex-1">
                        <p className="font-heading text-sm font-semibold text-[#1A3C3E]">{t.name}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-0.5">
                            {Array.from({ length: t.rating }).map((_, si) => (
                              <Star key={si} size={11} className="fill-[#F5A623] text-[#F5A623]" />
                            ))}
                          </div>
                          <span className="text-[10px] text-[#7A9A9C]">• {t.timeAgo}</span>
                        </div>
                      </div>
                    </div>
                    <p className="font-body text-xs text-[#555]/80 leading-relaxed line-clamp-4">
                      {t.text}
                    </p>
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Page dots */}
        {pageCount > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: pageCount }).map((_, i) => (
              <button
                key={i}
                onClick={() => setReviewPage(i)}
                className={`rounded-full transition-all duration-300 ${i === reviewPage ? 'bg-[#1A4547] w-5 h-2' : 'bg-[#1A4547]/20 w-2 h-2'}`}
                aria-label={`Reviews page ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </motion.section>
  );
}

export default function Index() {
  const philRef = useRef(null);
  const testRef = useRef(null);
  const spaceRef = useRef(null);
  const shopRef = useRef(null);
  const findRef = useRef(null);

  const philInView = useInView(philRef, { once: true, margin: "-80px" });
  const testInView = useInView(testRef, { once: true, margin: "-80px" });
  const spaceInView = useInView(spaceRef, { once: true, margin: "-80px" });
  const shopInView = useInView(shopRef, { once: true, margin: "-80px" });
  const findInView = useInView(findRef, { once: true, margin: "-80px" });

  /* ─── Menu URL from backend ─── */
  const [menuUrl, setMenuUrl] = useState("");
  useEffect(() => {
    fetch(apiUrl("/api/menu"))
      .then(r => r.json())
      .then(data => { if (data.menuUrl) setMenuUrl(data.menuUrl); })
      .catch(() => {});
  }, []);

  /* ─── Ambiance slideshow ─── */
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideDirection, setSlideDirection] = useState(1);
  const totalSlides = ambianceImages.length;

  const nextSlide = useCallback(() => {
    setSlideDirection(1);
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setSlideDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  useEffect(() => {
    const interval = setInterval(nextSlide, 3500);
    return () => clearInterval(interval);
  }, [nextSlide]);

  const getVisibleSlides = () => {
    const slides: string[] = [];
    for (let i = 0; i < 4; i++) {
      slides.push(ambianceImages[(currentSlide + i) % totalSlides]);
    }
    return slides;
  };


  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ═══ Hero — Matching other pages ═══ */}
      <section className="relative pt-16 pb-12 sm:pt-20 sm:pb-16 md:pt-28 md:pb-20 overflow-hidden bg-[#F5FAFA]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 right-[10%] w-64 h-64 rounded-full bg-[#1A4547]/[0.03]" />
          <div className="absolute bottom-10 left-[5%] w-48 h-48 rounded-full bg-[#1A4547]/[0.04]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#1A4547]/[0.02]" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <p className="font-body text-xs tracking-[0.25em] text-[#7A9A9C] uppercase mb-4">INGRI CAFE</p>
              <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl text-[#1A3C3E] font-bold leading-tight mb-5">
                Where Cuisine<br />Meets <span className="italic font-normal text-[#5E8A8C]">Culture</span>
              </h1>

              {/* Image — mobile only, between heading and description */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
                className="rounded-2xl overflow-hidden border border-[#1A4547]/10 mb-6 lg:hidden">
                <OptimizedImage src="/images/AMBIANCE/Screenshot 2026-02-13 193128.png" alt="Ingri café interior"
                  className="w-full h-auto" loading="eager" />
              </motion.div>

              <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}
                className="font-body text-[15px] md:text-base text-[#555] leading-[1.8] max-w-lg mb-8">
                Nestled within Museo Camera — Ingri brings ingredient-led cooking to a space shaped by art and perspective. A cultural experience, crafted through cuisine.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.5 }}
                className="flex flex-wrap gap-3">
                <Link to="/reserve"
                  className="inline-flex items-center gap-2 bg-[#1A4547] text-white font-body text-sm font-semibold tracking-wide px-7 py-3.5 rounded-xl hover:bg-[#4A2E17] transition-all shadow-sm">
                  Reserve a Table <ArrowRight size={16} />
                </Link>
                <a href={menuUrl || "#"} target="_blank" rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 border border-[#1A4547]/20 text-[#1A4547] font-body text-sm font-medium tracking-wide px-7 py-3.5 rounded-xl hover:bg-[#1A4547]/[0.04] transition-all ${!menuUrl ? 'opacity-50 pointer-events-none' : ''}`}>
                  View Menu <ArrowRight size={15} />
                </a>
              </motion.div>
            </motion.div>

            {/* Image — desktop only */}
            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.9, delay: 0.3 }}
              className="rounded-2xl overflow-hidden border border-[#1A4547]/10 hidden lg:block">
              <OptimizedImage src="/images/AMBIANCE/Screenshot 2026-02-13 193128.png" alt="Ingri café interior"
                className="w-full h-[520px] object-cover" loading="eager" priority={true} width={700} height={520} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ Philosophy ═══ */}
      <motion.section
        ref={philRef}
        initial="hidden" animate={philInView ? "visible" : "hidden"}
        variants={fadeUp}
        className="py-20 md:py-28"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <p className="font-body text-xs tracking-[0.25em] text-[#7A9A9C] uppercase mb-3">OUR PHILOSOPHY</p>
              <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-[#1A3C3E] font-bold leading-tight mb-5 md:mb-6">
                A Cultural Experience, <span className="italic font-normal text-[#5E8A8C]">Crafted</span> Through Cuisine
              </h2>

              {/* Image — mobile only */}
              <div className="relative overflow-hidden rounded-lg shadow-lg mb-5 md:hidden">
                <OptimizedImage src="/images/AMBIANCE/Screenshot 2026-02-13 192731.png" alt="Café interior"
                  className="w-full h-[260px] object-cover" loading="lazy" />
              </div>

              <p className="font-body text-[15px] text-[#555] leading-[1.8] mb-4">
                At Ingri, the exhibition continues at the table. Ingredient-led cooking meets a setting rooted in art, creating an experience that engages more than one sense.
              </p>
              <p className="font-body text-[15px] text-[#555] leading-[1.8] mb-7">
                Our space is designed to be a sanctuary for visitors — a place to enjoy carefully prepared meals and brews that tell a story of their own.
              </p>
              <div className="flex flex-wrap gap-8">
                {[
                  { num: "0%", label: "Preservatives" },
                  { num: "100%", label: "Quality" },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="font-heading text-2xl sm:text-3xl text-[#1A4547] font-bold">{s.num}</p>
                    <p className="font-body text-xs text-[#7A9A9C]">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
            {/* Image — desktop only */}
            <div className="relative overflow-hidden rounded-lg shadow-lg hidden md:block">
              <OptimizedImage src="/images/AMBIANCE/Screenshot 2026-02-13 192731.png" alt="Café interior with modern seating"
                className="w-full h-[400px] object-cover" loading="lazy" width={600} height={400} />
            </div>
          </div>
        </div>
      </motion.section>

      {/* ═══ Guest Testimonials — Paginated Slider ═══ */}
      <TestimonialsSection testRef={testRef} testInView={testInView} />

      {/* ═══ The Space Within — Ambiance Slideshow ═══ */}
      <motion.section
        ref={spaceRef}
        initial="hidden" animate={spaceInView ? "visible" : "hidden"}
        variants={fadeUp}
        className="py-12 sm:py-16 md:py-20 overflow-hidden bg-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={childFade} className="text-center mb-10 sm:mb-14">
            <p className="font-body text-xs tracking-[0.25em] text-[#1A4547] uppercase mb-3">AMBIANCE GALLERY</p>
            <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-[#1A3C3E] font-bold mb-4">
              The Space <span className="italic font-normal text-[#5E8A8C]">Within</span>
            </h2>
            <p className="font-body text-xs sm:text-sm text-[#555]/60 max-w-lg mx-auto px-4 mb-4">
              An intimate setting where photography heritage meets culinary artistry
            </p>
            <a href="https://www.instagram.com/ingriatmuseo/" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[#1A4547] hover:text-[#1A4547]/70 transition-colors duration-300 font-body text-sm">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              Follow @ingriatmuseo on Instagram
            </a>
          </motion.div>

          {/* Auto-sliding Carousel */}
          <div className="relative">
            <button onClick={prevSlide}
              className="absolute left-0 sm:left-2 md:-left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 bg-white rounded-full shadow-[0_4px_20px_rgba(35,90,93,0.1)] flex items-center justify-center text-[#1A3C3E]/60 hover:text-[#1A3C3E] hover:shadow-[0_8px_30px_rgba(35,90,93,0.15)] transition-all duration-300">
              <ChevronLeft size={20} />
            </button>
            <button onClick={nextSlide}
              className="absolute right-0 sm:right-2 md:-right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 bg-white rounded-full shadow-[0_4px_20px_rgba(35,90,93,0.1)] flex items-center justify-center text-[#1A3C3E]/60 hover:text-[#1A3C3E] hover:shadow-[0_8px_30px_rgba(35,90,93,0.15)] transition-all duration-300">
              <ChevronRight size={20} />
            </button>

            <div className="overflow-hidden px-2 sm:px-4 md:px-0">
              <AnimatePresence mode="popLayout" custom={slideDirection}>
                <motion.div
                  key={currentSlide}
                  custom={slideDirection}
                  initial={{ x: slideDirection > 0 ? "25%" : "-25%", opacity: 0 }}
                  animate={{ x: "0%", opacity: 1 }}
                  exit={{ x: slideDirection > 0 ? "-25%" : "25%", opacity: 0 }}
                  transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4"
                >
                  {getVisibleSlides().map((src, i) => (
                    <motion.div key={src + "-" + i}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                      className="relative overflow-hidden rounded-lg shadow-[0_4px_20px_rgba(35,90,93,0.05)] group aspect-[4/3]">
                      <OptimizedImage src={src} alt={`Ingri ambiance ${currentSlide + i + 1}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1200ms] ease-out"
                        loading="lazy" width={400} height={300} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Slide indicators */}
            <div className="flex justify-center gap-1.5 sm:gap-2 mt-6 sm:mt-8 px-4">
              {ambianceImages.map((_, i) => (
                <button key={i}
                  onClick={() => { setSlideDirection(i > currentSlide ? 1 : -1); setCurrentSlide(i); }}
                  className={`transition-all duration-300 rounded-full ${
                    i === currentSlide ? "w-6 sm:w-8 h-2 bg-[#1A4547]" : "w-2 h-2 bg-[#1A4547]/15 hover:bg-[#1A4547]/30"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* ═══ Dine with Us ═══ */}
      <section className="relative py-20 sm:py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <OptimizedImage src="/images/AMBIANCE/Screenshot 2026-02-13 193045.png" alt="Dine with us"
            className="w-full h-full object-cover scale-105" loading="lazy" width={1920} height={1080} />
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
        </div>

        {/* Decorative elements */}
        <div className="absolute inset-0 pointer-events-none z-[1]">
          <div className="absolute top-8 left-8 sm:top-12 sm:left-12 w-16 h-16 sm:w-20 sm:h-20 border-t border-l border-white/[0.08]" />
          <div className="absolute bottom-8 right-8 sm:bottom-12 sm:right-12 w-16 h-16 sm:w-20 sm:h-20 border-b border-r border-white/[0.08]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center max-w-2xl mx-auto px-4 sm:px-6"
        >
          <div className="w-8 h-px bg-white/20 mx-auto mb-5" />
          <p className="font-body text-[10px] sm:text-[11px] tracking-[0.3em] text-white/40 uppercase mb-5">RESERVATIONS</p>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl text-white font-bold mb-5 leading-[1.15]">
            Dine with <span className="italic font-normal text-white/70">Us</span>
          </h2>
          <div className="w-10 h-px bg-white/15 mx-auto mb-6" />
          <p className="font-body text-[14px] sm:text-[15px] text-white/50 mb-10 max-w-md mx-auto leading-[1.8]">
            Whether it's a quiet lunch or a special dinner, we'd love to have you. Reserve your spot and let us take care of the rest.
          </p>
          <Link to="/reserve"
            className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-white text-[#1A3C3E] font-heading text-sm font-semibold hover:bg-white/90 transition-all duration-300 shadow-[0_4px_24px_rgba(0,0,0,0.25)] rounded-xl">
            Reserve a Table <ArrowRight size={15} />
          </Link>
        </motion.div>
      </section>

      {/* ═══ Find Us — Themed ═══ */}
      <motion.section
        ref={findRef}
        initial="hidden" animate={findInView ? "visible" : "hidden"}
        variants={fadeUp}
        className="py-16 md:py-28 bg-[#F5FAFA]"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div variants={stagger} initial="hidden" animate={findInView ? "visible" : "hidden"}
            className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <motion.div variants={childFade}>
              <p className="font-body text-xs tracking-[0.25em] text-[#7A9A9C] uppercase mb-4">LOCATION</p>
              <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-[#1A3C3E] font-bold mb-8">
                Find <span className="italic font-normal text-[#5E8A8C]">Us</span>
              </h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#1A4547]/[0.07] flex items-center justify-center shrink-0">
                    <MapPin className="text-[#1A4547]" size={18} />
                  </div>
                  <div>
                    <p className="font-heading text-sm font-semibold text-[#1A3C3E] mb-1">Address</p>
                    <p className="font-body text-sm text-[#555] leading-relaxed">
                      Museo Camera Centre for the Photographic Arts,<br />
                      Shri Ganesh Mandir Marg, Sector 28, DLF Phase IV,<br />
                      Gurugram, Haryana – 122009
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#1A4547]/[0.07] flex items-center justify-center shrink-0">
                    <Clock className="text-[#1A4547]" size={18} />
                  </div>
                  <div>
                    <p className="font-heading text-sm font-semibold text-[#1A3C3E] mb-1">Hours</p>
                    <p className="font-body text-sm text-[#555]">Open Daily: 08:00 AM — 10:00 PM</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#1A4547]/[0.07] flex items-center justify-center shrink-0">
                    <Phone className="text-[#1A4547]" size={18} />
                  </div>
                  <div>
                    <p className="font-heading text-sm font-semibold text-[#1A3C3E] mb-1">Contact</p>
                    <p className="font-body text-sm text-[#555]">+91 9311415282</p>
                    <p className="font-body text-sm text-[#555]">ggn.museo@ingri.world</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                {["Zomato", "Swiggy", "EazyDiner"].map((p) => (
                  <span key={p} className="font-body text-xs border border-[#D0E8E8] text-[#1A4547]/60 px-4 py-1.5 bg-white rounded-lg shadow-sm">
                    {p}
                  </span>
                ))}
              </div>

              <p className="mt-6 font-body text-xs text-[#1A4547]/50">
                FSSAI Lic. No. 10824005001275
              </p>
            </motion.div>

            <motion.div variants={childFade} className="overflow-hidden rounded-2xl shadow-[0_8px_40px_rgba(35,90,93,0.06)] border border-[#D0E8E8]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3507.0!2d77.09!3d28.46!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sMuseo+Camera!5e0!3m2!1sen!2sin!4v1700000000000"
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Museo Camera location map"
              />
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      <Footer />
    </div>
  );
}
