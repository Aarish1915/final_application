import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    quote: "An extraordinary dining experience. The attention to detail in every dish is remarkable. The truffle pasta is simply divine.",
    name: "Sarah Mitchell",
    role: "Food Critic",
    initials: "SM",
  },
  {
    quote: "Ingri has become our go-to for special occasions. The ambience, service, and food quality are consistently exceptional.",
    name: "James Chen",
    role: "Regular Guest",
    initials: "JC",
  },
  {
    quote: "The ingredient selection is impressive and the staff are incredibly knowledgeable. Every recommendation has been spot on.",
    name: "Emily Rodriguez",
    role: "Culinary Enthusiast",
    initials: "ER",
  },
];

export default function TestimonialsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="section-snap flex items-center emerald-gradient relative">
      <div className="absolute top-0 left-0 right-0 h-16 bg-background" style={{ borderRadius: "0 0 50% 50%" }} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-16 py-12 sm:py-16 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-4"
        >
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl text-cream font-bold mb-3">
            What Our Guests Say
          </h2>
          <div className="flex justify-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={20} className="text-gold fill-gold" />
            ))}
          </div>
          <p className="font-body text-cream/60 text-sm">
            4.9 out of 5 based on 250+ reviews
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto mt-8 sm:mt-12">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.15 }}
              className="bg-emerald-dark/50 backdrop-blur-sm rounded-2xl p-6 gold-border"
            >
              <Quote size={28} className="text-gold/60 mb-3" />
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} size={14} className="text-gold fill-gold" />
                ))}
              </div>
              <p className="font-body text-cream/80 text-sm leading-relaxed mb-6 italic">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold flex items-center justify-center">
                  <span className="font-heading text-emerald-deep text-xs font-bold">{t.initials}</span>
                </div>
                <div>
                  <p className="font-heading text-cream text-sm font-semibold">{t.name}</p>
                  <p className="font-body text-cream/50 text-xs">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
