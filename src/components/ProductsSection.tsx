import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import productsImg from "@/assets/products.png";
import brandImg from "@/assets/ingri-brand.png";

export default function ProductsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="section-snap flex items-center bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-16 py-12 sm:py-16 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <p className="font-heading text-xs sm:text-sm tracking-[0.3em] text-gold mb-3 sm:mb-4">
              FROZEN & PRODUCTS
            </p>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl text-foreground font-bold mb-4 sm:mb-6 leading-tight">
              Pure Ingredients,<br />
              <span className="text-secondary">Zero Fuss</span>
            </h2>
            <p className="font-body text-muted-foreground leading-relaxed mb-8">
              Take the Ingri experience home. Our range of frozen foods and ready-to-use
              gravies bring restaurant-quality meals to your kitchen — no preservatives,
              no thickeners, just pure food.
            </p>
            <a
              href="/products"
              className="inline-block font-heading text-sm tracking-[0.2em] px-8 py-3 rounded-full bg-primary text-primary-foreground hover:bg-secondary transition-all duration-300"
            >
              SHOP NOW
            </a>
          </motion.div>

          {/* Right images stacked */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="space-y-6"
          >
            <div className="curved-container overflow-hidden gold-border">
              <img src={productsImg} alt="Ingri products" className="w-full h-44 sm:h-56 lg:h-64 object-cover" />
            </div>
            <div className="curved-container overflow-hidden gold-border">
              <img src={brandImg} alt="Ingri brand range" className="w-full h-44 sm:h-56 lg:h-64 object-cover" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
