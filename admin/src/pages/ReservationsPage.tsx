import { useEffect, useState } from "react";
import { adminFetch } from "../App";
import { CalendarCheck, Trash2, Phone, Mail, Users, Clock, Filter } from "lucide-react";

interface ReservationItem {
  _id: string; name: string; phone: string; email: string;
  date: string; time: string; guests: number; occasion: string;
  request: string; status: "pending" | "confirmed" | "cancelled"; createdAt: string;
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<ReservationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [filterStatus, setFilterStatus] = useState("");

  const fetchReservations = (status = "") => {
    setLoading(true);
    const params = status ? `?status=${status}` : "";
    adminFetch(`/admin/reservations${params}`)
      .then(r => r.json())
      .then(data => { setReservations(data.reservations); setTotal(data.pagination.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReservations(); }, []);
  const handleFilter = (status: string) => { setFilterStatus(status); fetchReservations(status); };

  const handleStatusChange = async (id: string, status: string) => {
    await adminFetch(`/admin/reservations/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
    fetchReservations(filterStatus);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete reservation by "${name}"?`)) return;
    await adminFetch(`/admin/reservations/${id}`, { method: "DELETE" });
    fetchReservations(filterStatus);
  };

  const statusColor = (s: string) => {
    if (s === "confirmed") return "badge-green";
    if (s === "pending") return "badge-yellow";
    return "badge-red";
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-lg font-semibold text-[#1A4547]">Reservations</h1>
          <p className="text-xs text-gray-400 mt-0.5">{total} table reservations</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-gray-300" />
          {["", "pending", "confirmed", "cancelled"].map(s => (
            <button key={s} onClick={() => handleFilter(s)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors
                ${filterStatus === s ? "bg-[#235A5D] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
              {s || "All"}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-5 h-5 border-2 border-gray-200 border-t-[#235A5D] rounded-full animate-spin" />
          </div>
        ) : reservations.length === 0 ? (
          <div className="text-center py-12 text-gray-300">
            <CalendarCheck size={32} className="mx-auto mb-2 opacity-40" /><p className="text-sm">No reservations found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full admin-table">
              <thead><tr><th>#</th><th>Guest</th><th>Contact</th><th>Date & Time</th><th>Guests</th><th>Occasion</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {reservations.map((r, i) => (
                  <tr key={r._id}>
                    <td className="text-gray-300 text-xs">{i + 1}</td>
                    <td>
                      <span className="font-medium text-gray-700 text-sm">{r.name}</span>
                      {r.request && <p className="text-[11px] text-gray-400 truncate max-w-[180px]">{r.request}</p>}
                    </td>
                    <td>
                      <div className="space-y-0.5">
                        <span className="flex items-center gap-1 text-xs text-gray-500"><Phone size={11} />{r.phone}</span>
                        {r.email && <span className="flex items-center gap-1 text-xs text-gray-400"><Mail size={11} />{r.email}</span>}
                      </div>
                    </td>
                    <td><span className="flex items-center gap-1 text-sm text-gray-600"><Clock size={13} className="text-gray-400" />{r.date} at {r.time}</span></td>
                    <td><span className="flex items-center gap-1 text-sm text-gray-600"><Users size={13} /> {r.guests}</span></td>
                    <td><span className="text-gray-500 text-sm">{r.occasion || "—"}</span></td>
                    <td>
                      <select value={r.status} onChange={e => handleStatusChange(r._id, e.target.value)}
                        className={`badge cursor-pointer border-0 outline-none ${statusColor(r.status)}`}>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td>
                      <button onClick={() => handleDelete(r._id, r.name)} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg">
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
