import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect, useCallback } from "react";
import { ArrowRight, Send, Sparkles, Users, Target, Lightbulb, Mail, MapPin, Clock, Building2, ChevronRight, X, Loader2, CheckCircle2, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OptimizedImage from "@/components/OptimizedImage";
import { apiUrl } from "@/lib/api";

type Job = {
  _id: string; title: string; department: string; location: string;
  type: string; description: string; requirements: string; active: boolean; createdAt: string;
};

const qualities = [
  { icon: Sparkles, title: "Curiosity & Dedication", desc: "A genuine passion for food, flavors, and the craft behind every dish we create." },
  { icon: Users, title: "Teamwork & Social Skills", desc: "We thrive together. Strong collaboration and communication are at our core." },
  { icon: Target, title: "Accountability & Pride", desc: "Own your work, take pride in every detail, and hold yourself to the highest standards." },
  { icon: Lightbulb, title: "Eager to Learn & Execute", desc: "Stay curious, embrace new challenges, and turn ideas into action every single day." },
];

export default function CareersPage() {
  const qualitiesRef = useRef(null);
  const storyRef = useRef(null);
  const jobsRef = useRef(null);
  const qualitiesInView = useInView(qualitiesRef, { once: true, margin: "-80px" });
  const storyInView = useInView(storyRef, { once: true, margin: "-80px" });
  const jobsInView = useInView(jobsRef, { once: true, margin: "-80px" });

  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showApply, setShowApply] = useState(false);
  const [applyForm, setApplyForm] = useState({ name: "", email: "", phone: "", coverLetter: "" });
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [applyError, setApplyError] = useState("");

  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch(apiUrl("/api/careers"));
      if (res.ok) { const data = await res.json(); setJobs(data.jobs || []); }
    } catch { /* silent */ }
    finally { setJobsLoading(false); }
  }, []);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;
    setApplying(true); setApplyError("");
    try {
      const res = await fetch(apiUrl("/api/careers/apply"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: selectedJob._id, ...applyForm }),
      });
      if (res.ok) {
        setApplySuccess(true);
        setApplyForm({ name: "", email: "", phone: "", coverLetter: "" });
      } else {
        const data = await res.json();
        setApplyError(data.error || "Something went wrong");
      }
    } catch { setApplyError("Network error. Please try again."); }
    finally { setApplying(false); }
  };

  const openJobDetail = (job: Job) => { setSelectedJob(job); setShowApply(false); setApplySuccess(false); setApplyError(""); };
  const closeModal = () => { setSelectedJob(null); setShowApply(false); setApplySuccess(false); setApplyError(""); };
  const openApplyForm = () => { setShowApply(true); setApplySuccess(false); setApplyError(""); };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ═══ Hero ═══ */}
      <section className="relative pt-14 pb-12 sm:pt-18 sm:pb-14 md:pt-24 md:pb-16 overflow-hidden bg-[#F5FAFA]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 right-[10%] w-64 h-64 rounded-full bg-[#1A4547]/[0.03]" />
          <div className="absolute bottom-10 left-[5%] w-48 h-48 rounded-full bg-[#1A4547]/[0.04]" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="font-body text-xs tracking-[0.25em] text-[#7A9A9C] uppercase mb-4"
            >
              CAREERS
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="font-heading text-4xl sm:text-5xl md:text-6xl text-[#1A3C3E] font-bold leading-tight mb-5"
            >
              Come Build Something{" "}
              <span className="italic font-normal text-[#5E8A8C]">Delicious</span> With Us
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="font-body text-[15px] md:text-base text-[#555] leading-[1.8] max-w-2xl mx-auto"
            >
              At INGRI, we're not just making food — we're crafting experiences that bring people together. Join a team where passion meets purpose.
            </motion.p>
        </div>
      </section>

      {/* ═══ Open Positions ═══ */}
      <section ref={jobsRef} className="relative py-12 sm:py-16 lg:py-24 overflow-hidden bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={jobsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-10 sm:mb-14"
          >
            <p className="font-body text-xs tracking-[0.25em] text-[#7A9A9C] uppercase mb-4">OPEN POSITIONS</p>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl text-[#1A3C3E] font-bold">
              Join Our{" "}
              <span className="italic font-normal text-[#5E8A8C]">Team</span>
            </h2>
            <div className="w-12 h-px bg-[#1A4547]/20 mx-auto mt-5" />
          </motion.div>

          {jobsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 size={28} className="animate-spin text-[#7A9A9C]" />
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase size={40} className="mx-auto text-[#D5CEC4] mb-4" />
              <p className="font-body text-[15px] text-[#7A9A9C]">No open positions at the moment.</p>
              <p className="font-body text-[13px] text-[#C4BDB3] mt-1">Check back soon or send your resume to <a href="mailto:careers@ingri.in" className="underline hover:text-[#5E8A8C] transition-colors">careers@ingri.in</a></p>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map((job, i) => (
                <motion.button
                  key={job._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={jobsInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.08 * i }}
                  onClick={() => openJobDetail(job)}
                  className="w-full text-left group bg-[#F5FAFA] hover:bg-[#EFF7F7] border border-[#1A4547]/[0.06] hover:border-[#1A4547]/[0.15] rounded-2xl p-5 sm:p-6 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-heading text-lg sm:text-xl text-[#1A3C3E] font-bold mb-2 group-hover:text-[#1A4547] transition-colors">{job.title}</h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-[#5E8A8C]">
                        {job.department && (
                          <span className="flex items-center gap-1.5"><Building2 size={14} className="text-[#7A9A9C]" />{job.department}</span>
                        )}
                        {job.location && (
                          <span className="flex items-center gap-1.5"><MapPin size={14} className="text-[#7A9A9C]" />{job.location}</span>
                        )}
                        <span className="flex items-center gap-1.5"><Clock size={14} className="text-[#7A9A9C]" />{job.type}</span>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-[#7A9A9C] group-hover:text-[#1A4547] group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══ Job Detail + Apply Modal ═══ */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={closeModal}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white z-10 flex items-start justify-between px-6 pt-6 pb-4 border-b border-[#1A4547]/[0.06]">
              <div>
                <h2 className="font-heading text-xl sm:text-2xl text-[#1A3C3E] font-bold">{selectedJob.title}</h2>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[13px] text-[#5E8A8C]">
                  {selectedJob.department && <span className="flex items-center gap-1"><Building2 size={13} />{selectedJob.department}</span>}
                  {selectedJob.location && <span className="flex items-center gap-1"><MapPin size={13} />{selectedJob.location}</span>}
                  <span className="flex items-center gap-1"><Clock size={13} />{selectedJob.type}</span>
                </div>
              </div>
              <button onClick={closeModal} className="p-1.5 rounded-lg text-[#7A9A9C] hover:text-[#1A3C3E] hover:bg-[#EFF7F7] transition-colors" aria-label="Close">
                <X size={20} />
              </button>
            </div>

            {!showApply ? (
              /* ── Job Details View ── */
              <div className="px-6 py-5 space-y-5">
                {selectedJob.description && (
                  <div>
                    <h3 className="font-heading text-sm font-semibold text-[#1A3C3E] uppercase tracking-wider mb-2">About the Role</h3>
                    <p className="font-body text-[14px] text-[#555] leading-[1.8] whitespace-pre-line">{selectedJob.description}</p>
                  </div>
                )}
                {selectedJob.requirements && (
                  <div>
                    <h3 className="font-heading text-sm font-semibold text-[#1A3C3E] uppercase tracking-wider mb-2">Requirements</h3>
                    <ul className="space-y-1.5">
                      {selectedJob.requirements.split("\n").filter(Boolean).map((req, i) => (
                        <li key={i} className="flex items-start gap-2 font-body text-[14px] text-[#555] leading-[1.7]">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#1A4547]/30 flex-shrink-0" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="pt-3 border-t border-[#1A4547]/[0.06]">
                  <button
                    onClick={openApplyForm}
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#1A3C3E] text-white font-body text-sm font-semibold tracking-wide px-6 py-3 rounded-xl hover:bg-[#1A4547] transition-colors"
                  >
                    <Send size={16} /> Apply for this Position
                  </button>
                </div>
              </div>
            ) : applySuccess ? (
              /* ── Success State ── */
              <div className="px-6 py-12 text-center">
                <CheckCircle2 size={48} className="mx-auto text-emerald-500 mb-4" />
                <h3 className="font-heading text-xl text-[#1A3C3E] font-bold mb-2">Application Submitted</h3>
                <p className="font-body text-[14px] text-[#555] leading-[1.8] mb-6">
                  Thank you for applying. We'll review your application and get back to you soon.
                </p>
                <button onClick={closeModal} className="px-6 py-2.5 bg-[#1A3C3E] text-white text-sm font-medium rounded-xl hover:bg-[#1A4547] transition-colors">
                  Close
                </button>
              </div>
            ) : (
              /* ── Apply Form ── */
              <form onSubmit={handleApply} className="px-6 py-5 space-y-4">
                <p className="font-body text-[13px] text-[#5E8A8C]">Applying for: <span className="font-semibold text-[#1A3C3E]">{selectedJob.title}</span></p>
                {applyError && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{applyError}</p>}
                <div>
                  <label className="block text-[12px] font-medium text-[#5E8A8C] mb-1">Full Name *</label>
                  <input type="text" required value={applyForm.name} onChange={e => setApplyForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-[#1A4547]/10 rounded-xl text-sm text-[#1A3C3E] focus:ring-1 focus:ring-[#1A4547]/30 outline-none bg-[#F5FAFA]" placeholder="Your full name" />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[#5E8A8C] mb-1">Email *</label>
                  <input type="email" required value={applyForm.email} onChange={e => setApplyForm(p => ({ ...p, email: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-[#1A4547]/10 rounded-xl text-sm text-[#1A3C3E] focus:ring-1 focus:ring-[#1A4547]/30 outline-none bg-[#F5FAFA]" placeholder="you@example.com" />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[#5E8A8C] mb-1">Phone</label>
                  <input type="tel" value={applyForm.phone} onChange={e => setApplyForm(p => ({ ...p, phone: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-[#1A4547]/10 rounded-xl text-sm text-[#1A3C3E] focus:ring-1 focus:ring-[#1A4547]/30 outline-none bg-[#F5FAFA]" placeholder="+91-XXXXXXXXXX" />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[#5E8A8C] mb-1">Cover Letter</label>
                  <textarea rows={4} value={applyForm.coverLetter} onChange={e => setApplyForm(p => ({ ...p, coverLetter: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-[#1A4547]/10 rounded-xl text-sm text-[#1A3C3E] focus:ring-1 focus:ring-[#1A4547]/30 outline-none bg-[#F5FAFA] resize-none" placeholder="Tell us why you'd be a great fit..." />
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setShowApply(false)}
                    className="flex-1 px-4 py-2.5 border border-[#1A4547]/10 text-[#5E8A8C] text-sm font-medium rounded-xl hover:bg-[#EFF7F7] transition-colors">
                    Back
                  </button>
                  <button type="submit" disabled={applying}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-[#1A3C3E] text-white text-sm font-semibold rounded-xl hover:bg-[#1A4547] transition-colors disabled:opacity-50 py-2.5">
                    {applying ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : <><Send size={15} /> Submit Application</>}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}

      {/* ═══ What We Look For ═══ */}
      <section ref={qualitiesRef} className="relative py-12 sm:py-16 lg:py-20 overflow-hidden bg-[#F5FAFA]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={qualitiesInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <p className="font-body text-xs tracking-[0.25em] text-[#7A9A9C] uppercase mb-3">WHAT WE LOOK FOR</p>
            <h2 className="font-heading text-2xl sm:text-3xl text-[#1A3C3E] font-bold">
              Are You Ready to Be Part of Something{" "}
              <span className="italic font-normal text-[#5E8A8C]">Special?</span>
            </h2>
            <div className="w-12 h-px bg-[#1A4547]/20 mx-auto mt-5" />
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 lg:gap-6">
            {qualities.map((q, i) => (
              <motion.div
                key={q.title}
                initial={{ opacity: 0, y: 20 }}
                animate={qualitiesInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.08 }}
                className="group flex gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-[#1A4547]/[0.06] hover:border-[#1A4547]/[0.15] transition-all shadow-[0_2px_12px_rgba(35,90,93,0.04)]"
              >
                <div className="w-11 h-11 rounded-xl bg-[#F5FAFA] border border-[#1A4547]/15 flex items-center justify-center shrink-0 shadow-[0_2px_12px_rgba(35,90,93,0.06)] group-hover:shadow-[0_4px_20px_rgba(35,90,93,0.1)] transition-shadow">
                  <q.icon size={20} className="text-[#1A4547]" />
                </div>
                <div>
                  <h3 className="font-heading text-[15px] text-[#1A3C3E] font-bold mb-1">{q.title}</h3>
                  <p className="font-body text-[13px] text-[#555] leading-[1.7]">{q.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA — Get In Touch ═══ */}
      <section className="relative py-14 sm:py-16 lg:py-20 overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="/images/AMBIANCE/Screenshot 2026-02-13 193012.png"
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20" />
        </div>
        {/* Decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-8 left-8 sm:top-12 sm:left-12 w-16 h-16 sm:w-20 sm:h-20 border-t border-l border-white/[0.08]" />
          <div className="absolute bottom-8 right-8 sm:bottom-12 sm:right-12 w-16 h-16 sm:w-20 sm:h-20 border-b border-r border-white/[0.08]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] sm:w-[400px] sm:h-[400px] rounded-full border border-white/[0.04]" />
        </div>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-8 h-px bg-white/20 mx-auto mb-5" />
            <p className="font-body text-xs tracking-[0.25em] text-white/40 uppercase mb-4">JOIN THE TEAM</p>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl text-white font-bold mb-5">
              Think You'd Be a Great{" "}
              <span className="italic font-normal text-white/70">Fit?</span>
            </h2>
            <div className="w-12 h-px bg-white/15 mx-auto mb-6" />
            <p className="font-body text-[15px] text-white/60 leading-[1.8] max-w-xl mx-auto mb-10">
              We'd love to hear from you. Send us your resume and a few words about why you're excited about INGRI. We're always open to meeting passionate people.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="mailto:careers@ingri.in"
                className="inline-flex items-center gap-2 bg-white text-[#1A3C3E] font-body text-sm font-semibold tracking-wide px-8 py-3.5 rounded-xl hover:bg-white/90 transition-all shadow-lg"
              >
                <Send size={16} /> Send Your Resume <ArrowRight size={15} />
              </a>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 border border-white/20 text-white font-body text-sm font-medium tracking-wide px-8 py-3.5 rounded-xl hover:bg-white/10 transition-all"
              >
                <Mail size={16} /> Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
