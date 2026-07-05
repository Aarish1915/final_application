import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock, User, Search, ChevronDown } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { HARDCODED_POSTS, BlogPostItem } from "@/data/blogData";
import { apiUrl } from "@/lib/api";


export default function BlogPage() {
    const heroRef = useRef(null);
    const heroInView = useInView(heroRef, { once: true });

    const [blogCategory, setBlogCategory] = useState("All Stories");
    const [blogPosts, setBlogPosts] = useState<BlogPostItem[]>(HARDCODED_POSTS);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchInput, setSearchInput] = useState("");
    const [mobileCatOpen, setMobileCatOpen] = useState(false);
    const postsPerPage = 9;

    const fetchBlogs = useCallback(async () => {
        try {
            const res = await fetch(apiUrl(`/api/blogs`));
            if (res.ok) {
                const data = await res.json();
                const apiPosts = data.blogs || data || [];
                setBlogPosts([...apiPosts, ...HARDCODED_POSTS]);
            }
        } catch {
            console.log("Using hardcoded blog posts");
        }
    }, []);

    useEffect(() => { fetchBlogs(); }, [fetchBlogs]);
    useEffect(() => { document.title = "The Journal — Ingri"; }, []);

    const formatDate = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }).toUpperCase();
        } catch { return dateStr; }
    };

    const allCategories = Array.from(new Set(blogPosts.map((p) => p.category).filter(Boolean)));
    const blogCategories = ["All Stories", ...allCategories];

    const filteredPosts = blogCategory === "All Stories"
        ? blogPosts
        : blogPosts.filter(p => p.category === blogCategory);

    // Search filter
    const searchedPosts = searchInput
        ? filteredPosts.filter(p => p.title.toLowerCase().includes(searchInput.toLowerCase()) || p.excerpt.toLowerCase().includes(searchInput.toLowerCase()))
        : filteredPosts;

    const featuredPost = searchedPosts.find((p) => p.featured) || searchedPosts[0];
    const regularPosts = searchedPosts.filter((p) => p._id !== featuredPost?._id);

    const totalPages = Math.ceil(regularPosts.length / postsPerPage);
    const currentPosts = regularPosts.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage);

    useEffect(() => { setCurrentPage(1); }, [blogCategory, searchInput]);

    useEffect(() => {
        if (currentPage > 1) {
            document.getElementById('blog-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [currentPage]);

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        if (totalPages <= 7) { for (let i = 1; i <= totalPages; i++) pages.push(i); }
        else {
            pages.push(1);
            if (currentPage > 3) pages.push('...');
            for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
            if (currentPage < totalPages - 2) pages.push('...');
            pages.push(totalPages);
        }
        return pages;
    };

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            {/* â”€â”€ JOURNAL HERO (same bg as RecipesPage: #EFF7F7, no logo image) â”€â”€ */}
            {/* ── JOURNAL HERO ── */}
            <section className="relative pt-10 pb-8 sm:pt-14 sm:pb-10 md:pt-20 md:pb-14 overflow-hidden bg-[#F5FAFA]">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-6 right-[10%] w-40 h-40 rounded-full bg-[#1A4547]/[0.03]" />
                    <div className="absolute bottom-6 left-[5%] w-32 h-32 rounded-full bg-[#1A4547]/[0.04]" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-[#1A4547]/[0.02]" />
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
                        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                            <p className="font-body text-xs tracking-[0.25em] text-[#7A9A9C] uppercase mb-4">ARCHIVES & INSIGHTS</p>
                            <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl text-[#1A3C3E] font-bold leading-tight mb-5">
                                The <span className="italic font-normal text-[#5E8A8C]">Journal</span>
                            </h1>

                            {/* Image — mobile only */}
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
                                className="rounded-2xl overflow-hidden border border-[#1A4547]/10 mb-6 lg:hidden">
                                <img src="/images/AMBIANCE/Screenshot 2026-02-13 192813.png" alt="The Journal" className="w-full h-auto" />
                            </motion.div>

                            <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}
                                className="font-body text-[15px] md:text-base text-[#555] leading-[1.8] max-w-lg mb-8">
                                A curated space where we explore the intersection of classical art, seasonal heritage, and the culinary stories that breathe life into Ingri.
                            </motion.p>
                        </motion.div>

                        {/* Image — desktop only */}
                        <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.9, delay: 0.3 }}
                            className="rounded-2xl overflow-hidden border border-[#1A4547]/10 hidden lg:block">
                            <img src="/images/AMBIANCE/Screenshot 2026-02-13 192813.png" alt="The Journal"
                                className="w-full h-[400px] object-cover" />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* â”€â”€ EDITOR'S CHOICE â€” single big image + content side by side â”€â”€ */}
            {featuredPost && (
                <section className="py-16 lg:py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        {/* Section label */}
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-8 h-[2px] bg-[#1a1a1a]" />
                            <span className="font-body text-xs tracking-[0.25em] uppercase text-[#1a1a1a]">Editor's Choice</span>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-0 border border-[#E5E5E5]">
                            {/* Big image */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                className="relative h-[350px] lg:h-[480px] overflow-hidden bg-[#F0F0F0]"
                            >
                                <img
                                    src={featuredPost.coverImage}
                                    alt={featuredPost.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-4 left-4">
                                    <span className="inline-block bg-[#1A4547] text-white text-xs font-medium px-4 py-1.5">
                                        {featuredPost.category}
                                    </span>
                                </div>
                            </motion.div>

                            {/* Content */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.15 }}
                                className="flex flex-col justify-center p-8 lg:p-12"
                            >
                                <div className="flex items-center gap-3 text-xs text-[#999] font-body mb-5">
                                    <span>{formatDate(featuredPost.publishedAt)}</span>
                                    <span className="text-[#1A4547]">â—†</span>
                                    <span>{featuredPost.readTime || "5 min read"}</span>
                                </div>

                                <h2 className="font-heading text-2xl lg:text-3xl text-[#1a1a1a] font-bold mb-4 leading-snug">
                                    {featuredPost.title}
                                </h2>

                                <p className="font-body text-[#666] text-base leading-relaxed mb-8">
                                    {featuredPost.excerpt}
                                </p>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-[#E8E0D4] flex items-center justify-center">
                                            <User size={16} className="text-[#1A4547]" />
                                        </div>
                                        <span className="font-body text-sm text-[#1a1a1a]">{featuredPost.author}</span>
                                    </div>

                                    <Link
                                        to={`/blog/${featuredPost.slug}`}
                                        className="inline-flex items-center gap-2 bg-[#1A4547] text-white font-body text-sm px-6 py-3 hover:bg-[#143638] transition-colors"
                                    >
                                        Read Story
                                    </Link>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>
            )}

            {/* â”€â”€ CATEGORY FILTERS + SEARCH (single line, mobile dropdown) â”€â”€ */}
            <section id="blog-grid" className="py-5 bg-[#F5F5F0] border-y border-[#E5E5E5]">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">

                    {/* Desktop: single row with all buttons + search */}
                    <div className="hidden md:flex items-center gap-3">
                        {blogCategories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setBlogCategory(cat)}
                                className={`px-5 py-2.5 font-body text-sm tracking-wide transition-all border whitespace-nowrap ${
                                    blogCategory === cat
                                        ? "bg-[#1A4547] text-white border-[#1A4547]"
                                        : "bg-white text-[#555] border-[#E5E5E5] hover:border-[#1A4547] hover:text-[#1A4547]"
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                        <div className="relative ml-auto">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#BBB]" />
                            <input
                                type="text"
                                placeholder="Search the archives..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className="pl-9 pr-4 py-2.5 border border-[#E5E5E5] bg-white font-body text-sm text-[#1a1a1a] placeholder:text-[#BBB] focus:outline-none focus:border-[#1A4547] transition-colors w-52"
                            />
                        </div>
                    </div>

                    {/* Mobile: dropdown + search */}
                    <div className="md:hidden flex items-center gap-3">
                        <div className="relative flex-1">
                            <button
                                onClick={() => setMobileCatOpen(!mobileCatOpen)}
                                className="w-full flex items-center justify-between px-4 py-2.5 border border-[#E5E5E5] bg-white font-body text-sm text-[#1a1a1a]"
                            >
                                <span>{blogCategory}</span>
                                <ChevronDown size={16} className={`text-[#999] transition-transform ${mobileCatOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {mobileCatOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setMobileCatOpen(false)} />
                                    <div className="absolute left-0 right-0 top-full mt-1 z-20 bg-white border border-[#E5E5E5] shadow-lg max-h-64 overflow-y-auto">
                                        {blogCategories.map((cat) => (
                                            <button
                                                key={cat}
                                                onClick={() => { setBlogCategory(cat); setMobileCatOpen(false); }}
                                                className={`w-full text-left px-4 py-2.5 font-body text-sm transition-colors ${
                                                    blogCategory === cat ? "bg-[#1A4547] text-white" : "text-[#555] hover:bg-[#F8F8F8]"
                                                }`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="relative flex-1">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#BBB]" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 border border-[#E5E5E5] bg-white font-body text-sm text-[#1a1a1a] placeholder:text-[#BBB] focus:outline-none focus:border-[#1A4547] transition-colors"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* â”€â”€ BLOG GRID â”€â”€ */}
            <section className="py-14 bg-white">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    {regularPosts.length === 0 ? (
                        <div className="text-center py-20 border border-[#E5E5E5]">
                            <div className="text-[#CCC] mb-4 text-5xl">ðŸ“–</div>
                            <h3 className="font-heading text-xl text-[#1a1a1a] font-semibold mb-2">No articles found</h3>
                            <p className="font-body text-sm text-[#999]">Try selecting a different category or search term.</p>
                        </div>
                    ) : (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
                            {currentPosts.map((post, idx) => (
                                <motion.div
                                    key={post._id}
                                    initial={{ opacity: 0, y: 16 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-50px" }}
                                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                                >
                                <Link
                                        to={`/blog/${post.slug}`}
                                        className="group block h-full w-full text-left bg-white border border-[#E5E5E5] overflow-hidden hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300"
                                    >
                                        {post.coverImage && (
                                            <div className="relative h-52 overflow-hidden bg-[#F0F0F0]">
                                                <img
                                                    src={post.coverImage}
                                                    alt={post.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                                <div className="absolute top-3 left-3">
                                                    <span className="inline-block bg-[#1A4547] text-white text-[10px] font-medium tracking-wider uppercase px-3 py-1.5">
                                                        {post.category}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                        <div className="p-5">
                                            <div className="flex items-center gap-2 text-[10px] text-[#999] font-body tracking-wider uppercase mb-3">
                                                <span>{formatDate(post.publishedAt)}</span>
                                                <span className="text-[#1A4547]">â—†</span>
                                                <span>{post.readTime || "5 min read"}</span>
                                            </div>
                                            <h3 className="font-heading text-base text-[#1a1a1a] font-bold mb-2 group-hover:text-[#1A4547] transition-colors line-clamp-2 leading-snug">
                                                {post.title}
                                            </h3>
                                            <p className="font-body text-sm text-[#777] mb-4 line-clamp-3 leading-relaxed">
                                                {post.excerpt}
                                            </p>
                                            <div className="flex items-center justify-between pt-3 border-t border-[#F0F0F0]">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-full bg-[#E8E0D4] flex items-center justify-center">
                                                        <User size={12} className="text-[#1A4547]" />
                                                    </div>
                                                    <span className="font-body text-xs text-[#666]">{post.author}</span>
                                                </div>
                                                <span className="text-[#1A4547] text-xs font-body font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                                                    Read <ArrowRight size={12} />
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-12">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className={`px-4 py-2 font-body text-sm transition-colors border ${
                                    currentPage === 1 ? 'bg-[#F5F5F5] text-[#CCC] border-[#E5E5E5] cursor-not-allowed' : 'bg-white border-[#E5E5E5] text-[#1a1a1a] hover:border-[#1A4547]'
                                }`}
                            >
                                Previous
                            </button>
                            {getPageNumbers().map((page, idx) => (
                                page === '...' ? (
                                    <span key={`ellipsis-${idx}`} className="text-[#CCC] px-2">...</span>
                                ) : (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page as number)}
                                        className={`w-10 h-10 font-body text-sm font-medium transition-colors ${
                                            currentPage === page
                                                ? 'bg-[#1A4547] text-white'
                                                : 'border border-[#E5E5E5] text-[#1a1a1a] hover:border-[#1A4547]'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                )
                            ))}
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className={`px-4 py-2 font-body text-sm transition-colors border ${
                                    currentPage === totalPages ? 'bg-[#F5F5F5] text-[#CCC] border-[#E5E5E5] cursor-not-allowed' : 'bg-white border-[#E5E5E5] text-[#1a1a1a] hover:border-[#1A4547]'
                                }`}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* â”€â”€ NEWSLETTER â”€â”€ */}
            <section className="bg-[#1A4547] py-16">
                <div className="max-w-3xl mx-auto px-6 text-center">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                        <h2 className="font-heading text-3xl md:text-4xl text-white font-bold mb-4">
                            Never miss a story from the gallery.
                        </h2>
                        <p className="font-body text-white/70 text-base mb-8">
                            Subscribe to our newsletter and get the latest stories, recipes, and updates delivered to your inbox.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
                            <input
                                type="email"
                                placeholder="Email address"
                                className="flex-1 px-5 py-3.5 bg-white/10 border border-white/20 text-white placeholder-white/50 font-body text-sm focus:outline-none focus:border-white/40 backdrop-blur-sm"
                            />
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="bg-white text-[#1A4547] font-body text-sm px-8 py-3.5 hover:bg-white/90 transition-all font-semibold tracking-wide"
                            >
                                SUBSCRIBE
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
