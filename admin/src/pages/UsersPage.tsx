import { useEffect, useState } from "react";
import { adminFetch } from "../App";
import { Search, Trash2, Users as UsersIcon, Mail, Calendar, MapPin, Phone, X, Eye, Home, Building2, Star } from "lucide-react";

interface UserItem { _id: string; name: string; email: string; createdAt: string; }
interface UserAddress {
  _id: string; fullName: string; phone: string; houseNo?: string;
  addressLine1?: string; locality?: string; city: string; district?: string;
  state: string; pincode: string; landmark?: string; type: string; isDefault: boolean;
}
interface UserProfile {
  phone?: string; alternatePhone?: string; gender?: string;
  dateOfBirth?: string; name?: string; email?: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [userAddresses, setUserAddresses] = useState<UserAddress[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchUsers = (q = "") => {
    setLoading(true);
    const params = q ? `?search=${encodeURIComponent(q)}` : "";
    adminFetch(`/admin/users${params}`)
      .then(r => r.json())
      .then(data => { setUsers(data.users); setTotal(data.pagination.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);
  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); fetchUsers(search); };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    await adminFetch(`/admin/users/${id}`, { method: "DELETE" });
    fetchUsers(search);
    if (selectedUser?._id === id) setSelectedUser(null);
  };

  const viewUserDetails = async (user: UserItem) => {
    setSelectedUser(user);
    setDetailLoading(true);
    try {
      const [addrRes, profileRes] = await Promise.all([
        adminFetch(`/admin/users/${user._id}/addresses`),
        adminFetch(`/admin/users/${user._id}/profile`),
      ]);
      const addrData = await addrRes.json();
      const profileData = await profileRes.json();
      setUserAddresses(addrData.addresses || []);
      setUserProfile(profileData.profile || null);
    } catch { setUserAddresses([]); setUserProfile(null); }
    setDetailLoading(false);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-lg font-semibold text-[#1A4547]">Customers</h1>
          <p className="text-xs text-gray-400 mt-0.5">{total} registered users</p>
        </div>
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
            <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-[#235A5D]/30 outline-none w-52" />
          </div>
          <button type="submit" className="px-3 py-1.5 bg-[#235A5D] text-white text-xs rounded-lg hover:bg-[#2D7275]">Search</button>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-5 h-5 border-2 border-gray-200 border-t-[#235A5D] rounded-full animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-gray-300">
            <UsersIcon size={32} className="mx-auto mb-2 opacity-40" /><p className="text-sm">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full admin-table">
              <thead><tr><th>#</th><th>Name</th><th>Email</th><th>Joined</th><th>Actions</th></tr></thead>
              <tbody>
                {users.map((user, i) => (
                  <tr key={user._id} className="cursor-pointer" onClick={() => viewUserDetails(user)}>
                    <td className="text-gray-300 text-xs">{i + 1}</td>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-medium text-[11px]">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-700 text-sm">{user.name}</span>
                      </div>
                    </td>
                    <td><span className="flex items-center gap-1 text-gray-500 text-sm"><Mail size={13} /> {user.email}</span></td>
                    <td><span className="flex items-center gap-1 text-gray-400 text-xs"><Calendar size={12} /> {new Date(user.createdAt).toLocaleDateString()}</span></td>
                    <td>
                      <div className="flex items-center gap-0.5">
                        <button onClick={(e) => { e.stopPropagation(); viewUserDetails(user); }}
                          className="p-1.5 text-gray-300 hover:text-gray-600 hover:bg-gray-50 rounded-lg"><Eye size={15} /></button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(user._id, user.name); }}
                          className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20" onClick={() => setSelectedUser(null)} />
          <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-800">Customer Details</h3>
              <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="px-5 py-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-semibold text-sm">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-800">{selectedUser.name}</p>
                  <p className="text-xs text-gray-400">{selectedUser.email}</p>
                </div>
              </div>

              {detailLoading ? (
                <div className="flex justify-center py-6">
                  <div className="w-5 h-5 border-2 border-gray-200 border-t-[#235A5D] rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div><p className="text-[11px] text-gray-400">First Ordered</p><p className="text-sm text-gray-600">{new Date(selectedUser.createdAt).toLocaleDateString()}</p></div>
                    <div><p className="text-[11px] text-gray-400">Phone</p><p className="text-sm text-gray-600 flex items-center gap-1">{userProfile?.phone ? <><Phone size={11} /> {userProfile.phone}</> : "—"}</p></div>
                  </div>

                  <div>
                    <p className="text-[11px] text-gray-400 mb-2 flex items-center gap-1"><MapPin size={11} /> Addresses ({userAddresses.length})</p>
                    {userAddresses.length === 0 ? (
                      <p className="text-sm text-gray-300 py-2">No addresses saved</p>
                    ) : (
                      <div className="space-y-2">
                        {userAddresses.sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0)).map(addr => (
                          <div key={addr._id} className={`p-3 rounded-lg border text-sm ${addr.isDefault ? "bg-gray-50 border-gray-200" : "bg-white border-gray-100"}`}>
                            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                              <span className="font-medium text-gray-700 text-xs">{addr.fullName}</span>
                              <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                addr.type === "home" ? "bg-blue-50 text-blue-500" : "bg-purple-50 text-purple-500"
                              }`}>
                                {addr.type === "home" ? <Home size={9} /> : <Building2 size={9} />}
                                {addr.type === "home" ? "Home" : "Office"}
                              </span>
                              {addr.isDefault && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-500">
                                  <Star size={9} /> Default
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500">{[addr.houseNo, addr.addressLine1, addr.locality].filter(Boolean).join(", ")}</p>
                            <p className="text-xs text-gray-500">{[addr.city, addr.district, addr.state].filter(Boolean).join(", ")} — {addr.pincode}</p>
                            {addr.landmark && <p className="text-[11px] text-gray-400 mt-0.5">Near: {addr.landmark}</p>}
                            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><Phone size={10} /> {addr.phone}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
