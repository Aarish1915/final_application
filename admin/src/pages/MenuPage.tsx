import { useState, useEffect, useRef } from 'react';
import { Upload, FileText, Loader2, ExternalLink, Check } from 'lucide-react';
import { adminFetch } from '../App';

async function uploadToS3(file: File): Promise<string> {
  const presignRes = await adminFetch("/admin/uploads/presign", {
    method: "POST",
    body: JSON.stringify({ filename: file.name, contentType: file.type }),
  });
  if (!presignRes.ok) throw new Error("Failed to get upload URL");
  const { uploadUrl, publicUrl } = await presignRes.json();
  await adminFetch(uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
  return publicUrl;
}

export default function MenuPage() {
  const [menuUrl, setMenuUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    adminFetch('/admin/menu')
      .then(r => r.json())
      .then(data => setMenuUrl(data.menuUrl || ''))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadToS3(file);
      setMenuUrl(url);
      // Auto-save after upload
      const res = await adminFetch('/admin/menu', {
        method: 'PUT',
        body: JSON.stringify({ menuUrl: url }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Failed to upload menu file.');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveUrl = async () => {
    if (!menuUrl.trim()) return;
    setSaving(true);
    try {
      const res = await adminFetch('/admin/menu', {
        method: 'PUT',
        body: JSON.stringify({ menuUrl: menuUrl.trim() }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error('Save failed:', err);
      alert('Failed to save menu URL.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-[#235A5D] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-[#1A4547]">Cafe Menu</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          Upload the cafe menu PDF. This will be shown when visitors click "View Menu" on the website.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-5">
        {/* Upload area */}
        <div>
          <label className="block text-[11px] font-medium text-gray-500 mb-2">Upload Menu (PDF / Image)</label>
          <div
            onClick={() => fileRef.current?.click()}
            className="w-full h-36 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-[#235A5D]/30 hover:bg-[#F0F7F7]/50 transition-all"
          >
            {uploading ? (
              <Loader2 size={24} className="text-[#235A5D] animate-spin" />
            ) : (
              <>
                <Upload size={24} className="text-gray-300 mb-2" />
                <span className="text-xs text-gray-400">Click to upload menu file</span>
                <span className="text-[10px] text-gray-300 mt-1">PDF, JPG, PNG supported</span>
              </>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,image/*"
            className="hidden"
            onChange={e => {
              const f = e.target.files?.[0];
              if (f) handleFileUpload(f);
            }}
          />
        </div>

        {/* Or paste URL */}
        <div>
          <label className="block text-[11px] font-medium text-gray-500 mb-1">Or paste a URL directly</label>
          <div className="flex gap-2">
            <input
              type="url"
              value={menuUrl}
              onChange={e => setMenuUrl(e.target.value)}
              placeholder="https://..."
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-[#235A5D]/30 outline-none"
            />
            <button
              onClick={handleSaveUrl}
              disabled={saving || !menuUrl.trim()}
              className="px-4 py-2 bg-[#235A5D] text-white text-xs rounded-lg hover:bg-[#2D7275] disabled:opacity-50 flex items-center gap-1.5"
            >
              {saving ? <Loader2 size={12} className="animate-spin" /> : 'Save'}
            </button>
          </div>
        </div>

        {/* Current menu preview */}
        {menuUrl && (
          <div className="pt-3 border-t border-gray-100">
            <label className="block text-[11px] font-medium text-gray-500 mb-2">Current Menu</label>
            <div className="flex items-center gap-3 p-3 bg-[#F0F7F7] rounded-lg">
              <FileText size={20} className="text-[#235A5D] shrink-0" />
              <span className="text-xs text-gray-600 truncate flex-1">{menuUrl}</span>
              <a
                href={menuUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#235A5D] hover:text-[#1A4547] shrink-0"
              >
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        )}

        {/* Success message */}
        {saved && (
          <div className="flex items-center gap-2 text-emerald-600 text-xs">
            <Check size={14} /> Menu updated successfully
          </div>
        )}
      </div>
    </div>
  );
}
