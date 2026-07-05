import { useEffect, useState } from "react";
import { adminFetch } from "../App";
import {
  ShoppingBag, Filter, Plus, X, Eye, Trash2, Clock, IndianRupee,
  MapPin, Phone, RotateCcw, Truck, Search
} from "lucide-react";

interface OrderItem {
  _id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: { name: string; price: number; quantity: number }[];
  total: number;
  status: string;
  orderType: string;
  notes: string;
  createdAt: string;
  shippingAddress?: {
    fullName?: string;
    addressLine1?: string;
    city?: string;
    state?: string;
    pincode?: string;
    phone?: string;
  };
  returnRequested?: boolean;
  returnReason?: string;
  replacementRequested?: boolean;
  replacementReason?: string;
}

const emptyOrder = {
  customerName: "", customerEmail: "", customerPhone: "",
  items: [{ name: "", price: 0, quantity: 1 }],
  total: 0, orderType: "delivery", notes: "",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [filterStatus, setFilterStatus] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [viewOrder, setViewOrder] = useState<OrderItem | null>(null);
  const [form, setForm] = useState(emptyOrder);
  const [saving, setSaving] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchOrders = (status = "", start = startDate, end = endDate) => {
    setLoading(true);
    const params = [];
    if (status) params.push(`status=${status}`);
    if (start) params.push(`startDate=${start}`);
    if (end) params.push(`endDate=${end}`);
    const query = params.length > 0 ? `?${params.join("&")}` : "";
    
    adminFetch(`/admin/orders${query}`)
      .then(r => r.json())
      .then(data => { setOrders(data.orders); setTotal(data.pagination.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleFilter = (s: string) => { setFilterStatus(s); fetchOrders(s, startDate, endDate); };
  
  const handleDateFilter = () => {
    fetchOrders(filterStatus, startDate, endDate);
  };
  
  const clearDateFilter = () => {
    setStartDate("");
    setEndDate("");
    fetchOrders(filterStatus, "", "");
  };

  const handleStatusChange = async (id: string, status: string) => {
    await adminFetch(`/admin/orders/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
    fetchOrders(filterStatus);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this order?")) return;
    await adminFetch(`/admin/orders/${id}`, { method: "DELETE" });
    fetchOrders(filterStatus);
  };

  const addItem = () => setForm({ ...form, items: [...form.items, { name: "", price: 0, quantity: 1 }] });
  const removeItem = (idx: number) => setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });
  const updateItem = (idx: number, field: string, value: string | number) => {
    const items = [...form.items];
    (items[idx] as Record<string, string | number>)[field] = value;
    const total = items.reduce((s, it) => s + it.price * it.quantity, 0);
    setForm({ ...form, items, total });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminFetch("/admin/orders", { method: "POST", body: JSON.stringify(form) });
      setShowModal(false);
      setForm(emptyOrder);
      fetchOrders(filterStatus);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const statusStyle = (s: string) => {
    const map: Record<string, string> = {
      pending: "badge-yellow", preparing: "badge-blue", ready: "badge-green",
      delivered: "badge-green", cancelled: "badge-red",
    };
    return map[s] || "badge-gray";
  };

  const inputCls = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-[#235A5D]/30 focus:border-gray-300 outline-none";

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-lg font-semibold text-[#1A4547]">Orders</h1>
          <p className="text-xs text-gray-400 mt-0.5">{total} total orders</p>
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
              <Search size={14} />
            </button>
            {(startDate || endDate) && (
              <button onClick={clearDateFilter} className="p-1 text-red-500 hover:bg-red-50 rounded">
                <X size={14} />
              </button>
            )}
          </div>
          
          <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
            {["", "pending", "preparing", "ready", "delivered", "cancelled"].map(s => (
              <button key={s} onClick={() => handleFilter(s)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${filterStatus === s ? 'bg-white text-[#1A4547] shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>
                {s || "All"}
              </button>
            ))}
          </div>
          <button onClick={() => { setForm(emptyOrder); setShowModal(true); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#235A5D] text-white text-xs font-medium rounded-lg hover:bg-[#2D7275]">
            <Plus size={14} /> Create Order
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-5 h-5 border-2 border-gray-200 border-t-[#235A5D] rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 text-gray-300">
            <ShoppingBag size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Flags</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o, i) => (
                  <tr key={o._id}>
                    <td className="text-gray-300 text-xs">{i + 1}</td>
                    <td>
                      <span className="font-medium text-gray-700 text-sm">{o.customerName}</span>
                      {o.customerPhone && <p className="text-[11px] text-gray-400">{o.customerPhone}</p>}
                    </td>
                    <td className="text-gray-500">{o.items?.length || 0} items</td>
                    <td>
                      <span className="flex items-center gap-0.5 font-medium text-gray-800">
                        <IndianRupee size={12} />{o.total}
                      </span>
                    </td>
                    <td><span className="badge badge-blue">{o.orderType}</span></td>
                    <td>
                      <select value={o.status} onChange={e => handleStatusChange(o._id, e.target.value)}
                        className={`badge cursor-pointer border-0 outline-none ${statusStyle(o.status)}`}>
                        <option value="pending">Pending</option>
                        <option value="preparing">Preparing</option>
                        <option value="ready">Ready</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td>
                      <div className="flex gap-1">
                        {o.returnRequested && (
                          <span className="badge badge-red text-[10px]" title="Return requested">
                            <RotateCcw size={10} className="mr-0.5" /> Return
                          </span>
                        )}
                        {o.replacementRequested && (
                          <span className="badge badge-yellow text-[10px]" title="Replacement requested">
                            <Truck size={10} className="mr-0.5" /> Replace
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock size={11} />{new Date(o.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-0.5">
                        <button onClick={() => setViewOrder(o)} className="p-1.5 text-gray-300 hover:text-gray-600 hover:bg-gray-50 rounded-lg"><Eye size={15} /></button>
                        <button onClick={() => handleDelete(o._id)} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Order Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-800">New Order</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-[11px] font-medium text-gray-500 mb-1">Customer Name *</label>
                  <input type="text" required value={form.customerName} onChange={e => setForm({ ...form, customerName: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-500 mb-1">Email</label>
                  <input type="email" value={form.customerEmail} onChange={e => setForm({ ...form, customerEmail: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-500 mb-1">Phone</label>
                  <input type="text" value={form.customerPhone} onChange={e => setForm({ ...form, customerPhone: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-500 mb-1">Order Type</label>
                  <select value={form.orderType} onChange={e => setForm({ ...form, orderType: e.target.value })} className={inputCls}>
                    <option value="dine-in">Dine In</option>
                    <option value="takeaway">Takeaway</option>
                    <option value="delivery">Delivery</option>
                  </select>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-medium text-gray-500">Items *</label>
                  <button type="button" onClick={addItem} className="text-[11px] text-gray-500 hover:text-gray-700">+ Add</button>
                </div>
                <div className="space-y-2">
                  {form.items.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input type="text" placeholder="Item" required value={item.name} onChange={e => updateItem(idx, "name", e.target.value)}
                        className={`flex-1 ${inputCls}`} />
                      <input type="number" placeholder="₹" required min={0} value={item.price || ""} onChange={e => updateItem(idx, "price", Number(e.target.value))}
                        className={`w-20 ${inputCls}`} />
                      <input type="number" placeholder="Qty" required min={1} value={item.quantity} onChange={e => updateItem(idx, "quantity", Number(e.target.value))}
                        className={`w-14 ${inputCls}`} />
                      {form.items.length > 1 && (
                        <button type="button" onClick={() => removeItem(idx)} className="text-gray-300 hover:text-red-500"><X size={14} /></button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-right text-xs font-medium text-gray-500">Total: ₹{form.total}</div>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">Notes</label>
                <textarea rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className={`${inputCls} resize-none`} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-50 rounded-lg">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-1.5 bg-[#235A5D] text-white text-xs rounded-lg hover:bg-[#2D7275] disabled:opacity-50">
                  {saving ? "Creating..." : "Create Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Order Modal */}
      {viewOrder && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-800">Order Details</h3>
              <button onClick={() => setViewOrder(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-[11px] text-gray-400">Customer</p><p className="font-medium text-gray-700">{viewOrder.customerName}</p></div>
                {viewOrder.customerEmail && <div><p className="text-[11px] text-gray-400">Email</p><p className="text-gray-600">{viewOrder.customerEmail}</p></div>}
                {viewOrder.customerPhone && (
                  <div><p className="text-[11px] text-gray-400">Phone</p>
                    <p className="text-gray-600 flex items-center gap-1"><Phone size={11} />{viewOrder.customerPhone}</p>
                  </div>
                )}
                <div><p className="text-[11px] text-gray-400">Type</p><span className="badge badge-blue">{viewOrder.orderType}</span></div>
                <div><p className="text-[11px] text-gray-400">Status</p><span className={`badge ${statusStyle(viewOrder.status)}`}>{viewOrder.status}</span></div>
                <div><p className="text-[11px] text-gray-400">Date</p><p className="text-gray-600">{new Date(viewOrder.createdAt).toLocaleDateString()}</p></div>
              </div>

              {/* Shipping Address */}
              {viewOrder.shippingAddress && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-[11px] text-gray-400 mb-1 flex items-center gap-1"><MapPin size={11} /> Shipping Address</p>
                  <p className="text-sm text-gray-700">{viewOrder.shippingAddress.fullName}</p>
                  <p className="text-xs text-gray-500">{viewOrder.shippingAddress.addressLine1}</p>
                  <p className="text-xs text-gray-500">{[viewOrder.shippingAddress.city, viewOrder.shippingAddress.state, viewOrder.shippingAddress.pincode].filter(Boolean).join(", ")}</p>
                  {viewOrder.shippingAddress.phone && <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><Phone size={10} />{viewOrder.shippingAddress.phone}</p>}
                </div>
              )}

              {/* Return / Replacement flags */}
              {(viewOrder.returnRequested || viewOrder.replacementRequested) && (
                <div className="space-y-2">
                  {viewOrder.returnRequested && (
                    <div className="bg-red-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-red-600 flex items-center gap-1"><RotateCcw size={12} /> Return Requested</p>
                      {viewOrder.returnReason && <p className="text-xs text-red-500 mt-1">{viewOrder.returnReason}</p>}
                    </div>
                  )}
                  {viewOrder.replacementRequested && (
                    <div className="bg-amber-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-amber-600 flex items-center gap-1"><Truck size={12} /> Replacement Requested</p>
                      {viewOrder.replacementReason && <p className="text-xs text-amber-500 mt-1">{viewOrder.replacementReason}</p>}
                    </div>
                  )}
                </div>
              )}

              <hr className="border-gray-100" />
              <div>
                <p className="text-[11px] text-gray-400 mb-2">Items</p>
                {viewOrder.items?.map((it, i) => (
                  <div key={i} className="flex justify-between text-sm py-1">
                    <span className="text-gray-600">{it.name} × {it.quantity}</span>
                    <span className="font-medium text-gray-700">₹{it.price * it.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-sm font-semibold pt-2 border-t border-gray-100">
                <span>Total</span><span>₹{viewOrder.total}</span>
              </div>
              {viewOrder.notes && <p className="text-xs text-gray-400 mt-2">Notes: {viewOrder.notes}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
