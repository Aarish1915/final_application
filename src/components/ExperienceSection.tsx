import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import cafeFood from "@/assets/cafe-food.webp";

export default function ExperienceSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="section-snap flex items-center bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-16 py-12 sm:py-16 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-20 items-center">
          {/* Left text */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <p className="font-heading text-xs sm:text-sm tracking-[0.3em] text-gold mb-3 sm:mb-4">
              SIGNATURE EXPERIENCE
            </p>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl text-foreground font-bold mb-4 sm:mb-6 leading-tight">
              Curated with<br />
              <span className="text-secondary">Pure Ingredients</span>
            </h2>
            <p className="font-body text-muted-foreground leading-relaxed mb-8">
              Every dish at Ingri is crafted with the finest ingredients — no preservatives,
              no thickeners, no added flavours. Just pure, honest food that celebrates
              the art of culinary excellence.
            </p>
            <div className="flex gap-8">
              {[
                { num: "50+", label: "Dishes" },
                { num: "100%", label: "Pure" },
                { num: "Zero", label: "Fuss" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="font-heading text-2xl text-accent font-bold">{s.num}</p>
                  <p className="font-body text-sm text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right image */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="curved-container overflow-hidden gold-border"
          >
            <img
              src={cafeFood}
              alt="Signature dishes at Ingri"
              className="w-full h-52 sm:h-72 md:h-[400px] lg:h-[500px] object-cover hover:scale-105 transition-transform duration-700"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
