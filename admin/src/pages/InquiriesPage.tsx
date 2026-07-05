import { useState, useEffect } from "react";
import { adminFetch } from "../App";
import { Mail, Trash2, Eye, X, Clock, CheckCircle, AlertCircle } from "lucide-react";

type Inquiry = {
  _id: string; name: string; email: string; phone?: string;
  subject: string; message: string; status: string;
  createdAt: string; updatedAt: string;
};

const statusColors: Record<string, string> = {
  new: "bg-blue-50 text-blue-600",
  read: "bg-amber-50 text-amber-600",
  replied: "bg-emerald-50 text-emerald-600",
  closed: "bg-gray-50 text-gray-400",
};

const statusIcons: Record<string, typeof Clock> = {
  new: AlertCircle, read: Eye, replied: CheckCircle, closed: X,
};

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState<Inquiry | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const url = filter ? `/admin/inquiries?status=${filter}` : "/admin/inquiries";
      const res = await adminFetch(url);
      const data = await res.json();
      setInquiries(data.inquiries || []);
    } catch { /* silent */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, [filter]);

  const updateStatus = async (id: string, status: string) => {
    await adminFetch(`/admin/inquiries/${id}`, { method: "PUT", body: JSON.stringify({ status }) });
    setInquiries(prev => prev.map(i => i._id === id ? { ...i, status } : i));
    if (selected?._id === id) setSelected({ ...selected, status });
  };

  const deleteInquiry = async (id: string) => {
    if (!confirm("Delete this inquiry?")) return;
    await adminFetch(`/admin/inquiries/${id}`, { method: "DELETE" });
    setInquiries(prev => prev.filter(i => i._id !== id));
    if (selected?._id === id) setSelected(null);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-lg font-semibold text-[#1A4547]">Inquiries</h1>
          <p className="text-xs text-gray-400 mt-0.5">Contact form submissions</p>
        </div>
        <div className="flex gap-1.5">
          {["", "new", "read", "replied", "closed"].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors
                ${filter === s ? "bg-[#235A5D] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
              {s || "All"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 border-2 border-gray-200 border-t-[#235A5D] rounded-full animate-spin" />
        </div>
      ) : inquiries.length === 0 ? (
        <div className="text-center py-16 text-gray-300">
          <Mail size={32} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm">No inquiries yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th className="hidden sm:table-cell">Subject</th>
                  <th className="hidden md:table-cell">Email</th>
                  <th>Status</th>
                  <th className="hidden lg:table-cell">Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {inquiries.map(inq => {
                  const Icon = statusIcons[inq.status] || AlertCircle;
                  return (
                    <tr key={inq._id} className="cursor-pointer"
                      onClick={() => { setSelected(inq); if (inq.status === "new") updateStatus(inq._id, "read"); }}>
                      <td>
                        <p className="font-medium text-gray-700 text-sm">{inq.name}</p>
                        <p className="text-[11px] text-gray-400 sm:hidden">{inq.subject}</p>
                      </td>
                      <td className="text-gray-500 hidden sm:table-cell">{inq.subject}</td>
                      <td className="text-gray-400 hidden md:table-cell">{inq.email}</td>
                      <td>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium ${statusColors[inq.status] || statusColors.new}`}>
                          <Icon size={11} />{inq.status}
                        </span>
                      </td>
                      <td className="text-gray-400 text-xs hidden lg:table-cell">{new Date(inq.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button onClick={(e) => { e.stopPropagation(); deleteInquiry(inq._id); }}
                          className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={15} /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20" onClick={() => setSelected(null)} />
          <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-800">Inquiry Details</h3>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="px-5 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-[11px] text-gray-400">Name</p><p className="text-sm font-medium text-gray-700">{selected.name}</p></div>
                <div><p className="text-[11px] text-gray-400">Email</p><a href={`mailto:${selected.email}`} className="text-sm text-gray-600 hover:underline">{selected.email}</a></div>
                {selected.phone && <div><p className="text-[11px] text-gray-400">Phone</p><a href={`tel:${selected.phone}`} className="text-sm text-gray-600 hover:underline">{selected.phone}</a></div>}
                <div><p className="text-[11px] text-gray-400">Subject</p><p className="text-sm text-gray-600">{selected.subject}</p></div>
              </div>
              <div>
                <p className="text-[11px] text-gray-400 mb-1">Message</p>
                <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg">{selected.message}</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-400 mb-1">Received</p>
                <p className="text-xs text-gray-500">{new Date(selected.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-400 mb-2">Update Status</p>
                <div className="flex gap-1.5 flex-wrap">
                  {["new", "read", "replied", "closed"].map(s => (
                    <button key={s} onClick={() => updateStatus(selected._id, s)}
                      className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors
                        ${selected.status === s ? "bg-[#235A5D] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
