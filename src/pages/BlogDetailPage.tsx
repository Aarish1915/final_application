import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Calendar, Tag, ChevronRight, User as UserIcon } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { HARDCODED_POSTS } from "@/data/blogData";
import { apiUrl } from "@/lib/api";

/* Convert simple **heading** markdown to renderable HTML */
function markdownToHtml(text: string): string {
  return text
    .split("\n\n")
    .map((para) => {
      if (para.startsWith("**") && para.endsWith("**"))
        return `<h3 class="font-heading text-2xl text-[#333] font-bold mt-8 mb-4">${para.replace(/\*\*/g, "")}</h3>`;
      return `<p class="font-body text-[#555] leading-relaxed mb-4">${para}</p>`;
    })
    .join("");
}

type BlogPost = {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  tags: string[];
  author: string;
  seoTitle: string;
  seoDescription: string;
  publishedAt: string;
};

type RelatedPost = {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  category: string;
  publishedAt: string;
};

export default function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [related, setRelated] = useState<RelatedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [postError, setPostError] = useState("");

  const parseError = async (res: Response) => {
    const requestId = res.headers.get("X-Request-Id") || "";
    try {
      const data = await res.json();
      const message = data?.details || data?.error || res.statusText || "Request failed";
      return { message, requestId };
    } catch {
      return { message: res.statusText || "Request failed", requestId };
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchPost = async () => {
      setLoading(true);
      setPostError("");
      try {
        const res = await fetch(apiUrl(`/api/blogs/${slug}`));
        if (!res.ok) {
          // Fall back to hardcoded posts
          const hardcoded = HARDCODED_POSTS.find((p) => p.slug === slug);
          if (hardcoded) {
            setPost({
              _id: hardcoded._id,
              title: hardcoded.title,
              slug: hardcoded.slug,
              excerpt: hardcoded.excerpt,
              content: markdownToHtml(hardcoded.content || ""),
              coverImage: hardcoded.coverImage,
              category: hardcoded.category,
              tags: hardcoded.tags,
              author: hardcoded.author,
              seoTitle: hardcoded.title,
              seoDescription: hardcoded.excerpt,
              publishedAt: hardcoded.publishedAt,
            });
            // Related: same category, excluding current
            const rel = HARDCODED_POSTS.filter(
              (p) => p.category === hardcoded.category && p.slug !== slug
            ).slice(0, 3);
            setRelated(rel.map((p) => ({
              _id: p._id, title: p.title, slug: p.slug,
              excerpt: p.excerpt, coverImage: p.coverImage,
              category: p.category, publishedAt: p.publishedAt,
            })));
          } else {
            const err = await parseError(res);
            setPostError(err.requestId ? `${err.message} (ref: ${err.requestId})` : err.message);
            setPost(null);
            setRelated([]);
          }
          return;
        }
        const data = await res.json();
        setPost(data.blog || data);
        setRelated(data.related || []);
      } catch (err) {
        // Network error — try hardcoded
        const hardcoded = HARDCODED_POSTS.find((p) => p.slug === slug);
        if (hardcoded) {
          setPost({
            _id: hardcoded._id,
            title: hardcoded.title,
            slug: hardcoded.slug,
            excerpt: hardcoded.excerpt,
            content: markdownToHtml(hardcoded.content || ""),
            coverImage: hardcoded.coverImage,
            category: hardcoded.category,
            tags: hardcoded.tags,
            author: hardcoded.author,
            seoTitle: hardcoded.title,
            seoDescription: hardcoded.excerpt,
            publishedAt: hardcoded.publishedAt,
          });
          const rel = HARDCODED_POSTS.filter(
            (p) => p.category === hardcoded.category && p.slug !== slug
          ).slice(0, 3);
          setRelated(rel.map((p) => ({
            _id: p._id, title: p.title, slug: p.slug,
            excerpt: p.excerpt, coverImage: p.coverImage,
            category: p.category, publishedAt: p.publishedAt,
          })));
        } else {
          const msg = err instanceof Error ? err.message : "Unable to load blog";
          setPostError(msg);
          setPost(null);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

  /* ─── Update document head for SEO ─── */
  useEffect(() => {
    if (!post) return;
    document.title = post.seoTitle || post.title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", post.seoDescription || post.excerpt);
    else {
      const meta = document.createElement("meta");
      meta.name = "description";
      meta.content = post.seoDescription || post.excerpt;
      document.head.appendChild(meta);
    }
  }, [post]);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });
    } catch {
      return dateStr;
    }
  };

  const readingTime = post ? Math.max(1, Math.ceil(post.content.split(/\s+/).length / 200)) : 0;

  /* ─── LOADING ─── */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 lg:px-8 py-16 animate-pulse">
          <div className="h-4 w-24 bg-[#F0F0F0] rounded mb-6" />
          <div className="h-10 w-3/4 bg-[#F0F0F0] rounded mb-4" />
          <div className="h-4 w-48 bg-[#F0F0F0] rounded mb-8" />
          <div className="h-80 bg-[#F0F0F0] rounded-2xl mb-8" />
          <div className="space-y-3">
            <div className="h-4 bg-[#F0F0F0] rounded" />
            <div className="h-4 bg-[#F0F0F0] rounded w-5/6" />
            <div className="h-4 bg-[#F0F0F0] rounded w-4/6" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  /* ─── NOT FOUND ─── */
  if (!post) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-24 text-center">
          <h1 className="font-heading text-3xl text-[#333] font-bold mb-4">Post Not Found</h1>
          <p className="font-body text-[#333]/50 mb-6">The blog post you're looking for doesn't exist or has been removed.</p>
          {postError && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 font-body">
              {postError}
            </div>
          )}
          <Link to="/blog" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#333] text-white font-body text-sm hover:bg-[#C8A951] transition-all">
            <ArrowLeft size={16} /> Back to Blog
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />

      {/* ─── Breadcrumbs ─── */}
      <div className="bg-white border-b border-[#EAEAEA]">
        <div className="max-w-3xl mx-auto px-4 lg:px-8 py-3 flex items-center gap-2 font-body text-xs text-[#333]/40">
          <Link to="/" className="hover:text-[#C8A951] transition-colors">Home</Link>
          <ChevronRight size={12} />
          <Link to="/blog" className="hover:text-[#C8A951] transition-colors">Blog</Link>
          <ChevronRight size={12} />
          <span className="text-[#333]/60 truncate">{post.title}</span>
        </div>
      </div>

      {/* ─── Article ─── */}
      <article className="max-w-3xl mx-auto px-4 lg:px-8 py-12">
        {/* Meta */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#C8A951]/10 font-body text-xs text-[#C8A951] font-medium">
              <Tag size={11} /> {post.category}
            </span>
            <span className="inline-flex items-center gap-1 font-body text-xs text-[#333]/40">
              <Calendar size={11} /> {formatDate(post.publishedAt)}
            </span>
            <span className="inline-flex items-center gap-1 font-body text-xs text-[#333]/40">
              <Clock size={11} /> {readingTime} min read
            </span>
          </div>

          <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl text-[#333] font-bold leading-tight mb-4">
            {post.title}
          </h1>

          <p className="font-body text-lg text-[#333]/50 mb-6 leading-relaxed">{post.excerpt}</p>

          <div className="flex items-center gap-3 mb-8 pb-8 border-b border-[#EAEAEA]">
            <div className="w-10 h-10 rounded-full bg-[#C8A951]/10 border border-[#C8A951]/30 flex items-center justify-center">
              <UserIcon size={16} className="text-[#C8A951]" />
            </div>
            <div>
              <p className="font-heading text-sm text-[#333] font-semibold">{post.author || "INGRI Team"}</p>
              <p className="font-body text-xs text-[#333]/40">Author</p>
            </div>
          </div>
        </motion.div>

        {/* Cover Image */}
        {post.coverImage && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-10 rounded-2xl overflow-hidden border border-[#EAEAEA] shadow-sm">
            <img src={post.coverImage} alt={post.title} className="w-full h-auto" />
          </motion.div>
        )}

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="prose prose-lg max-w-none
            prose-headings:font-heading prose-headings:text-[#333] prose-headings:font-bold
            prose-p:font-body prose-p:text-[#333]/65 prose-p:leading-relaxed
            prose-a:text-[#C8A951] prose-a:no-underline hover:prose-a:underline
            prose-strong:text-[#333]
            prose-img:rounded-xl prose-img:border prose-img:border-[#EAEAEA]
            prose-blockquote:border-l-[#C8A951] prose-blockquote:bg-[#FAFAFA] prose-blockquote:py-2 prose-blockquote:rounded-r-xl
            prose-li:font-body prose-li:text-[#333]/65"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-10 pt-8 border-t border-[#EAEAEA]">
            <p className="font-body text-xs text-[#333]/40 mb-3 uppercase tracking-wider">Tags</p>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span key={tag} className="px-3 py-1.5 rounded-full bg-[#F8F8F8] border border-[#EAEAEA] font-body text-xs text-[#333]/50">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </article>

      {/* ─── Related Posts ─── */}
      {related.length > 0 && (
        <section className="bg-gradient-to-b from-white to-[#FFF7EC] border-t border-[#EAEAEA] py-16">
          <div className="max-w-6xl mx-auto px-4 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
              <div>
                <p className="font-body text-xs tracking-[0.25em] text-[#C8A951] uppercase">Continue reading</p>
                <h2 className="font-heading text-2xl md:text-3xl text-[#333] font-bold mt-2">Related Articles</h2>
              </div>
              <Link to="/blog" className="font-body text-sm text-[#333]/60 hover:text-[#C8A951] transition-colors">
                View all articles
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((rp, i) => (
                <motion.div
                  key={rp._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.08 }}
                >
                  <Link
                    to={`/blog/${rp.slug}`}
                    className="group block bg-white rounded-2xl overflow-hidden border border-[#EAEAEA] hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                  >
                    {rp.coverImage && (
                      <div className="h-44 overflow-hidden bg-[#F0F0F0]">
                        <img
                          src={rp.coverImage}
                          alt={rp.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="p-5">
                      <p className="font-body text-[10px] text-[#C8A951] tracking-wider uppercase mb-2">
                        {rp.category}
                      </p>
                      <h3 className="font-heading text-base text-[#333] font-semibold group-hover:text-[#C8A951] transition-colors line-clamp-2">
                        {rp.title}
                      </h3>
                      <p className="font-body text-xs text-[#333]/40 mt-2 line-clamp-2">
                        {rp.excerpt}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
