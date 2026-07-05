import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Star } from "lucide-react";

const chefPicks = [
  {
    name: "Truffle Mushroom Risotto",
    category: "SIGNATURE",
    price: "₹695",
    desc: "Arborio rice, wild mushrooms, truffle oil, parmesan",
    signature: true,
    image: "https://ingri-assests.s3.ap-south-1.amazonaws.com/FOOD/Ingri%40Museo+Apr25-107.jpg",
  },
  {
    name: "Smoked Salmon Tartine",
    category: "STARTERS",
    price: "₹545",
    desc: "Sourdough, cream cheese, capers, fresh dill",
    signature: true,
    image: "https://ingri-assests.s3.ap-south-1.amazonaws.com/FOOD/Ingri%40Museo+Apr25-53.jpg",
  },
  {
    name: "Matcha Latte Artisan",
    category: "BEVERAGES",
    price: "₹345",
    desc: "Ceremonial grade matcha, oat milk, art pour",
    signature: true,
    image: "https://ingri-assests.s3.ap-south-1.amazonaws.com/FOOD/Ingri%40Museo+Apr25-95.jpg",
  },
  {
    name: "Berry Pavlova",
    category: "DESSERTS",
    price: "₹445",
    desc: "Crisp meringue, fresh berries, chantilly cream",
    signature: true,
    image: "https://ingri-assests.s3.ap-south-1.amazonaws.com/FOOD/Ingri%40Museo+Apr25-89.jpg",
  },
];

export default function MenuPreviewSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="section-snap flex items-center bg-white relative">
      <div className="absolute top-0 left-0 right-0 h-16 bg-background" style={{ borderRadius: "0 0 50% 50%" }} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-16 py-14 sm:py-20 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-14"
        >
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl text-emerald-deep font-bold mb-3">
            Chef's Recommendations
          </h2>
          <div className="w-16 h-[2px] bg-gold mx-auto mb-4" />
          <p className="font-body text-emerald-dark/60 text-base">
            Signature dishes crafted with passion and precision
          </p>
        </motion.div>

        {/* Cards grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {chefPicks.map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
              className="bg-emerald-deep/95 backdrop-blur-sm rounded-2xl overflow-hidden gold-border hover:gold-glow hover:-translate-y-1 transition-all duration-300 group"
            >
              {/* Image area */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-deep/70 via-transparent to-transparent" />
                {item.signature && (
                  <span className="absolute top-3 right-3 flex items-center gap-1 bg-gold/90 text-emerald-deep font-heading text-xs tracking-wider px-3 py-1 rounded-full">
                    <Star size={12} fill="currentColor" /> Signature
                  </span>
                )}
              </div>

              <div className="p-5">
                <p className="font-heading text-xs tracking-[0.2em] text-gold mb-1">{item.category}</p>
                <h3 className="font-heading text-lg text-cream font-semibold mb-1">{item.name}</h3>
                <p className="font-body text-cream/50 text-sm mb-3">{item.desc}</p>
                <p className="font-heading text-gold text-xl font-bold">{item.price}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
          className="text-center mt-10"
        >
          <a
            href="/menu"
            className="inline-block font-heading text-sm tracking-[0.2em] px-8 py-3 rounded-full border border-emerald-deep text-emerald-deep hover:bg-emerald-deep hover:text-cream transition-all duration-300"
          >
            EXPLORE FULL MENU
          </a>
        </motion.div>
      </div>
    </section>
  );
}
