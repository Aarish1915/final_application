import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Link } from "react-router-dom";

const galleryImages = [
  { src: "/images/Screenshot 2026-02-12 141606.png", alt: "Café moments 1" },
  { src: "/images/Screenshot 2026-02-12 141459.png", alt: "Café moments 2" },
  { src: "/images/Screenshot 2026-02-12 141444.png", alt: "Café moments 3" },
  { src: "/images/Screenshot 2026-02-12 141621.png", alt: "Café moments 4" },
  { src: "/images/Screenshot 2026-02-12 141739.png", alt: "Café moments 5" },
  { src: "/images/home landing.png", alt: "Café moments 6" },
  { src: "/images/Screenshot 2026-02-12 141640.png", alt: "Café moments 7" },
];

export default function GalleryPreviewSection() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: true, margin: "-80px" });

  // Auto-advance every 3.5s
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % galleryImages.length);
    }, 3500);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const goTo = (index: number) => {
    if (index === current) return;
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
    // Reset timer
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % galleryImages.length);
    }, 3500);
  };

  // Book-flip variants — page turns to the left
  const bookVariants = {
    enter: (dir: number) => ({
      rotateY: dir > 0 ? 90 : -90,
      x: dir > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.85,
    }),
    center: {
      rotateY: 0,
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        rotateY: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
        x: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
        opacity: { duration: 0.5 },
        scale: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
      },
    },
    exit: (dir: number) => ({
      rotateY: dir > 0 ? -90 : 90,
      x: dir > 0 ? -300 : 300,
      opacity: 0,
      scale: 0.85,
      transition: {
        rotateY: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
        x: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
        opacity: { duration: 0.5 },
        scale: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
      },
    }),
  };

  // Stacked thumbnails that slide to the left
  const prevIndex = (current - 1 + galleryImages.length) % galleryImages.length;
  const prevPrevIndex = (current - 2 + galleryImages.length) % galleryImages.length;
  const prevPrevPrevIndex = (current - 3 + galleryImages.length) % galleryImages.length;

  return (
    <section
      ref={sectionRef}
      className="section-snap relative flex items-center overflow-hidden emerald-gradient"
    >
      {/* Decorative gold corner accents */}
      <div className="absolute top-8 left-8 w-16 h-16 border-t-2 border-l-2 border-gold/30 rounded-tl-xl" />
      <div className="absolute top-8 right-8 w-16 h-16 border-t-2 border-r-2 border-gold/30 rounded-tr-xl" />
      <div className="absolute bottom-8 left-8 w-16 h-16 border-b-2 border-l-2 border-gold/30 rounded-bl-xl" />
      <div className="absolute bottom-8 right-8 w-16 h-16 border-b-2 border-r-2 border-gold/30 rounded-br-xl" />

      {/* Subtle pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23bfa363' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="container mx-auto px-6 lg:px-16 py-20">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <motion.p
            initial={{ opacity: 0, letterSpacing: "0.1em" }}
            animate={inView ? { opacity: 1, letterSpacing: "0.3em" } : {}}
            transition={{ duration: 1, delay: 0.2 }}
            className="font-heading text-sm tracking-[0.3em] text-gold mb-3"
          >
            A GLIMPSE INSIDE
          </motion.p>
          <h2 className="font-heading text-4xl md:text-5xl text-cream font-bold mb-4">
            Gallery Preview
          </h2>
          <div className="w-20 h-[2px] bg-gold mx-auto mt-5" />
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="font-body text-cream/60 text-sm mt-4"
          >
            Discover the ambiance and culinary artistry of Ingri
          </motion.p>
        </motion.div>

        {/* Gallery layout: stacked left + main center */}
        <div className="flex items-center justify-center gap-6 lg:gap-10">
          {/* Left stacked (previous images, fading behind like closed book pages) */}
          <div className="hidden lg:flex flex-col gap-3 items-end relative w-52">
            {/* Third previous */}
            <motion.div
              key={`prev3-${prevPrevPrevIndex}`}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 0.15, x: 0, scale: 0.92 }}
              transition={{ duration: 0.7 }}
              className="w-36 h-24 rounded-xl overflow-hidden gold-border shadow-lg"
              style={{ perspective: "700px", transform: "rotateY(20deg)" }}
            >
              <img
                src={galleryImages[prevPrevPrevIndex].src}
                alt={galleryImages[prevPrevPrevIndex].alt}
                className="w-full h-full object-cover"
              />
            </motion.div>
            {/* Second previous */}
            <motion.div
              key={`prev2-${prevPrevIndex}`}
              initial={{ opacity: 0, x: 45, scale: 0.92 }}
              animate={{ opacity: 0.3, x: 0, scale: 0.95 }}
              transition={{ duration: 0.65 }}
              className="w-40 h-28 rounded-xl overflow-hidden gold-border shadow-lg"
              style={{ perspective: "650px", transform: "rotateY(15deg)" }}
            >
              <img
                src={galleryImages[prevPrevIndex].src}
                alt={galleryImages[prevPrevIndex].alt}
                className="w-full h-full object-cover"
              />
            </motion.div>
            {/* First previous */}
            <motion.div
              key={`prev1-${prevIndex}`}
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 0.55, x: 0, scale: 0.98 }}
              transition={{ duration: 0.6 }}
              className="w-44 h-32 rounded-xl overflow-hidden gold-border shadow-xl"
              style={{ perspective: "600px", transform: "rotateY(10deg)" }}
            >
              <img
                src={galleryImages[prevIndex].src}
                alt={galleryImages[prevIndex].alt}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>

          {/* Main image - book flip animation */}
          <div
            className="relative w-full max-w-2xl aspect-[16/10] rounded-2xl overflow-hidden"
            style={{ perspective: "1200px" }}
          >
            {/* Subtle shadow/reflection under */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[90%] h-8 rounded-full bg-black/30 blur-xl" />

            <AnimatePresence custom={direction} mode="wait">
              <motion.div
                key={current}
                custom={direction}
                variants={bookVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="absolute inset-0 origin-left"
                style={{ transformStyle: "preserve-3d" }}
              >
                <div className="w-full h-full rounded-2xl overflow-hidden gold-border shadow-[0_8px_40px_rgba(0,0,0,0.5)]">
                  <img
                    src={galleryImages[current].src}
                    alt={galleryImages[current].alt}
                    className="w-full h-full object-cover"
                  />
                  {/* Gradient overlay for depth */}
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-dark/40 via-transparent to-transparent" />
                  {/* Gold shine effect on flip */}
                  <motion.div
                    initial={{ opacity: 0.6, x: "-100%" }}
                    animate={{ opacity: 0, x: "200%" }}
                    transition={{ duration: 1.2, delay: 0.2 }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/15 to-transparent skew-x-12"
                  />
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Image counter */}
            <div className="absolute bottom-4 right-4 z-10 bg-emerald-dark/80 backdrop-blur-sm px-3 py-1 rounded-full gold-border">
              <span className="font-body text-xs text-gold">
                {current + 1} / {galleryImages.length}
              </span>
            </div>
          </div>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2 mt-10">
          {galleryImages.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-2 rounded-full transition-all duration-500 ${
                i === current
                  ? "w-8 bg-gold shadow-[0_0_12px_rgba(191,163,99,0.5)]"
                  : "w-2 bg-cream/30 hover:bg-gold/50"
              }`}
              aria-label={`Go to image ${i + 1}`}
            />
          ))}
        </div>

        {/* CTA to full gallery */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-center mt-12"
        >
          <Link
            to="/gallery"
            className="inline-flex items-center gap-3 px-8 py-3 bg-gold/10 border border-gold/40 rounded-full text-gold font-heading text-xs tracking-[0.25em] hover:bg-gold/20 hover:border-gold/60 transition-all duration-300 group"
          >
            VIEW FULL GALLERY
            <svg
              className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
