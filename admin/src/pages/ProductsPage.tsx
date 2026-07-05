import { useEffect, useState, useRef } from "react";
import { adminFetch } from "../App";
import { Search, Trash2, Plus, Edit2, X, Package, IndianRupee, Star, Upload, Image, Loader2, Award, ShoppingCart, ChevronUp, ChevronDown, Settings2, Gift, Building } from "lucide-react";

interface ProductItem {
  _id: string; name: string; category: string; price: number; mrp: number;
  salePrice: number; discount: number; image: string; images?: string[];
  rating: number; reviews: number; description: string; inStock: boolean;
  featured: boolean; bestSeller: boolean; isAddon: boolean; isGift: boolean; isB2B: boolean; stock: number;
  weight: string; sku: string; allergens?: string; storage?: string;
  shelfLife?: string; ingredients?: string; createdAt: string; displayOrder?: number;
}

type FormState = {
  name: string; category: string; mrp: number; salePrice: number;
  image: string; images: string[]; rating: number; reviews: number; description: string;
  inStock: boolean; featured: boolean; bestSeller: boolean; isAddon: boolean; recommended: boolean; isGift: boolean; isB2B: boolean;
  stock: number; weight: string; sku: string;
  allergens: string; storage: string; shelfLife: string; ingredients: string;
};

const emptyForm: FormState = {
  name: "", category: "", mrp: 0, salePrice: 0,
  image: "", images: [], rating: 0, reviews: 0, description: "",
  inStock: true, featured: false, bestSeller: false, isAddon: false, recommended: false, isGift: false, isB2B: false,
  stock: 50, weight: "", sku: "",
  allergens: "", storage: "", shelfLife: "", ingredients: "",
};

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingExtra, setUploadingExtra] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const extraFileRef = useRef<HTMLInputElement>(null);

  // Dynamic categories & storage types from backend
  const [categories, setCategories] = useState<string[]>([]);
  const [storageTypes, setStorageTypes] = useState<string[]>([]);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configCategories, setConfigCategories] = useState<string[]>([]);
  const [configStorageTypes, setConfigStorageTypes] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [newStorageType, setNewStorageType] = useState("");
  const [savingConfig, setSavingConfig] = useState(false);

  const discount = form.mrp > 0 && form.salePrice > 0 && form.salePrice < form.mrp
    ? Math.round(((form.mrp - form.salePrice) / form.mrp) * 100) : 0;

  const fetchProductConfig = () => {
    adminFetch("/admin/settings/product-config")
      .then(r => r.json())
      .then(data => {
        setCategories(data.categories || []);
        setStorageTypes(data.storageTypes || []);
      })
      .catch(console.error);
  };

  const fetchProducts = (q = "") => {
    setLoading(true);
    const params = q ? `?search=${encodeURIComponent(q)}&limit=100` : "?limit=100";
    adminFetch(`/admin/products${params}`)
      .then(r => r.json())
      .then(data => { setProducts(data.products || []); setTotal(data.pagination?.total || 0); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProductConfig(); fetchProducts(); }, []);
  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); fetchProducts(search); };
  const openAdd = () => { setEditId(null); setForm(emptyForm); setImagePreview(""); setShowModal(true); };

  const openEdit = (p: ProductItem) => {
    setEditId(p._id);
    setForm({
      name: p.name || "", category: p.category || "",
      mrp: p.mrp || p.price || 0, salePrice: p.salePrice || p.price || 0,
      image: p.image || "", images: p.images || [], rating: p.rating || 0, reviews: p.reviews || 0,
      description: p.description || "", inStock: p.inStock !== false,
      featured: p.featured || false, bestSeller: p.bestSeller || false, isGift: p.isGift || false, isB2B: p.isB2B || false,
      isAddon: p.isAddon || false, recommended: (p as any).recommended || false, stock: p.stock || 50,
      weight: p.weight || "", sku: p.sku || "",
      allergens: p.allergens || "", storage: p.storage || "",
      shelfLife: p.shelfLife || "", ingredients: p.ingredients || "",
    });
    setImagePreview(p.image || "");
    setShowModal(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    try {
      const presignRes = await adminFetch("/admin/uploads/presign", { method: "POST", body: JSON.stringify({ filename: file.name, contentType: file.type }) });
      if (!presignRes.ok) throw new Error("Failed to get upload URL");
      const { uploadUrl, publicUrl } = await presignRes.json();
      await adminFetch(uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
      setForm(prev => ({ ...prev, image: publicUrl }));
      setImagePreview(publicUrl);
    } catch (err) { console.error("Upload failed:", err); alert("Image upload failed."); }
    finally { setUploading(false); }
  };

  const handleExtraImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploadingExtra(true);
    try {
      const presignRes = await adminFetch("/admin/uploads/presign", { method: "POST", body: JSON.stringify({ filename: file.name, contentType: file.type }) });
      if (!presignRes.ok) throw new Error("Failed to get upload URL");
      const { uploadUrl, publicUrl } = await presignRes.json();
      await adminFetch(uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
      setForm(p => ({ ...p, images: [...p.images, publicUrl] }));
    } catch (err) { console.error("Upload failed:", err); alert("Image upload failed."); }
    finally { setUploadingExtra(false); if (extraFileRef.current) extraFileRef.current.value = ""; }
  };

  const removeExtraImage = (index: number) => setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { ...form, price: form.salePrice, discount };
      if (editId) await adminFetch(`/admin/products/${editId}`, { method: "PUT", body: JSON.stringify(payload) });
      else await adminFetch("/admin/products", { method: "POST", body: JSON.stringify(payload) });
      setShowModal(false); fetchProducts(search);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete product "${name}"?`)) return;
    await adminFetch(`/admin/products/${id}`, { method: "DELETE" });
    fetchProducts(search);
  };

  const reorderProduct = async (index: number, direction: -1 | 1) => {
    const swapIdx = index + direction;
    if (swapIdx < 0 || swapIdx >= products.length) return;
    const a = products[index], b = products[swapIdx];
    try {
      await Promise.all([
        adminFetch(`/admin/products/${a._id}`, { method: "PUT", body: JSON.stringify({ displayOrder: b.displayOrder ?? swapIdx }) }),
        adminFetch(`/admin/products/${b._id}`, { method: "PUT", body: JSON.stringify({ displayOrder: a.displayOrder ?? index }) }),
      ]);
      fetchProducts(search);
    } catch (err) { console.error("Reorder failed:", err); }
  };

  // Config modal handlers
  const openConfig = () => {
    setConfigCategories([...categories]);
    setConfigStorageTypes([...storageTypes]);
    setNewCategory("");
    setNewStorageType("");
    setShowConfigModal(true);
  };

  const addCategory = () => {
    const val = newCategory.trim();
    if (val && !configCategories.includes(val)) {
      setConfigCategories(prev => [...prev, val]);
      setNewCategory("");
    }
  };

  const addStorageType = () => {
    const val = newStorageType.trim();
    if (val && !configStorageTypes.includes(val)) {
      setConfigStorageTypes(prev => [...prev, val]);
      setNewStorageType("");
    }
  };

  const saveConfig = async () => {
    setSavingConfig(true);
    try {
      const res = await adminFetch("/admin/settings/product-config", {
        method: "PUT",
        body: JSON.stringify({ categories: configCategories, storageTypes: configStorageTypes }),
      });
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
        setStorageTypes(data.storageTypes || []);
        setShowConfigModal(false);
      }
    } catch (err) { console.error(err); }
    finally { setSavingConfig(false); }
  };

  const inputCls = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-[#235A5D]/30 outline-none";
  const labelCls = "block text-[11px] font-medium text-gray-500 mb-1";

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-lg font-semibold text-[#1A4547]">Products</h1>
          <p className="text-xs text-gray-400 mt-0.5">{total} products</p>
        </div>
        <div className="flex gap-2 items-center">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
              <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-[#235A5D]/30 outline-none w-44" />
            </div>
            <button type="submit" className="px-3 py-1.5 bg-[#235A5D] text-white text-xs rounded-lg hover:bg-[#2D7275]">Search</button>
          </form>
          <button onClick={openConfig} className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 text-gray-600 text-xs rounded-lg hover:bg-gray-50" title="Manage Categories & Storage Types">
            <Settings2 size={14} /> Config
          </button>
          <button onClick={openAdd} className="flex items-center gap-1 px-3 py-1.5 bg-[#235A5D] text-white text-xs rounded-lg hover:bg-[#2D7275]">
            <Plus size={14} /> Add
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-5 h-5 border-2 border-gray-200 border-t-[#235A5D] rounded-full animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-gray-300">
            <Package size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">No products found</p>
            <button onClick={openAdd} className="mt-2 text-gray-500 text-xs hover:underline">Add your first product</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full admin-table">
              <thead><tr><th>#</th><th>Product</th><th>Category</th><th>MRP</th><th>Sale Price</th><th>Discount</th><th>Stock</th><th>Flags</th><th>Order</th><th>Actions</th></tr></thead>
              <tbody>
                {products.map((p, i) => {
                  const pMrp = p.mrp || p.price || 0;
                  const pSale = p.salePrice || p.price || 0;
                  const pDisc = pMrp > pSale ? Math.round(((pMrp - pSale) / pMrp) * 100) : 0;
                  return (
                    <tr key={p._id}>
                      <td className="text-gray-300 text-xs">{i + 1}</td>
                      <td>
                        <div className="flex items-center gap-2.5">
                          {p.image ? (
                            <img src={p.image} alt={p.name} className="w-9 h-9 rounded-lg object-cover border border-gray-100" />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center"><Package size={14} className="text-gray-300" /></div>
                          )}
                          <div>
                            <span className="font-medium text-gray-700 text-sm">{p.name}</span>
                            <div className="flex items-center gap-1 mt-0.5">
                              <Star size={10} fill="currentColor" className="text-amber-400" />
                              <span className="text-[11px] text-gray-400">{p.rating || 0} ({p.reviews || 0})</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td><span className="badge badge-blue">{p.category}</span></td>
                      <td className="text-gray-400 text-xs line-through">₹{pMrp}</td>
                      <td><span className="flex items-center gap-0.5 font-medium text-gray-800"><IndianRupee size={12} />{pSale}</span></td>
                      <td>{pDisc > 0 ? <span className="badge badge-green">{pDisc}% off</span> : <span className="text-gray-300">—</span>}</td>
                      <td><span className={`text-sm ${(p.stock || 0) < 10 ? "text-red-500 font-medium" : "text-gray-500"}`}>{p.stock ?? "—"}</span></td>
                      <td>
                        <div className="flex flex-wrap gap-1">
                          {p.bestSeller && <span className="badge badge-yellow text-[10px]">Best Seller</span>}
                          {p.isAddon && <span className="badge badge-purple text-[10px]">Add-on</span>}
                          {p.featured && <span className="badge badge-blue text-[10px]">Featured</span>}
                          {(p as any).recommended && <span className="badge badge-green text-[10px]">Recommended</span>}
                          {!p.inStock && <span className="badge badge-red text-[10px]">OOS</span>}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-0.5">
                          <button onClick={() => reorderProduct(i, -1)} disabled={i === 0} className="p-1 text-gray-300 hover:text-gray-600 disabled:opacity-20" title="Move up"><ChevronUp size={15} /></button>
                          <button onClick={() => reorderProduct(i, 1)} disabled={i === products.length - 1} className="p-1 text-gray-300 hover:text-gray-600 disabled:opacity-20" title="Move down"><ChevronDown size={15} /></button>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-0.5">
                          <button onClick={() => openEdit(p)} className="p-1.5 text-gray-300 hover:text-gray-600 hover:bg-gray-50 rounded-lg"><Edit2 size={15} /></button>
                          <button onClick={() => handleDelete(p._id, p.name)} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h3 className="text-sm font-semibold text-gray-800">{editId ? "Edit Product" : "Add Product"}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-5">
              {/* Image Upload */}
              <div>
                <label className={labelCls}>Product Image</label>
                <div className="flex items-start gap-4">
                  <div onClick={() => fileRef.current?.click()}
                    className="w-28 h-28 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-gray-400 transition-all overflow-hidden relative group">
                    {uploading ? (
                      <Loader2 size={20} className="text-gray-400 animate-spin" />
                    ) : imagePreview ? (
                      <>
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Upload size={16} className="text-white" />
                        </div>
                      </>
                    ) : (
                      <div className="text-center">
                        <Image size={20} className="text-gray-300 mx-auto mb-1" />
                        <span className="text-[10px] text-gray-400">Upload</span>
                      </div>
                    )}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  <div className="flex-1 space-y-2">
                    <p className="text-[11px] text-gray-400">Click to upload. JPG, PNG, WebP.</p>
                    <div>
                      <label className="text-[10px] text-gray-400 mb-1 block">Or paste URL</label>
                      <input type="text" value={form.image} onChange={e => { setForm({ ...form, image: e.target.value }); setImagePreview(e.target.value); }}
                        placeholder="https://..." className={`${inputCls} text-xs`} />
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <label className="text-[10px] text-gray-400 mb-2 block">Additional Images ({form.images.length})</label>
                  <div className="flex gap-2 flex-wrap">
                    {form.images.map((img, i) => (
                      <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-100 group">
                        <img src={img} alt={`Extra ${i + 1}`} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeExtraImage(i)} className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100"><X size={8} /></button>
                      </div>
                    ))}
                    <button type="button" onClick={() => extraFileRef.current?.click()}
                      className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center hover:border-gray-400">
                      {uploadingExtra ? <Loader2 size={14} className="text-gray-400 animate-spin" /> : <Plus size={14} className="text-gray-300" />}
                    </button>
                  </div>
                  <input ref={extraFileRef} type="file" accept="image/*" className="hidden" onChange={handleExtraImageUpload} />
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className={labelCls}>Product Name *</label>
                  <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-medium text-gray-500">Category *</label>
                    <button type="button" onClick={openConfig} className="text-[10px] text-[#235A5D] hover:underline flex items-center gap-0.5">
                      <Settings2 size={10} /> Manage
                    </button>
                  </div>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required className={inputCls}>
                    <option value="">Select</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    {/* Show current value even if not in categories list (legacy data) */}
                    {form.category && !categories.includes(form.category) && (
                      <option value={form.category}>{form.category} (unlisted)</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>SKU</label>
                  <input type="text" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} className={inputCls} />
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h4 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1"><IndianRupee size={12} /> Pricing</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div><label className={labelCls}>MRP (₹) *</label><input type="number" required min={0} value={form.mrp || ""} onChange={e => setForm({ ...form, mrp: Number(e.target.value) })} className={inputCls} /></div>
                  <div><label className={labelCls}>Sale Price (₹) *</label><input type="number" required min={0} value={form.salePrice || ""} onChange={e => setForm({ ...form, salePrice: Number(e.target.value) })} className={inputCls} /></div>
                  <div><label className={labelCls}>Discount</label><div className={`${inputCls} bg-white text-gray-500 flex items-center`}>{discount > 0 ? <span className="text-emerald-600 font-medium">{discount}% off</span> : <span className="text-gray-300">—</span>}</div></div>
                </div>
              </div>

              {/* Inventory */}
              <div className="grid grid-cols-3 gap-3">
                <div><label className={labelCls}>Stock</label><input type="number" min={0} value={form.stock} onChange={e => setForm({ ...form, stock: Number(e.target.value) })} className={inputCls} /></div>
                <div><label className={labelCls}>Weight</label><input type="text" value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} className={inputCls} placeholder="250g" /></div>
                <div><label className={labelCls}>Rating</label><input type="number" min={0} max={5} step={0.1} value={form.rating} onChange={e => setForm({ ...form, rating: Number(e.target.value) })} className={inputCls} /></div>
              </div>

              {/* Description & Ingredients */}
              <div><label className={labelCls}>Description</label><textarea rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className={`${inputCls} resize-none`} /></div>
              <div><label className={labelCls}>Ingredients</label><textarea rows={2} value={form.ingredients} onChange={e => setForm({ ...form, ingredients: e.target.value })} className={`${inputCls} resize-none`} /></div>

              {/* Product Info */}
              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelCls}>Storage</label>
                  <select value={form.storage} onChange={e => setForm({ ...form, storage: e.target.value })} className={inputCls}>
                    <option value="">Select</option>
                    {storageTypes.map(s => <option key={s} value={s}>{s}</option>)}
                    {form.storage && !storageTypes.includes(form.storage) && (
                      <option value={form.storage}>{form.storage} (unlisted)</option>
                    )}
                  </select>
                </div>
                <div><label className={labelCls}>Shelf Life</label><input type="text" value={form.shelfLife} onChange={e => setForm({ ...form, shelfLife: e.target.value })} className={inputCls} /></div>
                <div className="col-span-2"><label className={labelCls}>Allergens</label><input type="text" value={form.allergens} onChange={e => setForm({ ...form, allergens: e.target.value })} className={inputCls} /></div>
              </div>

              {/* Flags */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-3">Flags</h4>
                <div className="flex flex-wrap gap-2">
                  <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer bg-white px-3 py-2 rounded-lg border border-gray-100 hover:border-gray-300">
                    <input type="checkbox" checked={form.inStock} onChange={e => setForm({ ...form, inStock: e.target.checked })} className="w-3.5 h-3.5 rounded border-gray-300" /> In Stock
                  </label>
                  <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer bg-white px-3 py-2 rounded-lg border border-gray-100 hover:border-gray-300">
                    <input type="checkbox" checked={form.bestSeller} onChange={e => setForm({ ...form, bestSeller: e.target.checked })} className="w-3.5 h-3.5 rounded border-gray-300" />
                    <Award size={12} className="text-amber-400" /> Best Seller
                  </label>
                  <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer bg-white px-3 py-2 rounded-lg border border-gray-100 hover:border-gray-300">
                    <input type="checkbox" checked={form.isAddon} onChange={e => setForm({ ...form, isAddon: e.target.checked })} className="w-3.5 h-3.5 rounded border-gray-300" />
                    <ShoppingCart size={12} className="text-purple-400" /> Add-on
                  </label>
                  <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer bg-white px-3 py-2 rounded-lg border border-gray-100 hover:border-gray-300">
                    <input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} className="w-3.5 h-3.5 rounded border-gray-300" /> Featured
                  </label>
                  <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer bg-white px-3 py-2 rounded-lg border border-gray-100 hover:border-gray-300">
                    <input type="checkbox" checked={form.recommended} onChange={e => setForm({ ...form, recommended: e.target.checked })} className="w-3.5 h-3.5 rounded border-gray-300" />
                    <Star size={12} className="text-emerald-500" /> Recommended
                  </label>
                  <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer bg-white px-3 py-2 rounded-lg border border-gray-100 hover:border-gray-300">
                    <input type="checkbox" checked={form.isGift} onChange={e => setForm({ ...form, isGift: e.target.checked })} className="w-3.5 h-3.5 rounded border-gray-300" />
                    <Gift size={12} className="text-rose-500" /> Is Gift
                  </label>
                  <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer bg-white px-3 py-2 rounded-lg border border-gray-100 hover:border-gray-300">
                    <input type="checkbox" checked={form.isB2B} onChange={e => setForm({ ...form, isB2B: e.target.checked })} className="w-3.5 h-3.5 rounded border-gray-300" />
                    <Building size={12} className="text-blue-500" /> Is B2B
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-50 rounded-lg">Cancel</button>
                <button type="submit" disabled={saving || uploading} className="px-4 py-1.5 bg-[#235A5D] text-white text-xs rounded-lg hover:bg-[#2D7275] disabled:opacity-50 flex items-center gap-1.5">
                  {saving ? <><Loader2 size={12} className="animate-spin" /> Saving...</> : editId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Config Modal — Manage Categories & Storage Types */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2"><Settings2 size={16} /> Product Categories & Storage Types</h3>
              <button onClick={() => setShowConfigModal(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-6">
              {/* Categories */}
              <div>
                <h4 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-3">Categories</h4>
                <div className="flex flex-wrap gap-2 mb-3">
                  {configCategories.length === 0 && <p className="text-xs text-gray-300">No categories yet</p>}
                  {configCategories.map((cat, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#235A5D]/10 text-[#235A5D] text-xs rounded-full">
                      {cat}
                      <button type="button" onClick={() => setConfigCategories(prev => prev.filter((_, idx) => idx !== i))}
                        className="hover:text-red-500 transition-colors"><X size={12} /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="text" value={newCategory} onChange={e => setNewCategory(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCategory(); } }}
                    placeholder="New category name..." className={`${inputCls} flex-1`} />
                  <button type="button" onClick={addCategory} disabled={!newCategory.trim()}
                    className="px-3 py-2 bg-[#235A5D] text-white text-xs rounded-lg hover:bg-[#2D7275] disabled:opacity-30 flex items-center gap-1">
                    <Plus size={12} /> Add
                  </button>
                </div>
              </div>

              {/* Storage Types */}
              <div>
                <h4 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-3">Storage Types</h4>
                <div className="flex flex-wrap gap-2 mb-3">
                  {configStorageTypes.length === 0 && <p className="text-xs text-gray-300">No storage types yet</p>}
                  {configStorageTypes.map((st, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 text-xs rounded-full">
                      {st}
                      <button type="button" onClick={() => setConfigStorageTypes(prev => prev.filter((_, idx) => idx !== i))}
                        className="hover:text-red-500 transition-colors"><X size={12} /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="text" value={newStorageType} onChange={e => setNewStorageType(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addStorageType(); } }}
                    placeholder="New storage type..." className={`${inputCls} flex-1`} />
                  <button type="button" onClick={addStorageType} disabled={!newStorageType.trim()}
                    className="px-3 py-2 bg-amber-500 text-white text-xs rounded-lg hover:bg-amber-600 disabled:opacity-30 flex items-center gap-1">
                    <Plus size={12} /> Add
                  </button>
                </div>
              </div>

              {/* Save */}
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setShowConfigModal(false)} className="px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-50 rounded-lg">Cancel</button>
                <button type="button" onClick={saveConfig} disabled={savingConfig}
                  className="px-4 py-1.5 bg-[#235A5D] text-white text-xs rounded-lg hover:bg-[#2D7275] disabled:opacity-50 flex items-center gap-1.5">
                  {savingConfig ? <><Loader2 size={12} className="animate-spin" /> Saving...</> : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
