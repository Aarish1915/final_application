import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/useAuth";
import { apiFetch } from "@/lib/api";
import {
  User, Mail, Phone, MapPin, Plus, Pencil, Trash2, Check, X,
  LogOut, Home, Building2, Star, ChevronRight, Package, Heart, Calendar
} from "lucide-react";

type Address = {
  _id: string;
  fullName: string;
  phone: string;
  houseNo: string;
  addressLine1: string;
  locality: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  landmark?: string;
  type: "home" | "work";
  isDefault: boolean;
};

type AddressForm = {
  fullName: string;
  phone: string;
  houseNo: string;
  addressLine1: string;
  locality: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  landmark: string;
  type: "home" | "work";
  isDefault: boolean;
};

const emptyAddress: AddressForm = {
  fullName: "", phone: "", houseNo: "", addressLine1: "", locality: "",
  city: "", district: "", state: "", pincode: "", landmark: "", type: "home", isDefault: false,
};

const indianStates = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
  "Uttarakhand","West Bengal","Delhi","Chandigarh","Puducherry","Ladakh",
  "Jammu and Kashmir","Andaman and Nicobar Islands","Dadra and Nagar Haveli and Daman and Diu","Lakshadweep",
];

export default function ProfilePage() {
  const { user, token, logout, updateUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab") === "addresses" ? "addresses" : "profile";

  // Profile state
  const [editing, setEditing] = useState(false);
  const [pf, setPf] = useState({ name: "", phone: "", alternatePhone: "", gender: "", dateOfBirth: "" });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");

  // Address state
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addrLoading, setAddrLoading] = useState(false);
  const [addrForm, setAddrForm] = useState<AddressForm | null>(null);
  const [editingAddrId, setEditingAddrId] = useState<string | null>(null);
  const [addrSaving, setAddrSaving] = useState(false);
  const [addrError, setAddrError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/login"); return; }
    setPf({
      name: user.name || "", phone: user.phone || "",
      alternatePhone: user.alternatePhone || "",
      gender: user.gender || "", dateOfBirth: user.dateOfBirth || "",
    });
  }, [user, navigate, authLoading]);

  useEffect(() => {
    if (!token || tab !== "addresses") return;
    loadAddresses();
  }, [token, tab]);

  const loadAddresses = async () => {
    setAddrLoading(true);
    try {
      const res = await apiFetch("/api/addresses");
      if (res.ok) { const d = await res.json(); setAddresses(d.addresses || []); }
    } catch { /* silent */ }
    setAddrLoading(false);
  };

  const handleProfileSave = async () => {
    if (!pf.name.trim()) return;
    setProfileSaving(true); setProfileMsg("");
    try {
      const res = await apiFetch("/api/auth/profile", {
        method: "PUT",
        body: JSON.stringify({
          name: pf.name.trim(), phone: pf.phone.trim(),
          alternatePhone: pf.alternatePhone.trim(),
          gender: pf.gender, dateOfBirth: pf.dateOfBirth,
        }),
      });
      if (res.ok) {
        const d = await res.json();
        updateUser(d.user);
        setEditing(false);
        setProfileMsg("Profile updated successfully");
        setTimeout(() => setProfileMsg(""), 3000);
      }
    } catch { setProfileMsg("Failed to update profile"); }
    setProfileSaving(false);
  };

  const handleAddrSave = async () => {
    if (!addrForm) return;
    if (!addrForm.fullName || !addrForm.phone || !addrForm.pincode || !addrForm.state || !addrForm.city) {
      setAddrError("Please fill all required fields"); return;
    }
    setAddrSaving(true); setAddrError("");
    try {
      const url = editingAddrId ? `/api/addresses/${editingAddrId}` : "/api/addresses";
      const method = editingAddrId ? "PUT" : "POST";
      const res = await apiFetch(url, { method, body: JSON.stringify(addrForm) });
      if (res.ok) { await loadAddresses(); setAddrForm(null); setEditingAddrId(null); }
      else { const d = await res.json(); setAddrError(d.error || "Failed to save"); }
    } catch { setAddrError("Failed to save address"); }
    setAddrSaving(false);
  };

  const handleAddrDelete = async (id: string) => {
    if (!confirm("Delete this address?")) return;
    try { await apiFetch(`/api/addresses/${id}`, { method: "DELETE" }); setAddresses(p => p.filter(a => a._id !== id)); } catch {}
  };

  const handleSetDefault = async (id: string) => {
    try { await apiFetch(`/api/addresses/${id}`, { method: "PUT", body: JSON.stringify({ isDefault: true }) }); await loadAddresses(); } catch {}
  };

  if (!user || authLoading) return null;

  const inputCls = "w-full px-0 py-2 bg-transparent border-b border-[#1A4547]/20 font-body text-[15px] text-[#1A3C3E] focus:outline-none focus:border-[#1A4547] transition-colors placeholder:text-[#7A9A9C]/60";
  const formInputCls = "w-full px-3 py-2.5 bg-white border border-[#C8E0E0] rounded-xl font-body text-sm text-[#1a1a1a] focus:outline-none focus:border-[#1A4547] transition-colors";
  const labelCls = "block font-body text-xs tracking-wide text-[#555] mb-1.5";

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-16 pb-8 sm:pt-20 sm:pb-10 md:pt-24 md:pb-12 overflow-hidden bg-[#F5FAFA]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 right-[10%] w-64 h-64 rounded-full bg-[#1A4547]/[0.03]" />
          <div className="absolute bottom-10 left-[5%] w-48 h-48 rounded-full bg-[#1A4547]/[0.04]" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-[#1A4547] bg-white flex items-center justify-center text-[#1A4547] font-heading text-xl sm:text-2xl font-bold">
                {user.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div>
                <h1 className="font-heading text-2xl sm:text-3xl text-[#1A3C3E] font-bold">{user.name}</h1>
                <p className="font-body text-sm text-[#7A9A9C]">{user.email}</p>
              </div>
            </div>
            <button onClick={() => { logout(); navigate("/"); }}
              className="flex items-center gap-1.5 font-body text-xs tracking-wide text-[#7A9A9C] hover:text-[#1A4547] transition-colors">
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Tabs */}
        <div className="flex gap-1 border-b border-[#C8E0E0] mb-8">
          {([{ key: "profile", label: "Profile", icon: User }, { key: "addresses", label: "Addresses", icon: MapPin }] as const).map(t => (
            <button key={t.key}
              onClick={() => setSearchParams(t.key === "profile" ? {} : { tab: t.key })}
              className={`flex items-center gap-2 px-4 sm:px-6 py-3 font-body text-sm font-medium transition-colors border-b-2 -mb-px ${
                tab === t.key ? "border-[#1A4547] text-[#1A3C3E]" : "border-transparent text-[#7A9A9C] hover:text-[#1A4547]"
              }`}>
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>

        {/* ═══ PROFILE TAB ═══ */}
        {tab === "profile" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {profileMsg && (
              <div className="mb-6 py-3 px-4 bg-green-50/60 border-l-2 border-green-500 font-body text-sm text-green-700 flex items-center gap-2">
                <Check size={16} /> {profileMsg}
              </div>
            )}

            {/* Edit / Save buttons at top */}
            <div className="flex items-center justify-between mb-6">
              <p className="font-body text-xs tracking-widest text-[#7A9A9C] uppercase">Personal Information</p>
              {editing ? (
                <div className="flex gap-2">
                  <button onClick={handleProfileSave} disabled={profileSaving}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1A4547] text-white font-body text-xs font-medium rounded-lg hover:bg-[#4A2E17] transition-colors disabled:opacity-50">
                    {profileSaving ? "Saving..." : <><Check size={14} /> Save</>}
                  </button>
                  <button onClick={() => { setEditing(false); setPf({ name: user.name||"", phone: user.phone||"", alternatePhone: user.alternatePhone||"", gender: user.gender||"", dateOfBirth: user.dateOfBirth||"" }); }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-[#1A4547] font-body text-xs font-medium rounded-lg hover:bg-[#1A4547]/[0.04] transition-colors">
                    <X size={14} /> Cancel
                  </button>
                </div>
              ) : (
                <button onClick={() => setEditing(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-[#1A4547] font-body text-xs font-medium rounded-lg hover:bg-[#1A4547]/[0.04] transition-colors border border-[#1A4547]/15">
                  <Pencil size={14} /> Edit
                </button>
              )}
            </div>

            {/* Clean text rows with dividers */}
            <div className="divide-y divide-[#C8E0E0]/70">
              {/* Name */}
              <div className="py-4 sm:py-5">
                <p className="font-body text-[11px] tracking-wide text-[#7A9A9C] uppercase mb-1.5">Full Name</p>
                {editing ? (
                  <input type="text" value={pf.name} onChange={e => setPf(p => ({ ...p, name: e.target.value }))} className={inputCls} placeholder="Your full name" />
                ) : (
                  <p className="font-body text-[15px] text-[#1A3C3E]">{user.name || "—"}</p>
                )}
              </div>

              {/* Email */}
              <div className="py-4 sm:py-5">
                <p className="font-body text-[11px] tracking-wide text-[#7A9A9C] uppercase mb-1.5">Email Address</p>
                <p className="font-body text-[15px] text-[#1A3C3E]">{user.email}</p>
                {editing && <p className="font-body text-[11px] text-[#7A9A9C] mt-1">Email cannot be changed</p>}
              </div>

              {/* Gender */}
              <div className="py-4 sm:py-5">
                <p className="font-body text-[11px] tracking-wide text-[#7A9A9C] uppercase mb-1.5">Gender</p>
                {editing ? (
                  <div className="flex gap-2 flex-wrap mt-1">
                    {["Male", "Female", "Other", "Prefer not to say"].map(g => (
                      <button key={g} onClick={() => setPf(p => ({ ...p, gender: g }))}
                        className={`px-3.5 py-1.5 rounded-full font-body text-xs font-medium transition-all ${
                          pf.gender === g
                            ? "bg-[#1A4547] text-white"
                            : "text-[#555] hover:text-[#1A4547] border border-[#C8E0E0] hover:border-[#1A4547]/30"
                        }`}>{g}</button>
                    ))}
                  </div>
                ) : (
                  <p className="font-body text-[15px] text-[#1A3C3E]">{user.gender || "Not specified"}</p>
                )}
              </div>

              {/* Date of Birth */}
              <div className="py-4 sm:py-5">
                <p className="font-body text-[11px] tracking-wide text-[#7A9A9C] uppercase mb-1.5">Date of Birth</p>
                {editing ? (
                  <input type="date" value={pf.dateOfBirth} onChange={e => setPf(p => ({ ...p, dateOfBirth: e.target.value }))} className={inputCls} />
                ) : (
                  <p className="font-body text-[15px] text-[#1A3C3E]">
                    {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "Not added yet"}
                  </p>
                )}
              </div>

              {/* Mobile Number */}
              <div className="py-4 sm:py-5">
                <p className="font-body text-[11px] tracking-wide text-[#7A9A9C] uppercase mb-1.5">Mobile Number</p>
                {editing ? (
                  <input type="tel" value={pf.phone} onChange={e => setPf(p => ({ ...p, phone: e.target.value }))} placeholder="+91 98765 43210" className={inputCls} />
                ) : (
                  <p className="font-body text-[15px] text-[#1A3C3E]">{user.phone || "Not added yet"}</p>
                )}
              </div>

              {/* Alternate Mobile */}
              <div className="py-4 sm:py-5">
                <p className="font-body text-[11px] tracking-wide text-[#7A9A9C] uppercase mb-1.5">Alternate Mobile Number</p>
                {editing ? (
                  <input type="tel" value={pf.alternatePhone} onChange={e => setPf(p => ({ ...p, alternatePhone: e.target.value }))} placeholder="+91 98765 43210 (optional)" className={inputCls} />
                ) : (
                  <p className="font-body text-[15px] text-[#1A3C3E]">{user.alternatePhone || "Not added yet"}</p>
                )}
              </div>
            </div>

            {/* Quick links — minimal, no cards */}
            <div className="mt-10 pt-8 border-t border-[#C8E0E0]/70">
              <p className="font-body text-[11px] tracking-widest text-[#7A9A9C] uppercase mb-5">Quick Links</p>
              <div className="space-y-0 divide-y divide-[#C8E0E0]/50">
                {[
                  { to: "/my-orders", icon: Package, label: "My Orders" },
                  { to: "/wishlist", icon: Heart, label: "Wishlist" },
                  { to: "/profile?tab=addresses", icon: MapPin, label: "My Addresses" },
                ].map(link => (
                  <button key={link.to} onClick={() => navigate(link.to)}
                    className="flex items-center w-full py-3.5 text-left group transition-colors hover:bg-[#1A4547]/[0.02]">
                    <link.icon size={16} className="text-[#7A9A9C] group-hover:text-[#1A4547] transition-colors mr-3 shrink-0" />
                    <span className="font-body text-sm text-[#1A3C3E] flex-1">{link.label}</span>
                    <ChevronRight size={15} className="text-[#7A9A9C]/50 group-hover:text-[#1A4547] transition-colors" />
                  </button>
                ))}
              </div>
            </div>

          </motion.div>
        )}

        {/* ═══ ADDRESSES TAB ═══ */}
        {tab === "addresses" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {!addrForm && (
              <button onClick={() => { setAddrForm({ ...emptyAddress }); setEditingAddrId(null); setAddrError(""); }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1A4547] text-white font-body text-sm font-medium rounded-xl hover:bg-[#4A2E17] transition-colors mb-6">
                <Plus size={16} /> Add New Address
              </button>
            )}

            {/* Address Form */}
            {addrForm && (
              <div className="mb-8 p-5 sm:p-6 rounded-2xl bg-[#F5FAFA] border border-[#1A4547]/[0.08]">
                <h3 className="font-heading text-lg text-[#1A3C3E] font-bold mb-5">
                  {editingAddrId ? "Edit Address" : "Add New Address"}
                </h3>
                {addrError && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl font-body text-sm text-red-700">{addrError}</div>}
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Name *</label>
                      <input type="text" value={addrForm.fullName} onChange={e => setAddrForm(p => p ? { ...p, fullName: e.target.value } : p)} className={formInputCls} placeholder="Recipient name" />
                    </div>
                    <div>
                      <label className={labelCls}>Mobile Number *</label>
                      <input type="tel" value={addrForm.phone} onChange={e => setAddrForm(p => p ? { ...p, phone: e.target.value } : p)} className={formInputCls} placeholder="+91 98765 43210" />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Pin Code *</label>
                      <input type="text" value={addrForm.pincode} onChange={e => setAddrForm(p => p ? { ...p, pincode: e.target.value } : p)} className={formInputCls} placeholder="110001" maxLength={6} />
                    </div>
                    <div>
                      <label className={labelCls}>State *</label>
                      <select value={addrForm.state} onChange={e => setAddrForm(p => p ? { ...p, state: e.target.value } : p)} className={formInputCls}>
                        <option value="">Select State</option>
                        {indianStates.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>House No., Building, Tower, Block *</label>
                    <input type="text" value={addrForm.houseNo} onChange={e => setAddrForm(p => p ? { ...p, houseNo: e.target.value } : p)} className={formInputCls} placeholder="e.g. Flat 302, Tower B, Green Heights" />
                  </div>

                  <div>
                    <label className={labelCls}>Address (Street, Road)</label>
                    <input type="text" value={addrForm.addressLine1} onChange={e => setAddrForm(p => p ? { ...p, addressLine1: e.target.value } : p)} className={formInputCls} placeholder="e.g. MG Road, Sector 28" />
                  </div>

                  <div>
                    <label className={labelCls}>Locality / Town</label>
                    <input type="text" value={addrForm.locality} onChange={e => setAddrForm(p => p ? { ...p, locality: e.target.value } : p)} className={formInputCls} placeholder="e.g. DLF Phase IV" />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>City *</label>
                      <input type="text" value={addrForm.city} onChange={e => setAddrForm(p => p ? { ...p, city: e.target.value } : p)} className={formInputCls} placeholder="City" />
                    </div>
                    <div>
                      <label className={labelCls}>District</label>
                      <input type="text" value={addrForm.district} onChange={e => setAddrForm(p => p ? { ...p, district: e.target.value } : p)} className={formInputCls} placeholder="District" />
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Landmark (optional)</label>
                    <input type="text" value={addrForm.landmark || ""} onChange={e => setAddrForm(p => p ? { ...p, landmark: e.target.value } : p)} className={formInputCls} placeholder="Near..." />
                  </div>

                  <div className="flex flex-wrap gap-4 items-center">
                    <div>
                      <label className={labelCls}>Address Type</label>
                      <div className="flex gap-2">
                        {(["home", "work"] as const).map(t => (
                          <button key={t} onClick={() => setAddrForm(p => p ? { ...p, type: t } : p)}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-body text-xs font-medium transition-colors ${
                              addrForm.type === t ? "bg-[#1A4547] text-white" : "bg-white border border-[#C8E0E0] text-[#555] hover:border-[#1A4547]/30"
                            }`}>
                            {t === "home" ? <Home size={13} /> : <Building2 size={13} />}
                            {t === "home" ? "Home" : "Office"}
                          </button>
                        ))}
                      </div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer mt-4 sm:mt-0">
                      <input type="checkbox" checked={addrForm.isDefault} onChange={e => setAddrForm(p => p ? { ...p, isDefault: e.target.checked } : p)}
                        className="w-4 h-4 rounded border-[#C8E0E0] text-[#1A4547] focus:ring-[#1A4547]" />
                      <span className="font-body text-sm text-[#555]">Make this my default address</span>
                    </label>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button onClick={handleAddrSave} disabled={addrSaving}
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1A4547] text-white font-body text-sm font-medium rounded-xl hover:bg-[#4A2E17] transition-colors disabled:opacity-50">
                      {addrSaving ? "Saving..." : <><Check size={16} /> {editingAddrId ? "Update" : "Save"} Address</>}
                    </button>
                    <button onClick={() => { setAddrForm(null); setEditingAddrId(null); setAddrError(""); }}
                      className="inline-flex items-center gap-2 px-6 py-2.5 border border-[#1A4547]/15 text-[#1A4547] font-body text-sm font-medium rounded-xl hover:bg-[#1A4547]/[0.04] transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Address List */}
            {addrLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-[#1A4547]/20 border-t-[#1A4547] rounded-full animate-spin" />
              </div>
            ) : addresses.length === 0 && !addrForm ? (
              <div className="text-center py-16">
                <MapPin size={40} className="mx-auto mb-3 text-[#7A9A9C]/30" />
                <p className="font-heading text-lg text-[#1A3C3E] font-bold mb-1">No addresses yet</p>
                <p className="font-body text-sm text-[#7A9A9C]">Add your first delivery address to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {addresses.sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0)).map(addr => (
                  <div key={addr._id}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                      addr.isDefault ? "bg-[#F5FAFA] border-[#1A4547]/15" : "bg-white border-[#1A4547]/[0.06] hover:border-[#1A4547]/[0.12]"
                    }`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="font-heading text-sm font-bold text-[#1A3C3E]">{addr.fullName}</span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide uppercase ${
                            addr.type === "home" ? "bg-[#1A4547]/[0.06] text-[#1A4547]" : "bg-blue-50 text-blue-600"
                          }`}>
                            {addr.type === "home" ? <Home size={10} /> : <Building2 size={10} />}
                            {addr.type === "home" ? "Home" : "Office"}
                          </span>
                          {addr.isDefault && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-50 text-green-600">
                              <Star size={10} /> Default
                            </span>
                          )}
                        </div>
                        <p className="font-body text-[13px] text-[#555] leading-relaxed">
                          {[addr.houseNo, addr.addressLine1, addr.locality].filter(Boolean).join(", ")}
                        </p>
                        <p className="font-body text-[13px] text-[#555]">
                          {[addr.city, addr.district, addr.state].filter(Boolean).join(", ")} — {addr.pincode}
                        </p>
                        {addr.landmark && <p className="font-body text-[12px] text-[#7A9A9C] mt-1">Near: {addr.landmark}</p>}
                        <p className="font-body text-[13px] text-[#555] mt-1.5 flex items-center gap-1"><Phone size={12} /> {addr.phone}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {!addr.isDefault && (
                          <button onClick={() => handleSetDefault(addr._id)} title="Set as default"
                            className="p-2 text-[#7A9A9C] hover:text-[#1A4547] hover:bg-[#1A4547]/[0.04] rounded-lg transition-colors">
                            <Star size={16} />
                          </button>
                        )}
                        <button onClick={() => {
                          setAddrForm({
                            fullName: addr.fullName, phone: addr.phone, houseNo: addr.houseNo || "",
                            addressLine1: addr.addressLine1 || "", locality: addr.locality || "",
                            city: addr.city, district: addr.district || "", state: addr.state,
                            pincode: addr.pincode, landmark: addr.landmark || "",
                            type: addr.type, isDefault: addr.isDefault,
                          });
                          setEditingAddrId(addr._id); setAddrError("");
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }} title="Edit"
                          className="p-2 text-[#7A9A9C] hover:text-[#1A4547] hover:bg-[#1A4547]/[0.04] rounded-lg transition-colors">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => handleAddrDelete(addr._id)} title="Delete"
                          className="p-2 text-[#7A9A9C] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </section>

      <Footer />
    </div>
  );
}
