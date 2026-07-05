import { useEffect, useState } from "react";
import { adminFetch } from "../App";
import { CreditCard, Plus, X, Filter, IndianRupee, Clock, CheckCircle, AlertCircle } from "lucide-react";

interface PaymentItem {
  _id: string; orderId: string; amount: number; method: string;
  status: string; transactionId: string; customerName: string; createdAt: string;
  // Razorpay fields
  email?: string; paymentMethod?: string; razorpayPaymentId?: string;
  razorpaySignature?: string; receipt?: string;
}

const emptyPayment = { orderId: "", amount: 0, method: "cash", status: "completed", transactionId: "", customerName: "" };

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [filterStatus, setFilterStatus] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyPayment);
  const [saving, setSaving] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchPayments = (status = "", start = startDate, end = endDate) => {
    setLoading(true);
    const params = [];
    if (status) params.push(`status=${status}`);
    if (start) params.push(`startDate=${start}`);
    if (end) params.push(`endDate=${end}`);
    const query = params.length > 0 ? `?${params.join("&")}` : "";
    
    adminFetch(`/admin/payments${query}`)
      .then(r => r.json())
      .then(data => { setPayments(data.payments); setTotal(data.pagination.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPayments(); }, []);
  
  const handleFilter = (s: string) => { setFilterStatus(s); fetchPayments(s, startDate, endDate); };
  
  const handleDateFilter = () => {
    fetchPayments(filterStatus, startDate, endDate);
  };
  
  const clearDateFilter = () => {
    setStartDate("");
    setEndDate("");
    fetchPayments(filterStatus, "", "");
  };

  const handleStatusChange = async (id: string, status: string) => {
    await adminFetch(`/admin/payments/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
    fetchPayments(filterStatus);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      await adminFetch("/admin/payments", { method: "POST", body: JSON.stringify(form) });
      setShowModal(false); setForm(emptyPayment); fetchPayments(filterStatus);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const statusIcon = (s: string) => {
    if (s === "completed") return <CheckCircle size={12} className="text-emerald-500" />;
    if (s === "pending") return <Clock size={12} className="text-amber-500" />;
    if (s === "failed") return <AlertCircle size={12} className="text-red-500" />;
    return <AlertCircle size={12} className="text-blue-500" />;
  };

  const statusColor = (s: string) => {
    const map: Record<string, string> = { completed: "badge-green", pending: "badge-yellow", failed: "badge-red", refunded: "badge-blue" };
    return map[s] || "badge-gray";
  };

  const totalRevenue = payments.filter(p => p.status === "completed").reduce((s, p) => s + p.amount, 0);
  const inputCls = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-[#235A5D]/30 outline-none";

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-lg font-semibold text-[#1A4547]">Payments</h1>
          <p className="text-xs text-gray-400 mt-0.5">{total} payments · Revenue: ₹{totalRevenue.toLocaleString()}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          {/* Date Filter */}
          <div className="flex items-center gap-2 bg-white px-2 py-1.5 rounded-lg border border-gray-200">
            <input 
              type="date" 
              value={startDate} 
              onChange={e => setStartDate(e.target.value)}
              className="text-xs outline-none bg-transparent"
            />
            <span className="text-gray-400 text-xs">to</span>
            <input 
              type="date" 
              value={endDate} 
              onChange={e => setEndDate(e.target.value)}
              className="text-xs outline-none bg-transparent"
            />
            <button onClick={handleDateFilter} className="ml-1 p-1 bg-[#F2F8F8] text-[#1A4547] rounded hover:bg-[#D8EDED]">
              <Filter size={14} />
            </button>
            {(startDate || endDate) && (
              <button onClick={clearDateFilter} className="p-1 text-red-500 hover:bg-red-50 rounded">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
            {["", "pending", "completed", "failed", "refunded"].map(s => (
              <button key={s} onClick={() => handleFilter(s)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${filterStatus === s ? 'bg-white text-[#1A4547] shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>
                {s || "All"}
              </button>
            ))}
          </div>
          <button onClick={() => { setForm(emptyPayment); setShowModal(true); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#235A5D] text-white text-xs font-medium rounded-lg hover:bg-[#2D7275]">
            <Plus size={14} /> Record
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-5 h-5 border-2 border-gray-200 border-t-[#235A5D] rounded-full animate-spin" />
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-12 text-gray-300">
            <CreditCard size={32} className="mx-auto mb-2 opacity-40" /><p className="text-sm">No payments recorded</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full admin-table">
              <thead><tr><th>#</th><th>Customer</th><th>Amount</th><th>Method</th><th>Transaction ID</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>
                {payments.map((p, i) => (
                  <tr key={p._id}>
                    <td className="text-gray-300 text-xs">{i + 1}</td>
                    <td className="font-medium text-gray-700">{p.customerName || p.email || "—"}</td>
                    <td><span className="flex items-center gap-0.5 font-medium text-gray-800"><IndianRupee size={12} />{(p.amount || 0).toLocaleString()}</span></td>
                    <td><span className="badge badge-blue">{(p.method || p.paymentMethod || "razorpay").toUpperCase()}</span></td>
                    <td><span className="text-gray-400 text-xs font-mono">{p.transactionId || p.razorpayPaymentId || "—"}</span></td>
                    <td>
                      <select value={p.status} onChange={e => handleStatusChange(p._id, e.target.value)}
                        className={`badge cursor-pointer border-0 outline-none ${statusColor(p.status)}`}>
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="failed">Failed</option>
                        <option value="refunded">Refunded</option>
                      </select>
                    </td>
                    <td><span className="flex items-center gap-1 text-xs text-gray-400">{statusIcon(p.status)}{new Date(p.createdAt).toLocaleDateString()}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-800">Record Payment</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">Customer Name</label>
                <input type="text" value={form.customerName} onChange={e => setForm({ ...form, customerName: e.target.value })} className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-gray-500 mb-1">Amount *</label>
                  <input type="number" required min={0} value={form.amount || ""} onChange={e => setForm({ ...form, amount: Number(e.target.value) })} className={inputCls} />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-500 mb-1">Method</label>
                  <select value={form.method} onChange={e => setForm({ ...form, method: e.target.value })} className={inputCls}>
                    <option value="cash">Cash</option><option value="card">Card</option>
                    <option value="upi">UPI</option><option value="online">Online</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">Transaction ID</label>
                <input type="text" value={form.transactionId} onChange={e => setForm({ ...form, transactionId: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">Status</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className={inputCls}>
                  <option value="pending">Pending</option><option value="completed">Completed</option>
                  <option value="failed">Failed</option><option value="refunded">Refunded</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-50 rounded-lg">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-1.5 bg-[#235A5D] text-white text-xs rounded-lg hover:bg-[#2D7275] disabled:opacity-50">
                  {saving ? "Saving..." : "Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
