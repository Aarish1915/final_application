import { useParams, Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { ArrowLeft, Clock, Users, ChefHat, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { apiFetch } from "@/lib/api";

type Recipe = {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  content?: string;
  image?: string;
  coverImage?: string;
  category: string;
  time?: string;
  prepTime?: string;
  difficulty?: string;
  servings?: string;
  ingredients?: string[];
  steps?: string[];
  tags?: string[];
};

export default function RecipeDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true });
  const stepsRef = useRef(null);
  const stepsInView = useInView(stepsRef, { once: true, margin: "-60px" });

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch(`/api/recipes/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => setRecipe(data.recipe))
      .catch((err) => {
        console.error(err);
        setRecipe(null);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF7]">
        <Navbar />
        <div className="flex justify-center items-center h-96">Loading...</div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-[#FAFAF7]">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-40">
          <h1 className="font-heading text-3xl text-[#1a1a1a] font-bold mb-4">Recipe Not Found</h1>
          <p className="font-body text-[#666] mb-8">The recipe you're looking for doesn't exist.</p>
          <Link
            to="/recipes"
            className="inline-flex items-center gap-2 bg-[#1A4547] text-white font-heading text-sm px-8 py-3.5 hover:bg-[#143638] transition-all"
          >
            <ArrowLeft size={16} /> Back to Recipes
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // We temporarily disable related recipes or fetch them if needed
  const relatedRecipes: Recipe[] = [];

  return (
    <div className="min-h-screen bg-[#FAFAF7]">
      <Navbar />

      {/* Hero Section */}
      <section ref={heroRef} className="relative h-[50vh] sm:h-[60vh] lg:h-[65vh] overflow-hidden">
        <img
          src={recipe.coverImage || recipe.image || "/placeholder.svg"}
          alt={recipe.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={heroInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 lg:p-16"
        >
          <div className="max-w-5xl mx-auto">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-white/70 text-sm font-body mb-4">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <span>/</span>
              <Link to="/recipes" className="hover:text-white transition-colors">Recipes</Link>
              <span>/</span>
              <span className="text-white">{recipe.title}</span>
            </nav>

            <div className="flex flex-wrap gap-2 mb-3">
              <span className="bg-[#1A4547] text-white text-xs font-semibold px-3 py-1">
                {recipe.category}
              </span>
              <span className={`text-xs font-semibold px-3 py-1 ${
                recipe.difficulty === "Easy"
                  ? "bg-green-100/90 text-green-700"
                  : recipe.difficulty === "Medium"
                    ? "bg-amber-100/90 text-amber-700"
                    : "bg-red-100/90 text-red-700"
              }`}>
                {recipe.difficulty}
              </span>
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-white font-bold leading-tight">
              {recipe.title}
            </h1>
          </div>
        </motion.div>
      </section>

      {/* Meta Bar */}
      <section className="bg-white border-b border-[#EAEAEA]">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 py-5">
          <div className="flex flex-wrap items-center gap-6 text-sm text-[#666] font-body">
            <span className="flex items-center gap-2">
              <Clock size={16} className="text-[#1A4547]" />
              {recipe.prepTime || recipe.time}
            </span>
            <span className="flex items-center gap-2">
              <Users size={16} className="text-[#1A4547]" />
              {recipe.servings} servings
            </span>
            <span className="flex items-center gap-2">
              <ChefHat size={16} className="text-[#1A4547]" />
              {recipe.difficulty}
            </span>
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="py-10 bg-[#FAFAF7]">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="font-body text-lg text-[#444] leading-relaxed max-w-3xl"
          >
            {recipe.excerpt}
          </motion.p>
        </div>
      </section>

      {/* Ingredients & Steps */}
      <section ref={stepsRef} className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1fr_2fr] gap-12">
            {/* Ingredients */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={stepsInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-heading text-2xl text-[#1a1a1a] font-bold mb-6 flex items-center gap-3">
                <ChefHat size={24} className="text-[#1A4547]" />
                Tags & Details
              </h2>
              <ul className="space-y-3">
                {(recipe.tags || recipe.ingredients || []).map((ing, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={stepsInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                    className="flex items-center gap-3 font-body text-[#444]"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#C8A951] shrink-0" />
                    {ing}
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Steps */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={stepsInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h2 className="font-heading text-2xl text-[#1a1a1a] font-bold mb-6">
                Instructions
              </h2>
              {recipe.content ? (
                <div className="font-body text-[#444] leading-relaxed prose max-w-none" dangerouslySetInnerHTML={{ __html: recipe.content }} />
              ) : recipe.steps && recipe.steps.length > 0 ? (
                <ol className="space-y-6">
                  {recipe.steps.map((step, idx) => (
                    <motion.li
                      key={idx}
                      initial={{ opacity: 0, y: 15 }}
                      animate={stepsInView ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.4, delay: 0.15 + idx * 0.08 }}
                      className="flex gap-4"
                    >
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#F0F7F7] text-[#1A4547] border border-[#1A4547]/20 flex items-center justify-center text-sm font-bold">
                        {idx + 1}
                      </span>
                      <p className="font-body text-[#444] leading-relaxed pt-1">
                        {step}
                      </p>
                    </motion.li>
                  ))}
                </ol>
              ) : (
                <p className="font-body text-[#999] italic">
                  Instructions are coming soon. Check back later!
                </p>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Related Recipes */}
      {relatedRecipes.length > 0 && (
        <section className="py-20 bg-[#EFF7F7]">
          <div className="max-w-5xl mx-auto px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-10"
            >
              <p className="font-body text-xs tracking-[0.3em] text-[#1A4547] uppercase mb-3">More from {recipe.category}</p>
              <h2 className="font-heading text-3xl text-[#1a1a1a] font-bold">
                Related Recipes
              </h2>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedRecipes.map((r, idx) => (
                <motion.div
                  key={r.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                >
                  <Link to={`/recipes/${r.slug}`} className="group block">
                    <div className="bg-white overflow-hidden border border-[#EAEAEA] shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-500 h-full flex flex-col">
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={r.coverImage || r.image || "/placeholder.svg"}
                          alt={r.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                        <span className="absolute top-3 left-3 bg-[#1A4547] text-white text-xs font-semibold px-3 py-1">
                          {r.category}
                        </span>
                      </div>
                      <div className="p-5 flex flex-col flex-grow">
                        <h3 className="font-heading text-base text-[#1a1a1a] font-bold mb-2 group-hover:text-[#1A4547] transition-colors">
                          {r.title}
                        </h3>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {(r.tags || []).slice(0, 3).map((tag) => (
                            <span key={tag} className="font-body text-[9px] px-2 py-0.5 bg-[#F0F7F7] text-[#1A4547] border border-[#1A4547]/20">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-[#666] font-body mt-auto pt-3 border-t border-[#EAEAEA]">
                          <span className="flex items-center gap-1"><Clock size={12} /> {r.prepTime || r.time}</span>
                          <span className="flex items-center gap-1"><Users size={12} /> {r.servings}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-10">
              <Link
                to="/recipes"
                className="inline-flex items-center gap-2 text-[#1A4547] font-heading text-sm hover:gap-3 transition-all"
              >
                View All Recipes <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Back to Recipes */}
      <section className="py-12 bg-[#FAFAF7] border-t border-[#EAEAEA]">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 text-center">
          <Link
            to="/recipes"
            className="inline-flex items-center gap-2 bg-[#1A4547] text-white font-heading text-sm px-8 py-3.5 hover:bg-[#143638] transition-all shadow-lg"
          >
            <ArrowLeft size={16} /> Back to All Recipes
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
