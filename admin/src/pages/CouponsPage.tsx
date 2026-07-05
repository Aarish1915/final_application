import { useState, useEffect } from "react";
import { adminFetch } from "../App";
import { Plus, Pencil, Trash2, X, Check, Tag } from "lucide-react";

type Coupon = {
  _id: string; code: string; description: string;
  discountType: "percentage" | "flat"; discountValue: number;
  minOrderAmount: number; maxDiscount: number;
  maxRedemptions: number; timesRedeemed: number; perUserLimit: number;
  active: boolean; startsAt: string | null; expiresAt: string | null;
  createdAt: string;
};

const empty = {
  code: "", description: "", discountType: "percentage" as const, discountValue: 10,
  minOrderAmount: 0, maxDiscount: 0, maxRedemptions: 0, perUserLimit: 1,
  active: true, startsAt: "", expiresAt: "",
};

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...empty });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminFetch("/admin/coupons");
      if (res.ok) { const d = await res.json(); setCoupons(d.coupons || []); }
    } catch { /* silent */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setForm({ ...empty }); setEditId(null); setError(""); setShowForm(true); };
  const openEdit = (c: Coupon) => {
    setForm({
      code: c.code, description: c.description, discountType: c.discountType,
      discountValue: c.discountValue, minOrderAmount: c.minOrderAmount,
      maxDiscount: c.maxDiscount, maxRedemptions: c.maxRedemptions,
      perUserLimit: c.perUserLimit, active: c.active,
      startsAt: c.startsAt ? c.startsAt.slice(0, 16) : "",
      expiresAt: c.expiresAt ? c.expiresAt.slice(0, 16) : "",
    });
    setEditId(c._id); setError(""); setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.code.trim()) { setError("Code is required"); return; }
    if (form.discountValue <= 0) { setError("Discount value must be > 0"); return; }
    setSaving(true); setError("");
    try {
      const body = {
        ...form,
        code: form.code.toUpperCase().trim(),
        startsAt: form.startsAt || null,
        expiresAt: form.expiresAt || null,
      };
      const res = editId
        ? await adminFetch(`/admin/coupons/${editId}`, { method: "PATCH", body: JSON.stringify(body) })
        : await adminFetch("/admin/coupons", { method: "POST", body: JSON.stringify(body) });
      if (res.ok) { await load(); setShowForm(false); }
      else { const d = await res.json(); setError(d.error || "Failed to save"); }
    } catch { setError("Failed to save"); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;
    try { await adminFetch(`/admin/coupons/${id}`, { method: "DELETE" }); setCoupons(p => p.filter(c => c._id !== id)); } catch {}
  };

  const toggleActive = async (c: Coupon) => {
    try {
      const res = await adminFetch(`/admin/coupons/${c._id}`, { method: "PATCH", body: JSON.stringify({ active: !c.active }) });
      if (res.ok) setCoupons(p => p.map(x => x._id === c._id ? { ...x, active: !x.active } : x));
    } catch {}
  };

  const inputCls = "w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-[#235A5D] transition-colors";
  const labelCls = "block text-xs font-medium text-gray-500 mb-1";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Coupons</h1>
          <p className="text-xs text-gray-400 mt-0.5">{coupons.length} coupon{coupons.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={openNew} className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#235A5D] text-white text-sm font-medium rounded-lg hover:bg-[#1C4A4D] transition-colors">
          <Plus size={16} /> Add Coupon
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-800">{editId ? "Edit Coupon" : "New Coupon"}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="px-5 py-4 space-y-4">
              {error && <p className="text-xs text-red-600 bg-red-50 p-2 rounded-lg">{error}</p>}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Coupon Code *</label>
                  <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} className={inputCls} placeholder="e.g. SAVE20" />
                </div>
                <div>
                  <label className={labelCls}>Discount Type</label>
                  <select value={form.discountType} onChange={e => setForm(f => ({ ...f, discountType: e.target.value as "percentage" | "flat" }))} className={inputCls}>
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat (₹)</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Discount Value *</label>
                  <input type="number" value={form.discountValue} onChange={e => setForm(f => ({ ...f, discountValue: +e.target.value }))} className={inputCls} placeholder="e.g. 10" />
                </div>
                <div>
                  <label className={labelCls}>Max Discount (₹) <span className="text-gray-400">0=no cap</span></label>
                  <input type="number" value={form.maxDiscount} onChange={e => setForm(f => ({ ...f, maxDiscount: +e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Min Order Amount (₹)</label>
                  <input type="number" value={form.minOrderAmount} onChange={e => setForm(f => ({ ...f, minOrderAmount: +e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Max Redemptions <span className="text-gray-400">0=unlimited</span></label>
                  <input type="number" value={form.maxRedemptions} onChange={e => setForm(f => ({ ...f, maxRedemptions: +e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Per User Limit</label>
                  <input type="number" value={form.perUserLimit} onChange={e => setForm(f => ({ ...f, perUserLimit: +e.target.value }))} className={inputCls} />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} className="w-4 h-4 rounded border-gray-300 text-[#235A5D] focus:ring-[#235A5D]" />
                    <span className="text-sm text-gray-700">Active</span>
                  </label>
                </div>
                <div>
                  <label className={labelCls}>Starts At</label>
                  <input type="datetime-local" value={form.startsAt} onChange={e => setForm(f => ({ ...f, startsAt: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Expires At</label>
                  <input type="datetime-local" value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))} className={inputCls} />
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Description</label>
                  <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className={inputCls} placeholder="e.g. 20% off on orders above ₹500" />
                </div>
              </div>
            </div>
            <div className="px-5 py-4 border-t border-gray-100 flex justify-end gap-2">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-5 py-2 bg-[#235A5D] text-white text-sm font-medium rounded-lg hover:bg-[#1C4A4D] transition-colors disabled:opacity-50">
                {saving ? "Saving..." : editId ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Coupons List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-gray-200 border-t-[#235A5D] rounded-full animate-spin" />
        </div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-16">
          <Tag size={36} className="mx-auto mb-3 text-gray-300" />
          <p className="text-sm text-gray-500">No coupons yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                <th className="text-left px-4 py-3">Code</th>
                <th className="text-left px-4 py-3 hidden sm:table-cell">Discount</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Limits</th>
                <th className="text-center px-4 py-3 hidden md:table-cell">Used</th>
                <th className="text-center px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {coupons.map(c => (
                <tr key={c._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-mono font-bold text-[#235A5D]">{c.code}</span>
                    {c.description && <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">{c.description}</p>}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="font-medium text-gray-700">
                      {c.discountType === "percentage" ? `${c.discountValue}%` : `₹${c.discountValue}`}
                    </span>
                    {c.maxDiscount > 0 && c.discountType === "percentage" && (
                      <span className="text-[11px] text-gray-400 ml-1">up to ₹{c.maxDiscount}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 hidden md:table-cell">
                    {c.minOrderAmount > 0 && <span>Min ₹{c.minOrderAmount}</span>}
                    {c.maxRedemptions > 0 && <span className="ml-2">Max {c.maxRedemptions} uses</span>}
                    {c.perUserLimit > 0 && <span className="ml-2">{c.perUserLimit}/user</span>}
                  </td>
                  <td className="px-4 py-3 text-center hidden md:table-cell">
                    <span className="text-xs font-medium text-gray-600">{c.timesRedeemed}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => toggleActive(c)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                        c.active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}>
                      {c.active ? <><Check size={10} /> Active</> : "Inactive"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(c)} className="p-1.5 text-gray-400 hover:text-[#235A5D] rounded-lg hover:bg-gray-100 transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(c._id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
