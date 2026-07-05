import { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, ChevronUp, ChevronDown, Upload, Image, Loader2, X, GripVertical, Link2, Link2Off } from 'lucide-react';
import { adminFetch } from '../App';

type Banner = {
  id: string; _id?: string; title: string; desktopImage: string;
  mobileImage: string; image: string; link: string; linkEnabled: boolean; description: string;
  active: boolean; displayOrder: number; startsAt?: string; endsAt?: string;
};

function getBannerId(banner: Banner) { return banner.id || banner._id || ''; }

type FormData = {
  title: string; desktopImage: string; mobileImage: string;
  link: string; linkEnabled: boolean; description: string; active: boolean;
  displayOrder: number; startsAt: string; endsAt: string;
};

const emptyForm: FormData = {
  title: '', desktopImage: '', mobileImage: '', link: '', linkEnabled: false, description: '',
  active: true, displayOrder: 0, startsAt: '', endsAt: '',
};

async function uploadToS3(file: File): Promise<string> {
  const presignRes = await adminFetch("/admin/uploads/presign", { method: "POST", body: JSON.stringify({ filename: file.name, contentType: file.type }) });
  if (!presignRes.ok) throw new Error("Failed to get upload URL");
  const { uploadUrl, publicUrl } = await presignRes.json();
  await adminFetch(uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
  return publicUrl;
}

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploadingDesktop, setUploadingDesktop] = useState(false);
  const [uploadingMobile, setUploadingMobile] = useState(false);
  const desktopFileRef = useRef<HTMLInputElement>(null);
  const mobileFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadBanners(); }, []);

  const loadBanners = async () => {
    try {
      const res = await adminFetch('/admin/banners');
      if (res.ok) { const data = await res.json(); setBanners((data.banners || []).sort((a: Banner, b: Banner) => (a.displayOrder || 0) - (b.displayOrder || 0))); }
    } catch (error) { console.error('Failed to load banners:', error); }
    finally { setLoading(false); }
  };

  const handleUpload = async (file: File, target: 'desktop' | 'mobile') => {
    const setUploading = target === 'desktop' ? setUploadingDesktop : setUploadingMobile;
    setUploading(true);
    try {
      const url = await uploadToS3(file);
      if (target === 'desktop') setFormData(f => ({ ...f, desktopImage: url }));
      else setFormData(f => ({ ...f, mobileImage: url }));
    } catch (err) { console.error("Upload failed:", err); alert("Image upload failed."); }
    finally { setUploading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const bid = editingBanner ? getBannerId(editingBanner) : null;
      const payload = { ...formData, image: formData.desktopImage, link: formData.linkEnabled ? formData.link : '', linkEnabled: formData.linkEnabled };
      const url = bid ? `/admin/banners/${bid}` : '/admin/banners';
      const res = await adminFetch(url, { method: bid ? 'PATCH' : 'POST', body: JSON.stringify(payload) });
      if (res.ok) { loadBanners(); resetForm(); }
    } catch (error) { console.error('Failed to save banner:', error); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this banner?')) return;
    try { const res = await adminFetch(`/admin/banners/${id}`, { method: 'DELETE' }); if (res.ok) loadBanners(); }
    catch (error) { console.error('Failed to delete:', error); }
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({ title: banner.title || '', desktopImage: banner.desktopImage || banner.image || '', mobileImage: banner.mobileImage || '', link: banner.link || '', linkEnabled: banner.linkEnabled ?? false, description: banner.description || '', active: banner.active, displayOrder: banner.displayOrder || 0, startsAt: banner.startsAt || '', endsAt: banner.endsAt || '' });
    setShowForm(true);
  };

  const toggleActive = async (banner: Banner) => {
    try { await adminFetch(`/admin/banners/${getBannerId(banner)}`, { method: 'PATCH', body: JSON.stringify({ active: !banner.active }) }); loadBanners(); }
    catch (error) { console.error('Failed to toggle:', error); }
  };

  const reorder = async (index: number, direction: -1 | 1) => {
    const swapIdx = index + direction;
    if (swapIdx < 0 || swapIdx >= banners.length) return;
    const a = banners[index], b = banners[swapIdx];
    try {
      await Promise.all([
        adminFetch(`/admin/banners/${getBannerId(a)}`, { method: 'PATCH', body: JSON.stringify({ displayOrder: b.displayOrder ?? swapIdx }) }),
        adminFetch(`/admin/banners/${getBannerId(b)}`, { method: 'PATCH', body: JSON.stringify({ displayOrder: a.displayOrder ?? index }) }),
      ]);
      loadBanners();
    } catch (error) { console.error('Failed to reorder:', error); }
  };

  const resetForm = () => { setFormData(emptyForm); setEditingBanner(null); setShowForm(false); };
  const getPreviewUrl = (banner: Banner) => banner.desktopImage || banner.image || banner.mobileImage || '';
  const inputCls = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-[#235A5D]/30 outline-none";
  const labelCls = "block text-[11px] font-medium text-gray-500 mb-1";

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-gray-200 border-t-[#235A5D] rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-5xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-lg font-semibold text-[#1A4547]">Banners</h1>
          <p className="text-xs text-gray-400 mt-0.5">Manage homepage hero carousel</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-1 px-3 py-1.5 bg-[#235A5D] text-white rounded-lg hover:bg-[#2D7275] text-xs">
          <Plus size={14} /> Add Banner
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-800">{editingBanner ? 'Edit Banner' : 'New Banner'}</h2>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div><label className={labelCls}>Title *</label><input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required className={inputCls} /></div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Desktop Image</label>
                  <div onClick={() => desktopFileRef.current?.click()}
                    className="w-full h-32 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-gray-400 overflow-hidden relative group">
                    {uploadingDesktop ? <Loader2 size={20} className="text-gray-400 animate-spin" /> :
                      formData.desktopImage ? (<><img src={formData.desktopImage} alt="" className="w-full h-full object-cover" /><div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center"><Upload size={16} className="text-white" /></div></>) :
                      (<div className="text-center"><Image size={20} className="text-gray-300 mx-auto mb-1" /><span className="text-[10px] text-gray-400">Landscape</span></div>)}
                  </div>
                  <input ref={desktopFileRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f, 'desktop'); }} />
                  <input type="url" value={formData.desktopImage} onChange={e => setFormData({ ...formData, desktopImage: e.target.value })} className={`${inputCls} mt-2 text-xs`} placeholder="Or paste URL" />
                </div>
                <div>
                  <label className={labelCls}>Mobile Image</label>
                  <div onClick={() => mobileFileRef.current?.click()}
                    className="w-full h-32 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-gray-400 overflow-hidden relative group">
                    {uploadingMobile ? <Loader2 size={20} className="text-gray-400 animate-spin" /> :
                      formData.mobileImage ? (<><img src={formData.mobileImage} alt="" className="w-full h-full object-cover" /><div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center"><Upload size={16} className="text-white" /></div></>) :
                      (<div className="text-center"><Image size={20} className="text-gray-300 mx-auto mb-1" /><span className="text-[10px] text-gray-400">Portrait</span></div>)}
                  </div>
                  <input ref={mobileFileRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f, 'mobile'); }} />
                  <input type="url" value={formData.mobileImage} onChange={e => setFormData({ ...formData, mobileImage: e.target.value })} className={`${inputCls} mt-2 text-xs`} placeholder="Or paste URL" />
                </div>
              </div>

              <div>
                <label className={labelCls}>Link</label>
                <div className="flex items-center gap-3 mb-2">
                  <button type="button" onClick={() => setFormData(f => ({ ...f, linkEnabled: !f.linkEnabled, link: !f.linkEnabled ? f.link : '' }))}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${formData.linkEnabled ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
                    {formData.linkEnabled ? <><Link2 size={13} /> Link Enabled</> : <><Link2Off size={13} /> Link Disabled</>}
                  </button>
                </div>
                {formData.linkEnabled && (
                  <input type="text" value={formData.link} onChange={e => setFormData({ ...formData, link: e.target.value })} className={inputCls} placeholder="/products or https://..." />
                )}
              </div>
              <div><label className={labelCls}>Description</label><textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={2} className={`${inputCls} resize-none`} /></div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div><label className={labelCls}>Order</label><input type="number" value={formData.displayOrder} onChange={e => setFormData({ ...formData, displayOrder: Number(e.target.value) })} className={inputCls} /></div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-600">
                    <input type="checkbox" checked={formData.active} onChange={e => setFormData({ ...formData, active: e.target.checked })} className="w-3.5 h-3.5 rounded border-gray-300" /> Active
                  </label>
                </div>
                <div><label className={labelCls}>Start</label><input type="datetime-local" value={formData.startsAt} onChange={e => setFormData({ ...formData, startsAt: e.target.value })} className={`${inputCls} text-xs`} /></div>
                <div><label className={labelCls}>End</label><input type="datetime-local" value={formData.endsAt} onChange={e => setFormData({ ...formData, endsAt: e.target.value })} className={`${inputCls} text-xs`} /></div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button type="button" onClick={resetForm} className="px-3 py-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving || uploadingDesktop || uploadingMobile}
                  className="px-4 py-1.5 bg-[#235A5D] text-white text-xs rounded-lg hover:bg-[#2D7275] disabled:opacity-50 flex items-center gap-1.5">
                  {saving ? <><Loader2 size={12} className="animate-spin" /> Saving...</> : editingBanner ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Banner List */}
      {banners.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <Image size={32} className="mx-auto text-gray-300 mb-2" />
          <p className="text-gray-400 text-sm">No banners yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {banners.map((banner, idx) => (
            <div key={getBannerId(banner)} className={`flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 ${!banner.active ? 'opacity-50' : ''}`}>
              <div className="flex flex-col gap-0.5 flex-shrink-0">
                <button onClick={() => reorder(idx, -1)} disabled={idx === 0} className="p-0.5 text-gray-300 hover:text-gray-600 disabled:opacity-20"><ChevronUp size={14} /></button>
                <GripVertical size={14} className="text-gray-200 mx-auto" />
                <button onClick={() => reorder(idx, 1)} disabled={idx === banners.length - 1} className="p-0.5 text-gray-300 hover:text-gray-600 disabled:opacity-20"><ChevronDown size={14} /></button>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <div className="w-24 h-14 rounded-lg overflow-hidden border border-gray-100 bg-gray-50">
                  <img src={getPreviewUrl(banner)} alt={banner.title} className="w-full h-full object-cover" />
                </div>
                {banner.mobileImage && (
                  <div className="w-8 h-14 rounded-lg overflow-hidden border border-gray-100 bg-gray-50">
                    <img src={banner.mobileImage} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-700 text-sm truncate">{banner.title}</p>
                  <span className="text-[10px] text-gray-300">#{banner.displayOrder}</span>
                </div>
                {banner.linkEnabled && banner.link && <p className="text-[11px] text-gray-400 truncate flex items-center gap-1"><Link2 size={10} />{banner.link}</p>}
                {!banner.linkEnabled && <p className="text-[10px] text-gray-300 flex items-center gap-1"><Link2Off size={10} />No link</p>}
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button onClick={() => toggleActive(banner)} className={`p-1.5 rounded-lg text-xs ${banner.active ? 'text-emerald-500 hover:bg-emerald-50' : 'text-gray-300 hover:bg-gray-50'}`}>
                  {banner.active ? <Eye size={15} /> : <EyeOff size={15} />}
                </button>
                <button onClick={() => handleEdit(banner)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50"><Edit2 size={15} /></button>
                <button onClick={() => handleDelete(getBannerId(banner))} className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
