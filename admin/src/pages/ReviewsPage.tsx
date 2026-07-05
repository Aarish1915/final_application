import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { adminFetch } from "../App";
import { Search, Trash2, Star, MessageSquare, Filter, Plus, Edit2, X, Loader2, ChevronUp, ChevronDown } from "lucide-react";

interface ReviewItem {
  _id: string;
  productId: { _id: string; name: string; image: string } | string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
}

interface SiteReview {
  _id: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  active: boolean;
  displayOrder?: number;
  createdAt: string;
}

type SiteReviewForm = { userName: string; rating: number; title: string; comment: string; active: boolean; displayOrder: number };
const emptySiteForm: SiteReviewForm = { userName: "", rating: 5, title: "", comment: "", active: true, displayOrder: 0 };

export default function ReviewsPage() {
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState<"product" | "site">(searchParams.get("tab") === "site" ? "site" : "product");

  useEffect(() => {
    setTab(searchParams.get("tab") === "site" ? "site" : "product");
  }, [searchParams]);

  // Product reviews state
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [total, setTotal] = useState(0);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Site reviews state
  const [siteReviews, setSiteReviews] = useState<SiteReview[]>([]);
  const [siteLoading, setSiteLoading] = useState(true);
  const [showSiteForm, setShowSiteForm] = useState(false);
  const [editingSite, setEditingSite] = useState<SiteReview | null>(null);
  const [siteForm, setSiteForm] = useState<SiteReviewForm>(emptySiteForm);
  const [siteSaving, setSiteSaving] = useState(false);

  const fetchReviews = (q = "", rating = "") => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "50" });
    if (q) params.set("search", q);
    if (rating) params.set("rating", rating);
    adminFetch(`/admin/reviews?${params}`)
      .then(r => r.json())
      .then(data => { setReviews((data.reviews || []).filter((r: ReviewItem) => typeof r.productId === "object" || (typeof r.productId === "string" && r.productId !== "site-review"))); setTotal(data.pagination?.total || 0); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const fetchSiteReviews = () => {
    setSiteLoading(true);
    adminFetch("/admin/site-reviews")
      .then(r => r.json())
      .then(data => setSiteReviews(data.reviews || []))
      .catch(console.error)
      .finally(() => setSiteLoading(false));
  };

  useEffect(() => { fetchReviews(); fetchSiteReviews(); }, []);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); fetchReviews(search, ratingFilter); };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this review? This action cannot be undone.")) return;
    setDeleting(id);
    try {
      const res = await adminFetch(`/admin/reviews/${id}`, { method: "DELETE" });
      if (res.ok) fetchReviews(search, ratingFilter);
      else alert("Failed to delete review");
    } catch { alert("Error deleting review"); }
    finally { setDeleting(null); }
  };

  // Site review handlers
  const handleSiteSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSiteSaving(true);
    try {
      const id = editingSite ? editingSite._id : null;
      const url = id ? `/admin/site-reviews/${id}` : "/admin/site-reviews";
      const method = id ? "PATCH" : "POST";
      const res = await adminFetch(url, { method, body: JSON.stringify(siteForm) });
      if (res.ok) { fetchSiteReviews(); resetSiteForm(); }
    } catch (err) { console.error(err); }
    finally { setSiteSaving(false); }
  };

  const handleSiteEdit = (r: SiteReview) => {
    setEditingSite(r);
    setSiteForm({ userName: r.userName, rating: r.rating, title: r.title || "", comment: r.comment || "", active: r.active !== false, displayOrder: r.displayOrder || 0 });
    setShowSiteForm(true);
  };

  const handleSiteDelete = async (id: string) => {
    if (!confirm("Delete this site review?")) return;
    await adminFetch(`/admin/site-reviews/${id}`, { method: "DELETE" });
    fetchSiteReviews();
  };

  const reorderSiteReview = async (index: number, direction: -1 | 1) => {
    const swapIdx = index + direction;
    if (swapIdx < 0 || swapIdx >= siteReviews.length) return;
    const a = siteReviews[index], b = siteReviews[swapIdx];
    try {
      await Promise.all([
        adminFetch(`/admin/site-reviews/${a._id}`, { method: "PATCH", body: JSON.stringify({ displayOrder: b.displayOrder ?? swapIdx }) }),
        adminFetch(`/admin/site-reviews/${b._id}`, { method: "PATCH", body: JSON.stringify({ displayOrder: a.displayOrder ?? index }) }),
      ]);
      fetchSiteReviews();
    } catch (err) { console.error("Reorder failed:", err); }
  };

  const resetSiteForm = () => { setSiteForm(emptySiteForm); setEditingSite(null); setShowSiteForm(false); };

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={13} className={i <= rating ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"} />
      ))}
    </div>
  );

  const getProductName = (r: ReviewItem) => {
    if (typeof r.productId === "object" && r.productId?.name) return r.productId.name;
    return "Unknown Product";
  };

  const getProductImage = (r: ReviewItem) => {
    if (typeof r.productId === "object" && r.productId?.image) return r.productId.image;
    return "";
  };

  const inputCls = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-[#235A5D]/30 outline-none";
  const labelCls = "block text-[11px] font-medium text-gray-500 mb-1";

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <MessageSquare size={20} className="text-[#235A5D]" /> Reviews
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">{tab === "product" ? `${total} product reviews` : `${siteReviews.length} site reviews`}</p>
        </div>
        {tab === "site" && (
          <button onClick={() => { resetSiteForm(); setShowSiteForm(true); }} className="flex items-center gap-1 px-3 py-1.5 bg-[#235A5D] text-white rounded-lg hover:bg-[#2D7275] text-xs">
            <Plus size={14} /> Add Review
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-gray-50 rounded-lg p-1 w-fit">
        <button onClick={() => setTab("product")} className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${tab === "product" ? "bg-white text-[#1A4547] shadow-sm" : "text-gray-400 hover:text-gray-600"}`}>Product Reviews</button>
        <button onClick={() => setTab("site")} className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${tab === "site" ? "bg-white text-[#1A4547] shadow-sm" : "text-gray-400 hover:text-gray-600"}`}>Site Reviews</button>
      </div>

      {tab === "product" ? (
        <>
          {/* Search & Filter */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
              <input type="text" placeholder="Search by name, title, or comment..." value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#235A5D] focus:ring-1 focus:ring-[#235A5D]/20" />
            </div>
            <div className="relative">
              <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
              <select value={ratingFilter} onChange={e => { setRatingFilter(e.target.value); fetchReviews(search, e.target.value); }}
                className="pl-9 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#235A5D] appearance-none bg-white cursor-pointer">
                <option value="">All Ratings</option>
                <option value="5">5 Stars</option><option value="4">4 Stars</option><option value="3">3 Stars</option><option value="2">2 Stars</option><option value="1">1 Star</option>
              </select>
            </div>
            <button type="submit" className="px-4 py-2 bg-[#235A5D] text-white text-sm rounded-lg hover:bg-[#1A4547] transition-colors">Search</button>
          </form>

          {loading ? (
            <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-gray-200 border-t-[#235A5D] rounded-full animate-spin" /></div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-20"><MessageSquare size={40} className="mx-auto text-gray-200 mb-3" /><p className="text-sm text-gray-400">No reviews found</p></div>
          ) : (
            <div className="space-y-3">
              {reviews.map(r => (
                <div key={r._id} className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start gap-3">
                    {getProductImage(r) && <img src={getProductImage(r)} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-gray-100" />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs text-gray-400 mb-0.5">{getProductName(r)}</p>
                          <div className="flex items-center gap-2 mb-1">{renderStars(r.rating)}<span className="text-xs font-semibold text-gray-700">{r.rating}/5</span></div>
                          {r.title && <p className="text-sm font-semibold text-gray-800 mb-0.5">{r.title}</p>}
                          {r.comment && <p className="text-sm text-gray-600 leading-relaxed">{r.comment}</p>}
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs text-gray-500 font-medium">{r.userName}</span>
                            <span className="text-xs text-gray-300">·</span>
                            <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                          </div>
                        </div>
                        <button onClick={() => handleDelete(r._id)} disabled={deleting === r._id} className="p-2 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0" title="Delete review"><Trash2 size={15} /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          {/* Site Reviews Tab */}
          {siteLoading ? (
            <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-gray-200 border-t-[#235A5D] rounded-full animate-spin" /></div>
          ) : siteReviews.length === 0 ? (
            <div className="text-center py-20"><MessageSquare size={40} className="mx-auto text-gray-200 mb-3" /><p className="text-sm text-gray-400">No site reviews yet</p></div>
          ) : (
            <div className="space-y-2">
              {siteReviews.map((r, idx) => (
                <div key={r._id} className={`flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 ${!r.active ? 'opacity-50' : ''}`}>
                  <div className="flex flex-col gap-0.5 flex-shrink-0">
                    <button onClick={() => reorderSiteReview(idx, -1)} disabled={idx === 0} className="p-0.5 text-gray-300 hover:text-gray-600 disabled:opacity-20"><ChevronUp size={14} /></button>
                    <button onClick={() => reorderSiteReview(idx, 1)} disabled={idx === siteReviews.length - 1} className="p-0.5 text-gray-300 hover:text-gray-600 disabled:opacity-20"><ChevronDown size={14} /></button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-medium text-gray-700 text-sm">{r.userName}</span>
                      {renderStars(r.rating)}
                    </div>
                    {r.title && <p className="text-xs font-medium text-gray-600">{r.title}</p>}
                    {r.comment && <p className="text-xs text-gray-400 truncate">{r.comment}</p>}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => handleSiteEdit(r)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50"><Edit2 size={15} /></button>
                    <button onClick={() => handleSiteDelete(r._id)} className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50"><Trash2 size={15} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Site Review Form Modal */}
      {showSiteForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-800">{editingSite ? "Edit Site Review" : "New Site Review"}</h2>
              <button onClick={resetSiteForm} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <form onSubmit={handleSiteSubmit} className="p-5 space-y-4">
              <div><label className={labelCls}>Reviewer Name *</label><input type="text" required value={siteForm.userName} onChange={e => setSiteForm({ ...siteForm, userName: e.target.value })} className={inputCls} /></div>
              <div>
                <label className={labelCls}>Rating *</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <button key={i} type="button" onClick={() => setSiteForm({ ...siteForm, rating: i })} className="p-0.5">
                      <Star size={22} className={i <= siteForm.rating ? "text-amber-400 fill-amber-400" : "text-gray-200"} />
                    </button>
                  ))}
                </div>
              </div>
              <div><label className={labelCls}>Title</label><input type="text" value={siteForm.title} onChange={e => setSiteForm({ ...siteForm, title: e.target.value })} className={inputCls} /></div>
              <div><label className={labelCls}>Comment *</label><textarea required rows={3} value={siteForm.comment} onChange={e => setSiteForm({ ...siteForm, comment: e.target.value })} className={`${inputCls} resize-none`} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelCls}>Order</label><input type="number" value={siteForm.displayOrder} onChange={e => setSiteForm({ ...siteForm, displayOrder: Number(e.target.value) })} className={inputCls} /></div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-600">
                    <input type="checkbox" checked={siteForm.active} onChange={e => setSiteForm({ ...siteForm, active: e.target.checked })} className="w-3.5 h-3.5 rounded border-gray-300" /> Active
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button type="button" onClick={resetSiteForm} className="px-3 py-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={siteSaving} className="px-4 py-1.5 bg-[#235A5D] text-white text-xs rounded-lg hover:bg-[#2D7275] disabled:opacity-50 flex items-center gap-1.5">
                  {siteSaving ? <><Loader2 size={12} className="animate-spin" /> Saving...</> : editingSite ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
