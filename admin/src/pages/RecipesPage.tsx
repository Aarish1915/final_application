import { useState, useEffect, useCallback } from "react";
import { adminFetch } from "../App";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

type Recipe = {
  _id: string; title: string; slug: string; excerpt: string; content: string;
  coverImage: string; category: string; tags: string[];
  prepTime: string; cookTime: string; servings: string; difficulty: string;
  status: "draft" | "published" | "archived"; featured: boolean;
  publishedAt: string; createdAt: string;
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-amber-50 text-amber-600",
  published: "bg-emerald-50 text-emerald-600",
  archived: "bg-gray-50 text-gray-400",
};

const EMPTY: Partial<Recipe> = {
  title: "", slug: "", excerpt: "", content: "", coverImage: "",
  category: "Main Course", tags: [], prepTime: "", cookTime: "", servings: "", difficulty: "Easy",
  status: "draft", featured: false,
};

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Recipe> | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchRecipes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch("/admin/recipes");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setRecipes(data.recipes || []);
    } catch { setRecipes([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchRecipes(); }, [fetchRecipes]);

  const generateSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const openNew = () => { setEditing({ ...EMPTY }); setTagsInput(""); setError(""); };
  const openEdit = (r: Recipe) => { setEditing({ ...r }); setTagsInput(r.tags?.join(", ") || ""); setError(""); };

  const handleSave = async () => {
    if (!editing?.title?.trim()) { setError("Title is required"); return; }
    setSaving(true); setError("");
    try {
      const payload = {
        ...editing, slug: editing.slug || generateSlug(editing.title || ""),
        tags: tagsInput.split(",").map(t => t.trim()).filter(Boolean),
      };
      const isUpdate = !!(editing as Recipe)._id;
      const url = isUpdate ? `/admin/recipes/${(editing as Recipe)._id}` : "/admin/recipes";
      const res = await adminFetch(url, { method: isUpdate ? "PUT" : "POST", body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setEditing(null); fetchRecipes();
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Save failed"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await adminFetch(`/admin/recipes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setDeleteId(null); fetchRecipes();
    } catch { alert("Failed to delete recipe"); }
  };

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" }); }
    catch { return d; }
  };

  const inputCls = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-[#235A5D]/30 outline-none";
  const labelCls = "block text-[11px] font-medium text-gray-500 mb-1";

  if (editing) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-[#1A4547]">{(editing as Recipe)._id ? "Edit Recipe" : "New Recipe"}</h2>
          <button onClick={() => setEditing(null)} className="text-xs text-gray-400 hover:text-gray-600">← Back</button>
        </div>
        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-lg">{error}</div>}
        <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
          <div className="p-5 space-y-4">
            <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Basic Info</h3>
            <div>
              <label className={labelCls}>Title *</label>
              <input type="text" value={editing.title || ""} onChange={e => setEditing({ ...editing, title: e.target.value, slug: editing.slug || generateSlug(e.target.value) })} className={inputCls} placeholder="Recipe title" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls}>Slug</label><input type="text" value={editing.slug || ""} onChange={e => setEditing({ ...editing, slug: e.target.value })} className={inputCls} /></div>
              <div><label className={labelCls}>Category</label>
                <select value={editing.category || "Main Course"} onChange={e => setEditing({ ...editing, category: e.target.value })} className={inputCls}>
                  {["Main Course", "Appetizer", "Dessert", "Beverage", "Snack", "Breakfast", "Side Dish", "Soup"].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div><label className={labelCls}>Prep Time</label><input type="text" value={editing.prepTime || ""} onChange={e => setEditing({ ...editing, prepTime: e.target.value })} className={inputCls} placeholder="15 min" /></div>
              <div><label className={labelCls}>Cook Time</label><input type="text" value={editing.cookTime || ""} onChange={e => setEditing({ ...editing, cookTime: e.target.value })} className={inputCls} placeholder="30 min" /></div>
              <div><label className={labelCls}>Servings</label><input type="text" value={editing.servings || ""} onChange={e => setEditing({ ...editing, servings: e.target.value })} className={inputCls} placeholder="4" /></div>
              <div><label className={labelCls}>Difficulty</label>
                <select value={editing.difficulty || "Easy"} onChange={e => setEditing({ ...editing, difficulty: e.target.value })} className={inputCls}>
                  {["Easy", "Medium", "Hard"].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls}>Status</label>
                <select value={editing.status || "draft"} onChange={e => setEditing({ ...editing, status: e.target.value as Recipe["status"] })} className={inputCls}>
                  <option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option>
                </select>
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                  <input type="checkbox" checked={editing.featured || false} onChange={e => setEditing({ ...editing, featured: e.target.checked })} className="w-3.5 h-3.5 rounded border-gray-300" /> Featured
                </label>
              </div>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Content</h3>
            <div>
              <label className={labelCls}>Cover Image URL</label>
              <input type="text" value={editing.coverImage || ""} onChange={e => setEditing({ ...editing, coverImage: e.target.value })} className={inputCls} placeholder="https://..." />
              {editing.coverImage && <img src={editing.coverImage} alt="Cover" className="mt-2 h-28 rounded-lg object-cover border border-gray-100" />}
            </div>
            <div><label className={labelCls}>Excerpt</label><textarea value={editing.excerpt || ""} onChange={e => setEditing({ ...editing, excerpt: e.target.value })} rows={2} className={`${inputCls} resize-none`} /></div>
            <div>
              <label className={labelCls}>Content (Instructions, Ingredients, etc.)</label>
              <ReactQuill theme="snow" value={editing.content || ""} onChange={value => setEditing({ ...editing, content: value })}
                modules={{ toolbar: [[{ header: [1, 2, 3, false] }], ["bold", "italic", "underline"], [{ list: "ordered" }, { list: "bullet" }], ["blockquote", "link", "image"], ["clean"]] }}
                className="bg-white rounded-lg border border-gray-200" style={{ minHeight: "250px" }} />
            </div>
            <div><label className={labelCls}>Tags (comma-separated)</label><input type="text" value={tagsInput} onChange={e => setTagsInput(e.target.value)} className={inputCls} /></div>
          </div>
          <div className="p-5 flex justify-end gap-2">
            <button onClick={() => setEditing(null)} className="px-3 py-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="px-4 py-1.5 text-xs text-white bg-[#235A5D] rounded-lg hover:bg-[#2D7275] disabled:opacity-50">
              {saving ? "Saving..." : (editing as Recipe)._id ? "Update" : "Create"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-lg font-semibold text-[#1A4547]">Recipes</h1><p className="text-xs text-gray-400 mt-0.5">Manage recipes</p></div>
        <button onClick={openNew} className="px-3 py-1.5 text-xs text-white bg-[#235A5D] rounded-lg hover:bg-[#2D7275]">+ New Recipe</button>
      </div>
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 bg-gray-50 rounded-xl animate-pulse" />)}</div>
      ) : recipes.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <p className="text-gray-300 text-sm mb-3">No recipes yet</p>
          <button onClick={openNew} className="text-xs text-gray-500 hover:text-gray-700">Create your first recipe →</button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full admin-table">
            <thead><tr><th>Title</th><th className="hidden md:table-cell">Category</th><th className="hidden sm:table-cell">Status</th><th className="hidden lg:table-cell">Date</th><th>Actions</th></tr></thead>
            <tbody>
              {recipes.map(r => (
                <tr key={r._id}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      {r.coverImage && <img src={r.coverImage} alt="" className="w-8 h-8 rounded-lg object-cover border border-gray-100 hidden sm:block" />}
                      <div className="min-w-0"><p className="text-sm font-medium text-gray-700 truncate max-w-xs">{r.title}</p><p className="text-[11px] text-gray-400 truncate max-w-xs">{r.excerpt}</p></div>
                    </div>
                  </td>
                  <td className="hidden md:table-cell"><span className="text-xs text-gray-400">{r.category}</span></td>
                  <td className="hidden sm:table-cell">
                    <span className={`inline-flex px-2 py-0.5 text-[11px] font-medium rounded-md ${STATUS_COLORS[r.status] || STATUS_COLORS.draft}`}>{r.status}</span>
                    {r.featured && <span className="ml-1 text-amber-400 text-xs">★</span>}
                  </td>
                  <td className="hidden lg:table-cell"><span className="text-xs text-gray-400">{formatDate(r.createdAt)}</span></td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(r)} className="text-[11px] text-gray-500 hover:text-gray-700">Edit</button>
                      <button onClick={() => setDeleteId(r._id)} className="text-[11px] text-gray-400 hover:text-red-500">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20" onClick={() => setDeleteId(null)}>
          <div className="bg-white rounded-xl p-5 max-w-sm w-full mx-4 shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-gray-800 mb-1">Delete Recipe?</h3>
            <p className="text-xs text-gray-400 mb-5">This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteId(null)} className="px-3 py-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="px-3 py-1.5 text-xs text-white bg-red-500 rounded-lg hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
