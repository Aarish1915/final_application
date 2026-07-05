import { useState, useEffect, useCallback } from "react";
import { adminFetch } from "../App";
import { Plus, X, Trash2, Briefcase, FileText, Download, Eye, ChevronDown } from "lucide-react";

type Job = { _id: string; title: string; department: string; location: string; type: string; description: string; requirements: string; active: boolean; createdAt: string };
type Application = { _id: string; jobId: string; name: string; email: string; phone: string; coverLetter: string; resumeUrl: string; resumeKey: string; status: string; createdAt: string };
type JobForm = { title: string; department: string; location: string; type: string; description: string; requirements: string; active: boolean };

const emptyJob: JobForm = { title: "", department: "", location: "", type: "Full-time", description: "", requirements: "", active: true };

export default function CareersPage() {
  const [tab, setTab] = useState<"jobs" | "applications">("jobs");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [form, setForm] = useState<JobForm>(emptyJob);
  const [saving, setSaving] = useState(false);
  const [filterJobId, setFilterJobId] = useState("");
  const [viewApp, setViewApp] = useState<Application | null>(null);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try { const r = await adminFetch("/admin/careers"); const d = await r.json(); setJobs(d.jobs || []); }
    catch { setJobs([]); } finally { setLoading(false); }
  }, []);

  const fetchApps = useCallback(async (jobId?: string) => {
    try {
      const url = jobId ? `/admin/applications?jobId=${jobId}` : "/admin/applications";
      const r = await adminFetch(url); const d = await r.json(); setApps(d.applications || []);
    } catch { setApps([]); }
  }, []);

  useEffect(() => { fetchJobs(); fetchApps(); }, [fetchJobs, fetchApps]);

  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault(); if (!form.title.trim()) return; setSaving(true);
    try {
      const url = editingJob ? `/admin/careers/${editingJob._id}` : "/admin/careers";
      const method = editingJob ? "PATCH" : "POST";
      const res = await adminFetch(url, { method, body: JSON.stringify(form) });
      if (res.ok) { fetchJobs(); resetForm(); }
    } catch (err) { console.error(err); } finally { setSaving(false); }
  };

  const handleDeleteJob = async (id: string) => {
    if (!confirm("Delete this job posting?")) return;
    await adminFetch(`/admin/careers/${id}`, { method: "DELETE" });
    fetchJobs();
  };

  const handleToggleActive = async (job: Job) => {
    await adminFetch(`/admin/careers/${job._id}`, { method: "PATCH", body: JSON.stringify({ active: !job.active }) });
    fetchJobs();
  };

  const handleUpdateAppStatus = async (appId: string, status: string) => {
    await adminFetch(`/admin/applications/${appId}`, { method: "PATCH", body: JSON.stringify({ status }) });
    fetchApps(filterJobId || undefined);
  };

  const handleDeleteApp = async (id: string) => {
    if (!confirm("Delete this application?")) return;
    await adminFetch(`/admin/applications/${id}`, { method: "DELETE" });
    fetchApps(filterJobId || undefined);
  };

  const handleDownloadResume = async (key: string) => {
    try {
      const res = await adminFetch("/admin/applications/download-resume", { method: "POST", body: JSON.stringify({ key }) });
      const data = await res.json();
      if (data.downloadUrl) window.open(data.downloadUrl, "_blank");
    } catch { alert("Failed to get download link"); }
  };

  const resetForm = () => { setForm(emptyJob); setEditingJob(null); setShowForm(false); };
  const openEdit = (j: Job) => {
    setEditingJob(j);
    setForm({ title: j.title, department: j.department, location: j.location, type: j.type, description: j.description, requirements: j.requirements, active: j.active });
    setShowForm(true);
  };

  const formatDate = (d: string) => { try { return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); } catch { return d; } };
  const getJobTitle = (jobId: string) => jobs.find(j => j._id === jobId)?.title || "Unknown";
  const inputCls = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-[#235A5D]/30 outline-none";
  const labelCls = "block text-[11px] font-medium text-gray-500 mb-1";
  const statusColors: Record<string, string> = { new: "bg-blue-50 text-blue-600", reviewed: "bg-amber-50 text-amber-600", shortlisted: "bg-emerald-50 text-emerald-600", rejected: "bg-red-50 text-red-500", hired: "bg-purple-50 text-purple-600" };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2"><Briefcase size={20} className="text-[#235A5D]" /> Careers</h1>
          <p className="text-xs text-gray-400 mt-0.5">{tab === "jobs" ? `${jobs.length} job postings` : `${apps.length} applications`}</p>
        </div>
        {tab === "jobs" && <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-1 px-3 py-1.5 bg-[#235A5D] text-white rounded-lg hover:bg-[#2D7275] text-xs"><Plus size={14} /> Add Job</button>}
      </div>

      <div className="flex gap-1 mb-5 bg-gray-50 rounded-lg p-1 w-fit">
        <button onClick={() => setTab("jobs")} className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${tab === "jobs" ? "bg-white text-[#1A4547] shadow-sm" : "text-gray-400 hover:text-gray-600"}`}>Job Postings</button>
        <button onClick={() => { setTab("applications"); fetchApps(filterJobId || undefined); }} className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${tab === "applications" ? "bg-white text-[#1A4547] shadow-sm" : "text-gray-400 hover:text-gray-600"}`}>Applications</button>
      </div>

      {tab === "jobs" ? (
        loading ? <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-gray-200 border-t-[#235A5D] rounded-full animate-spin" /></div>
        : jobs.length === 0 ? <div className="text-center py-20"><Briefcase size={40} className="mx-auto text-gray-200 mb-3" /><p className="text-sm text-gray-400">No job postings yet</p></div>
        : (
          <div className="space-y-2">
            {jobs.map(j => (
              <div key={j._id} className={`bg-white rounded-xl border border-gray-100 p-4 ${!j.active ? "opacity-50" : ""}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-gray-800">{j.title}</h3>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${j.active ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-400"}`}>{j.active ? "Active" : "Inactive"}</span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                      {j.department && <span>{j.department}</span>}
                      {j.location && <span>📍 {j.location}</span>}
                      <span>{j.type}</span>
                      <span>{formatDate(j.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => handleToggleActive(j)} className="px-2 py-1 text-[11px] rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">{j.active ? "Deactivate" : "Activate"}</button>
                    <button onClick={() => openEdit(j)} className="px-2 py-1 text-[11px] rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">Edit</button>
                    <button onClick={() => handleDeleteJob(j._id)} className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <>
          <div className="mb-4 flex items-center gap-2">
            <div className="relative">
              <select value={filterJobId} onChange={e => { setFilterJobId(e.target.value); fetchApps(e.target.value || undefined); }} className="pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm appearance-none bg-white cursor-pointer">
                <option value="">All Jobs</option>
                {jobs.map(j => <option key={j._id} value={j._id}>{j.title}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
            </div>
          </div>
          {apps.length === 0 ? <div className="text-center py-20"><FileText size={40} className="mx-auto text-gray-200 mb-3" /><p className="text-sm text-gray-400">No applications yet</p></div>
          : (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <table className="w-full admin-table">
                <thead><tr><th>Applicant</th><th className="hidden md:table-cell">Job</th><th>Status</th><th className="hidden sm:table-cell">Date</th><th>Actions</th></tr></thead>
                <tbody>
                  {apps.map(a => (
                    <tr key={a._id}>
                      <td><p className="text-sm font-medium text-gray-700">{a.name}</p><p className="text-[11px] text-gray-400">{a.email}</p></td>
                      <td className="hidden md:table-cell"><span className="text-xs text-gray-500">{getJobTitle(a.jobId)}</span></td>
                      <td>
                        <select value={a.status} onChange={e => handleUpdateAppStatus(a._id, e.target.value)}
                          className={`text-[11px] font-medium px-2 py-0.5 rounded-md border-0 cursor-pointer ${statusColors[a.status] || "bg-gray-50 text-gray-500"}`}>
                          <option value="new">New</option><option value="reviewed">Reviewed</option><option value="shortlisted">Shortlisted</option><option value="rejected">Rejected</option><option value="hired">Hired</option>
                        </select>
                      </td>
                      <td className="hidden sm:table-cell"><span className="text-xs text-gray-400">{formatDate(a.createdAt)}</span></td>
                      <td>
                        <div className="flex items-center gap-1">
                          <button onClick={() => setViewApp(a)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50" title="View"><Eye size={14} /></button>
                          {a.resumeKey && <button onClick={() => handleDownloadResume(a.resumeKey)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50" title="Download Resume"><Download size={14} /></button>}
                          <button onClick={() => handleDeleteApp(a._id)} className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50" title="Delete"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Job Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-800">{editingJob ? "Edit Job" : "New Job Posting"}</h2>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveJob} className="p-5 space-y-4">
              <div><label className={labelCls}>Job Title *</label><input type="text" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className={inputCls} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelCls}>Department</label><input type="text" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} className={inputCls} placeholder="e.g. Kitchen, Marketing" /></div>
                <div><label className={labelCls}>Location</label><input type="text" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className={inputCls} placeholder="e.g. Delhi, Remote" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelCls}>Type</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className={inputCls}>
                    {["Full-time", "Part-time", "Contract", "Internship"].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-600">
                    <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} className="w-3.5 h-3.5 rounded border-gray-300" /> Active
                  </label>
                </div>
              </div>
              <div><label className={labelCls}>Description</label><textarea rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className={`${inputCls} resize-none`} /></div>
              <div><label className={labelCls}>Requirements</label><textarea rows={3} value={form.requirements} onChange={e => setForm({ ...form, requirements: e.target.value })} className={`${inputCls} resize-none`} placeholder="One requirement per line" /></div>
              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button type="button" onClick={resetForm} className="px-3 py-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-1.5 bg-[#235A5D] text-white text-xs rounded-lg hover:bg-[#2D7275] disabled:opacity-50">{saving ? "Saving..." : editingJob ? "Update" : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Application Detail Modal */}
      {viewApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={() => setViewApp(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-800">Application Details</h2>
              <button onClick={() => setViewApp(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-3">
              <div><span className="text-[11px] text-gray-400">Name</span><p className="text-sm font-medium text-gray-800">{viewApp.name}</p></div>
              <div><span className="text-[11px] text-gray-400">Email</span><p className="text-sm text-gray-600">{viewApp.email}</p></div>
              {viewApp.phone && <div><span className="text-[11px] text-gray-400">Phone</span><p className="text-sm text-gray-600">{viewApp.phone}</p></div>}
              <div><span className="text-[11px] text-gray-400">Job</span><p className="text-sm text-gray-600">{getJobTitle(viewApp.jobId)}</p></div>
              <div><span className="text-[11px] text-gray-400">Applied</span><p className="text-sm text-gray-600">{formatDate(viewApp.createdAt)}</p></div>
              {viewApp.coverLetter && <div><span className="text-[11px] text-gray-400">Cover Letter</span><p className="text-sm text-gray-600 whitespace-pre-wrap">{viewApp.coverLetter}</p></div>}
              {viewApp.resumeKey && (
                <button onClick={() => handleDownloadResume(viewApp.resumeKey)} className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100">
                  <Download size={14} /> Download Resume
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
