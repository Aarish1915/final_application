import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";

/* ─── Image data ─── */
const ambianceImages = [
  { src: "/images/AMBIANCE/Screenshot 2026-02-13 192659.png", alt: "Café ambiance 1" },
  { src: "/images/AMBIANCE/Screenshot 2026-02-13 192707.png", alt: "Café ambiance 2" },
  { src: "/images/AMBIANCE/Screenshot 2026-02-13 192714.png", alt: "Café ambiance 3" },
  { src: "/images/AMBIANCE/Screenshot 2026-02-13 192722.png", alt: "Café ambiance 4" },
  { src: "/images/AMBIANCE/Screenshot 2026-02-13 192731.png", alt: "Café ambiance 5" },
  { src: "/images/AMBIANCE/Screenshot 2026-02-13 192739.png", alt: "Café ambiance 6" },
  { src: "/images/AMBIANCE/Screenshot 2026-02-13 192750.png", alt: "Café ambiance 7" },
  { src: "/images/AMBIANCE/Screenshot 2026-02-13 192806.png", alt: "Café ambiance 8" },
  { src: "/images/AMBIANCE/Screenshot 2026-02-13 192813.png", alt: "Café ambiance 9" },
  { src: "/images/AMBIANCE/Screenshot 2026-02-13 192822.png", alt: "Café ambiance 10" },
  { src: "/images/AMBIANCE/Screenshot 2026-02-13 192830.png", alt: "Café ambiance 11" },
  { src: "/images/AMBIANCE/Screenshot 2026-02-13 192842.png", alt: "Café ambiance 12" },
  { src: "/images/AMBIANCE/Screenshot 2026-02-13 192852.png", alt: "Café ambiance 13" },
  { src: "/images/AMBIANCE/Screenshot 2026-02-13 192859.png", alt: "Café ambiance 14" },
  { src: "/images/AMBIANCE/Screenshot 2026-02-13 192909.png", alt: "Café ambiance 15" },
  { src: "/images/AMBIANCE/Screenshot 2026-02-13 192917.png", alt: "Café ambiance 16" },
  { src: "/images/AMBIANCE/Screenshot 2026-02-13 192929.png", alt: "Café ambiance 17" },
  { src: "/images/AMBIANCE/Screenshot 2026-02-13 192938.png", alt: "Café ambiance 18" },
  { src: "/images/AMBIANCE/Screenshot 2026-02-13 193004.png", alt: "Café ambiance 19" },
  { src: "/images/AMBIANCE/Screenshot 2026-02-13 193012.png", alt: "Café ambiance 20" },
  { src: "/images/AMBIANCE/Screenshot 2026-02-13 193019.png", alt: "Café ambiance 21" },
  { src: "/images/AMBIANCE/Screenshot 2026-02-13 193026.png", alt: "Café ambiance 22" },
  { src: "/images/AMBIANCE/Screenshot 2026-02-13 193035.png", alt: "Café ambiance 23" },
  { src: "/images/AMBIANCE/Screenshot 2026-02-13 193045.png", alt: "Café ambiance 24" },
  { src: "/images/AMBIANCE/Screenshot 2026-02-13 193054.png", alt: "Café ambiance 25" },
  { src: "/images/AMBIANCE/Screenshot 2026-02-13 193103.png", alt: "Café ambiance 26" },
  { src: "/images/AMBIANCE/Screenshot 2026-02-13 193111.png", alt: "Café ambiance 27" },
  { src: "/images/AMBIANCE/Screenshot 2026-02-13 193121.png", alt: "Café ambiance 28" },
  { src: "/images/AMBIANCE/Screenshot 2026-02-13 193128.png", alt: "Café ambiance 29" },
  { src: "/images/AMBIANCE/Screenshot 2026-02-13 193135.png", alt: "Café ambiance 30" },
];

const foodImages = [
  { src: "/images/FOOD/Screenshot 2026-02-13 193211.png", alt: "Signature dish 1" },
  { src: "/images/FOOD/Screenshot 2026-02-13 193217.png", alt: "Signature dish 2" },
  { src: "/images/FOOD/Screenshot 2026-02-13 193225.png", alt: "Signature dish 3" },
  { src: "/images/FOOD/Screenshot 2026-02-13 193230.png", alt: "Signature dish 4" },
  { src: "/images/FOOD/Screenshot 2026-02-13 193238.png", alt: "Signature dish 5" },
  { src: "/images/FOOD/Screenshot 2026-02-13 193244.png", alt: "Signature dish 6" },
  { src: "/images/FOOD/Screenshot 2026-02-13 193251.png", alt: "Signature dish 7" },
  { src: "/images/FOOD/Screenshot 2026-02-13 193257.png", alt: "Signature dish 8" },
  { src: "/images/FOOD/Screenshot 2026-02-13 193307.png", alt: "Signature dish 9" },
  { src: "/images/FOOD/Screenshot 2026-02-13 193314.png", alt: "Signature dish 10" },
  { src: "/images/FOOD/Screenshot 2026-02-13 193321.png", alt: "Signature dish 11" },
  { src: "/images/FOOD/Screenshot 2026-02-13 193325.png", alt: "Signature dish 12" },
  { src: "/images/FOOD/Screenshot 2026-02-13 193331.png", alt: "Signature dish 13" },
  { src: "/images/FOOD/Screenshot 2026-02-13 193337.png", alt: "Signature dish 14" },
  { src: "/images/FOOD/Screenshot 2026-02-13 193343.png", alt: "Signature dish 15" },
  { src: "/images/FOOD/Screenshot 2026-02-13 193351.png", alt: "Signature dish 16" },
  { src: "/images/FOOD/Screenshot 2026-02-13 193358.png", alt: "Signature dish 17" },
  { src: "/images/FOOD/Screenshot 2026-02-13 193405.png", alt: "Signature dish 18" },
  { src: "/images/FOOD/Screenshot 2026-02-13 193411.png", alt: "Signature dish 19" },
  { src: "/images/FOOD/Screenshot 2026-02-13 193418.png", alt: "Signature dish 20" },
  { src: "/images/FOOD/Screenshot 2026-02-13 193426.png", alt: "Signature dish 21" },
  { src: "/images/FOOD/Screenshot 2026-02-13 193432.png", alt: "Signature dish 22" },
  { src: "/images/FOOD/Screenshot 2026-02-13 193440.png", alt: "Signature dish 23" },
  { src: "/images/FOOD/Screenshot 2026-02-13 193446.png", alt: "Signature dish 24" },
  { src: "/images/FOOD/Screenshot 2026-02-13 193452.png", alt: "Signature dish 25" },
  { src: "/images/FOOD/Screenshot 2026-02-13 193500.png", alt: "Signature dish 26" },
  { src: "/images/FOOD/Screenshot 2026-02-13 193506.png", alt: "Signature dish 27" },
  { src: "/images/FOOD/Screenshot 2026-02-13 193512.png", alt: "Signature dish 28" },
  { src: "/images/FOOD/Screenshot 2026-02-13 193547.png", alt: "Signature dish 29" },
  { src: "/images/FOOD/Screenshot 2026-02-13 193553.png", alt: "Signature dish 30" },
  { src: "/images/FOOD/Screenshot 2026-02-13 193602.png", alt: "Signature dish 31" },
  { src: "/images/FOOD/Screenshot 2026-02-13 193610.png", alt: "Signature dish 32" },
  { src: "/images/FOOD/Screenshot 2026-02-13 193622.png", alt: "Signature dish 33" },
  { src: "/images/FOOD/Screenshot 2026-02-13 193628.png", alt: "Signature dish 34" },
  { src: "/images/FOOD/Screenshot 2026-02-13 193633.png", alt: "Signature dish 35" },
  { src: "/images/FOOD/Screenshot 2026-02-13 193639.png", alt: "Signature dish 36" },
];

type Tab = "ambiance" | "food";

/* ─── Lightbox ─── */
function Lightbox({
  src,
  alt,
  onClose,
}: {
  src: string;
  alt: string;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md cursor-pointer"
      onClick={onClose}
    >
      <motion.img
        src={src}
        alt={alt}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="max-w-[90vw] max-h-[85vh] object-contain rounded-2xl shadow-[0_0_60px_rgba(191,163,99,0.25)]"
        onClick={(e) => e.stopPropagation()}
        loading="eager"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.alt = 'Image failed to load';
        }}
      />
      <button
        onClick={onClose}
        className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center hover:bg-white/20 transition-colors text-xl"
      >
        ×
      </button>
    </motion.div>
  );
}

/* ─── Masonry grid item ─── */
function GalleryItem({
  src,
  alt,
  index,
  onClick,
  tall,
}: {
  src: string;
  alt: string;
  index: number;
  onClick: () => void;
  tall?: boolean;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{
        duration: 0.6,
        delay: (index % 6) * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -6, scale: 1.02 }}
      onClick={onClick}
      className={`group relative cursor-pointer overflow-hidden rounded-2xl ${
        tall ? "row-span-2" : ""
      }`}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
        }}
      />
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      {/* Gold shine sweep on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
      </div>
      {/* Corner accent */}
      <div className="absolute bottom-3 right-3 w-6 h-6 border-b border-r border-gold/0 group-hover:border-gold/60 rounded-br-lg transition-all duration-500" />
      <div className="absolute top-3 left-3 w-6 h-6 border-t border-l border-gold/0 group-hover:border-gold/60 rounded-tl-lg transition-all duration-500" />
    </motion.div>
  );
}

/* ─── Ambiance masonry grid ─── */
function AmbianceGallery({ onImageClick }: { onImageClick: (src: string, alt: string) => void }) {
  // Make some images tall for masonry effect
  const tallIndices = new Set([1, 4, 8, 12, 16, 20, 24, 28]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-[140px] sm:auto-rows-[170px] md:auto-rows-[220px] gap-2 sm:gap-3 md:gap-4">
      {ambianceImages.map((img, i) => (
        <GalleryItem
          key={img.src}
          src={img.src}
          alt={img.alt}
          index={i}
          tall={tallIndices.has(i)}
          onClick={() => onImageClick(img.src, img.alt)}
        />
      ))}
    </div>
  );
}

/* ─── Food masonry grid ─── */
function FoodGallery({ onImageClick }: { onImageClick: (src: string, alt: string) => void }) {
  // Make some images tall for masonry effect
  const tallIndices = new Set([0, 5, 9, 14, 18, 23, 27, 32]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-[140px] sm:auto-rows-[170px] md:auto-rows-[220px] gap-2 sm:gap-3 md:gap-4">
      {foodImages.map((img, i) => (
        <GalleryItem
          key={img.src}
          src={img.src}
          alt={img.alt}
          index={i}
          tall={tallIndices.has(i)}
          onClick={() => onImageClick(img.src, img.alt)}
        />
      ))}
    </div>
  );
}

/* ─── Main ─── */
export default function GallerySection() {
  const [activeTab, setActiveTab] = useState<Tab>("ambiance");
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: true, margin: "-80px" });

  const openLightbox = (src: string, alt: string) => setLightbox({ src, alt });

  const tabs: { key: Tab; label: string; sub: string }[] = [
    { key: "ambiance", label: "AMBIANCE", sub: "The Space" },
    { key: "food", label: "FOOD GALLERY", sub: "The Craft" },
  ];

  return (
    <>
      <section
        ref={sectionRef}
        className="relative min-h-screen py-14 sm:py-20 lg:py-24 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0a1f17 0%, #0d2b1f 40%, #122a1e 100%)",
        }}
      >
        {/* Background texture */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23bfa363' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Decorative gold corner frames */}
        <div className="absolute top-12 left-12 w-20 h-20 border-t-2 border-l-2 border-gold/20 rounded-tl-2xl" />
        <div className="absolute top-12 right-12 w-20 h-20 border-t-2 border-r-2 border-gold/20 rounded-tr-2xl" />
        <div className="absolute bottom-12 left-12 w-20 h-20 border-b-2 border-l-2 border-gold/20 rounded-bl-2xl" />
        <div className="absolute bottom-12 right-12 w-20 h-20 border-b-2 border-r-2 border-gold/20 rounded-br-2xl" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-16 relative z-10">
          {/* Section heading */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="text-center mb-6"
          >
            <motion.p
              initial={{ opacity: 0, letterSpacing: "0.1em" }}
              animate={inView ? { opacity: 1, letterSpacing: "0.35em" } : {}}
              transition={{ duration: 1, delay: 0.2 }}
              className="font-body text-xs text-gold/70 uppercase mb-4"
            >
              A Glimpse Inside
            </motion.p>
            <h2 className="font-creative text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-cream font-bold mb-4">
              Our Gallery
            </h2>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={inView ? { scaleX: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="w-24 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent mx-auto"
            />
          </motion.div>

          {/* Tab switcher */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex justify-center gap-2 sm:gap-4 mb-8 sm:mb-14"
          >
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative px-4 sm:px-8 py-3 sm:py-4 rounded-2xl transition-all duration-500 group ${
                  activeTab === tab.key
                    ? "bg-gold/10 border border-gold/40"
                    : "bg-white/[0.02] border border-white/[0.06] hover:border-gold/20 hover:bg-gold/[0.03]"
                }`}
              >
                <span
                  className={`block font-heading text-xs tracking-[0.25em] transition-colors duration-300 ${
                    activeTab === tab.key ? "text-gold" : "text-cream/40 group-hover:text-cream/60"
                  }`}
                >
                  {tab.label}
                </span>
                <span
                  className={`block font-accent text-sm mt-1 transition-colors duration-300 ${
                    activeTab === tab.key ? "text-cream/80" : "text-cream/20 group-hover:text-cream/40"
                  }`}
                >
                  {tab.sub}
                </span>
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="gallery-tab-indicator"
                    className="absolute -bottom-[1px] left-1/2 -translate-x-1/2 w-12 h-[2px] bg-gold rounded-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </motion.div>

          {/* Gallery content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {activeTab === "ambiance" ? (
                <AmbianceGallery onImageClick={openLightbox} />
              ) : (
                <FoodGallery onImageClick={openLightbox} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <Lightbox
            src={lightbox.src}
            alt={lightbox.alt}
            onClose={() => setLightbox(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
