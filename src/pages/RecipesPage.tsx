import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Clock, ChefHat, Users, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OptimizedImage from "@/components/OptimizedImage";
import { apiFetch } from "@/lib/api";

type Recipe = {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  time: string;
  difficulty: string;
  servings: string;
  ingredients: string[];
  steps: string[];
};

/* ——— Timeline Item Component ——— */
function TimelineItem({ recipe, index }: { recipe: Recipe; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const isLeft = index % 2 === 0;

  return (
    <div ref={ref} className="relative grid grid-cols-1 md:grid-cols-[1fr_60px_1fr] gap-4 md:gap-0 items-center">
      {/* Left side — content or image based on even/odd */}
      <motion.div
        initial={{ opacity: 0, x: isLeft ? -60 : 60 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.1 }}
        className={`${isLeft ? "md:pr-8" : "md:pl-8 md:col-start-3"}`}
      >
        <div className="bg-white  overflow-hidden border border-[#EAEAEA] shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition-all duration-500 group">
          <div className="relative h-56 overflow-hidden">
            <img
              src={recipe.image}
              alt={recipe.title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            <div className="absolute top-3 left-3 flex gap-2">
              <span className="font-body text-xs tracking-wider bg-[#1A4547] text-white px-3 py-1 backdrop-blur-sm font-semibold">
                {recipe.category}
              </span>
              <span className={`font-body text-xs tracking-wider px-3 py-1 backdrop-blur-sm font-semibold ${recipe.difficulty === "Easy"
                ? "bg-green-100/90 text-green-700"
                : recipe.difficulty === "Medium"
                  ? "bg-amber-100/90 text-amber-700"
                  : "bg-red-100/90 text-red-700"
                }`}>
                {recipe.difficulty}
              </span>
            </div>
          </div>
          <div className="p-6">
            <h3 className="font-heading text-lg text-[#1a1a1a] font-bold mb-2 leading-snug group-hover:text-[#1A4547] transition-colors duration-300">
              {recipe.title}
            </h3>
            <p className="font-body text-sm text-[#666] leading-relaxed mb-4">
              {recipe.excerpt}
            </p>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {recipe.ingredients.map((ing) => (
                <span key={ing} className="font-body text-[10px] tracking-wide px-2.5 py-1 bg-[#F0F7F7] text-[#1A4547] border border-[#1A4547]/20">
                  {ing}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-4 text-xs text-[#666] font-body">
              <span className="flex items-center gap-1"><Clock size={12} /> {recipe.time}</span>
              <span className="flex items-center gap-1"><Users size={12} /> {recipe.servings} servings</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Center pole node */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={isInView ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.2, type: "spring", stiffness: 200 }}
        className="hidden md:flex items-center justify-center col-start-2"
      >
        <div className="relative">
          <div className="w-4 h-4 rounded-full bg-[#C8A951] shadow-[0_0_12px_rgba(200,169,81,0.35)] z-10 relative" />
          <motion.div
            initial={{ scale: 0 }}
            animate={isInView ? { scale: [0, 1.8, 1] } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="absolute inset-0 rounded-full bg-[#C8A951]/20"
          />
        </div>
      </motion.div>

      {/* Empty space on the other side */}
      {isLeft && <div className="hidden md:block md:col-start-3" />}
      {!isLeft && <div className="hidden md:block md:col-start-1 md:row-start-1" />}
    </div>
  );
}

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/api/recipes")
      .then((res) => res.json())
      .then((data) => {
        if (data.recipes) setRecipes(data.recipes);
      })
      .catch((err) => console.error("Failed to load recipes:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ═══ Hero ═══ */}
      <section className="relative pt-10 pb-8 sm:pt-14 sm:pb-10 md:pt-20 md:pb-14 overflow-hidden bg-[#F5FAFA]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-6 right-[10%] w-40 h-40 rounded-full bg-[#1A4547]/[0.03]" />
          <div className="absolute bottom-6 left-[5%] w-32 h-32 rounded-full bg-[#1A4547]/[0.04]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-[#1A4547]/[0.02]" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <p className="font-body text-xs tracking-[0.25em] text-[#7A9A9C] uppercase mb-4">FROM OUR KITCHEN TO YOURS</p>
              <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl text-[#1A3C3E] font-bold leading-tight mb-5">
                Recipes of the <span className="italic font-normal text-[#5E8A8C]">Collection</span>
              </h1>

              {/* Image — mobile only, between heading and description */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
                className="rounded-2xl overflow-hidden border border-[#1A4547]/10 mb-6 lg:hidden">
                <OptimizedImage src="/images/FOOD/Screenshot 2026-02-13 193225.png" alt="Recipes Collection"
                  className="w-full h-auto" loading="eager" />
              </motion.div>

              <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}
                className="font-body text-[15px] md:text-base text-[#555] leading-[1.8] max-w-lg mb-8">
                Explore a curated selection of culinary art where each dish tells a story. Every dish is a tribute to our craft.
              </motion.p>
            </motion.div>

            {/* Image — desktop only */}
            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.9, delay: 0.3 }}
              className="rounded-2xl overflow-hidden border border-[#1A4547]/10 hidden lg:block">
              <OptimizedImage src="/images/FOOD/Screenshot 2026-02-13 193225.png" alt="Recipes Collection"
                className="w-full h-[400px] object-cover" loading="eager" priority={true} width={700} height={400} />
            </motion.div>
          </div>
        </div>
      </section>



      {/* ═══ Recipe Grid Section ═══ */}
      <section id="recipes" className="relative py-24 overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Section heading */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <p className="font-body text-xs tracking-[0.3em] text-[#1A4547] uppercase mb-4">The Current Menu</p>
            <h2 className="font-heading text-4xl md:text-5xl text-[#1a1a1a] font-bold mb-4 max-w-3xl">
              A Culinary Collection of Flavours and Seasonal Delights
            </h2>
          </motion.div>

          {/* Recipe Grid */}
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1A4547]"></div>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {recipes.map((recipe, idx) => (
              <motion.div
                key={recipe.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
              >
                <Link to={`/recipes/${recipe.slug}`} className="block h-full">
                  <div className="bg-white overflow-hidden border border-[#EAEAEA] shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-500 group h-full">
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={recipe.coverImage || recipe.image || "/placeholder.svg"}
                        alt={recipe.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className="font-body text-xs tracking-wider bg-[#1A4547] text-white px-3 py-1 backdrop-blur-sm font-semibold">
                          {recipe.category}
                        </span>
                        <span className={`font-body text-xs tracking-wider px-3 py-1 backdrop-blur-sm font-semibold ${recipe.difficulty === "Easy"
                          ? "bg-green-100/90 text-green-700"
                          : recipe.difficulty === "Medium"
                            ? "bg-amber-100/90 text-amber-700"
                            : "bg-red-100/90 text-red-700"
                          }`}>
                          {recipe.difficulty}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="font-heading text-lg text-[#1a1a1a] font-bold mb-2 leading-snug group-hover:text-[#1A4547] transition-colors duration-300">
                        {recipe.title}
                      </h3>
                      <p className="font-body text-sm text-[#666] leading-relaxed mb-4 line-clamp-2">
                        {recipe.excerpt}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {(recipe.tags || []).slice(0, 3).map((tag) => (
                          <span key={tag} className="font-body text-[10px] tracking-wide px-2.5 py-1 bg-[#F0F7F7] text-[#1A4547] border border-[#1A4547]/20">
                            {tag}
                          </span>
                        ))}
                        {(recipe.tags || []).length > 3 && (
                          <span className="font-body text-[10px] tracking-wide px-2.5 py-1 bg-[#F0F7F7] text-[#1A4547] border border-[#1A4547]/20">
                            +{(recipe.tags || []).length - 3} more
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-[#EAEAEA]">
                        <div className="flex items-center gap-3 text-xs text-[#666] font-body">
                          <span className="flex items-center gap-1"><Clock size={12} /> {recipe.prepTime || recipe.time}</span>
                          <span className="flex items-center gap-1"><Users size={12} /> {recipe.servings}</span>
                        </div>
                        <span className="text-[#1A4547] text-sm font-medium group-hover:gap-2 inline-flex items-center gap-1 transition-all">
                          View <ArrowRight size={14} />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══ Food Gallery Strip ═══ */}
      <section className="py-20 bg-white overflow-hidden border-y border-[#EAEAEA]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 px-6"
        >
          <p className="font-body text-xs tracking-[0.3em] text-[#1A4547] uppercase mb-4">Gallery</p>
          <h2 className="font-heading text-3xl md:text-4xl text-[#1a1a1a] font-bold">
            A Taste of Everything
          </h2>
        </motion.div>

        {/* Infinite scroll strip */}
        <div className="relative overflow-hidden">
          <motion.div
            animate={{ x: [0, -2880] }}
            transition={{ duration: 60, ease: "linear", repeat: Infinity }}
            className="flex gap-4"
          >
            {[
              "/images/FOOD/Screenshot 2026-02-13 193211.png",
              "/images/FOOD/Screenshot 2026-02-13 193217.png",
              "/images/FOOD/Screenshot 2026-02-13 193225.png",
              "/images/FOOD/Screenshot 2026-02-13 193230.png",
              "/images/FOOD/Screenshot 2026-02-13 193238.png",
              "/images/FOOD/Screenshot 2026-02-13 193244.png",
              "/images/FOOD/Screenshot 2026-02-13 193251.png",
              "/images/FOOD/Screenshot 2026-02-13 193257.png",
              "/images/FOOD/Screenshot 2026-02-13 193506.png",
              "/images/FOOD/Screenshot 2026-02-13 193512.png",
              "/images/FOOD/Screenshot 2026-02-13 193547.png",
              "/images/FOOD/Screenshot 2026-02-13 193553.png",
              "/images/FOOD/Screenshot 2026-02-13 193602.png",
              "/images/FOOD/Screenshot 2026-02-13 193610.png",
              "/images/FOOD/Screenshot 2026-02-13 193622.png",
              "/images/FOOD/Screenshot 2026-02-13 193628.png",
              "/images/FOOD/Screenshot 2026-02-13 193633.png",
              "/images/FOOD/Screenshot 2026-02-13 193639.png",
              "/images/FOOD/Screenshot 2026-02-13 193211.png",
              "/images/FOOD/Screenshot 2026-02-13 193217.png",
              "/images/FOOD/Screenshot 2026-02-13 193225.png",
              "/images/FOOD/Screenshot 2026-02-13 193230.png",
              "/images/FOOD/Screenshot 2026-02-13 193238.png",
              "/images/FOOD/Screenshot 2026-02-13 193244.png",
              "/images/FOOD/Screenshot 2026-02-13 193251.png",
              "/images/FOOD/Screenshot 2026-02-13 193257.png",
              "/images/FOOD/Screenshot 2026-02-13 193506.png",
              "/images/FOOD/Screenshot 2026-02-13 193512.png",
            ].map((src, i) => (
              <div key={i} className="shrink-0 w-48 h-48  overflow-hidden group">
                <img
                  src={src}
                  alt={`Food gallery ${i + 1}`}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Contributing section */}
      <section className="py-20 bg-[#EFF7F7]">
        <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <ChefHat className="text-[#1A4547] mx-auto mb-6" size={48} />
            <h2 className="font-heading text-3xl md:text-4xl text-[#1a1a1a] font-bold mb-4">
              Contributing to the Archives
            </h2>
            <p className="font-body text-[#666] leading-relaxed max-w-lg mx-auto text-base mb-8">
              Have a family recipe that deserves to be shared? We&apos;re building a community of food lovers and storytellers. Submit your recipe and we may feature it in our collection.
            </p>
            <a
              href="mailto:recipes@ingri.world?subject=Recipe%20Submission"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#1A4547] text-white font-body text-sm tracking-wide rounded-lg hover:bg-[#123133] transition-colors shadow-sm"
            >
              Submit Your Recipe
            </a>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
