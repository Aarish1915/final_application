import { useState, useEffect } from 'react';
import { adminFetch } from '../App';
import { Plus, Trash2, MapPin, Loader2 } from 'lucide-react';

export default function PincodesPage() {
  const [pincodes, setPincodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  const fetchPincodes = async () => {
    try {
      const res = await adminFetch('/admin/pincodes');
      const data = await res.json();
      if (res.ok) setPincodes(data.pincodes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPincodes();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!code || code.length !== 6) {
      setError('Please enter a valid 6-digit pincode');
      return;
    }
    setAdding(true);
    try {
      const res = await adminFetch('/admin/pincodes', {
        method: 'POST',
        body: JSON.stringify({ code, city, state })
      });
      const data = await res.json();
      if (res.ok) {
        setCode(''); setCity(''); setState('');
        fetchPincodes();
      } else {
        setError(data.error || 'Failed to add pincode');
      }
    } catch (err) {
      setError('Failed to add pincode');
    }
    setAdding(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this pincode?')) return;
    try {
      await adminFetch(`/admin/pincodes/${id}`, { method: 'DELETE' });
      fetchPincodes();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Delivery Zones (Pincodes)</h1>
        <p className="text-sm text-gray-500 mt-1">Manage which pincodes you deliver to.</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-4">Add Serviceable Pincode</h2>
        <form onSubmit={handleAdd} className="flex gap-4 items-end max-w-3xl">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">Pincode *</label>
            <input type="text" maxLength={6} required value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ''))} className="w-full px-3 py-2 border rounded text-sm focus:ring-[#1A4547] focus:border-[#1A4547]" placeholder="122016" />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">City</label>
            <input type="text" value={city} onChange={e => setCity(e.target.value)} className="w-full px-3 py-2 border rounded text-sm focus:ring-[#1A4547] focus:border-[#1A4547]" placeholder="Gurugram" />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">State</label>
            <input type="text" value={state} onChange={e => setState(e.target.value)} className="w-full px-3 py-2 border rounded text-sm focus:ring-[#1A4547] focus:border-[#1A4547]" placeholder="Haryana" />
          </div>
          <button disabled={adding} type="submit" className="h-[38px] px-6 bg-[#1A4547] text-white rounded text-sm font-medium hover:bg-[#122e30] transition-colors flex items-center gap-2">
            {adding ? <Loader2 size={16} className="animate-spin" /> : <><Plus size={16} /> Add</>}
          </button>
        </form>
        {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500"><Loader2 className="mx-auto animate-spin mb-2" /> Loading pincodes...</div>
        ) : pincodes.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No serviceable pincodes added yet. Your store cannot accept orders!</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-600 font-medium">
              <tr>
                <th className="px-6 py-3">Pincode</th>
                <th className="px-6 py-3">City</th>
                <th className="px-6 py-3">State</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pincodes.map(p => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 font-semibold text-gray-900 flex items-center gap-2"><MapPin size={14} className="text-[#1A4547]"/> {p.code}</td>
                  <td className="px-6 py-3 text-gray-600">{p.city || '-'}</td>
                  <td className="px-6 py-3 text-gray-600">{p.state || '-'}</td>
                  <td className="px-6 py-3 text-right">
                    <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-700 p-1 bg-red-50 rounded"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
