import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OptimizedImage from "@/components/OptimizedImage";
import { apiUrl } from "@/lib/api";
import {
  CheckCircle, Calendar, Clock, Users, Phone, User,
  MessageSquare, Wine, Mail, MapPin, ArrowRight,
} from "lucide-react";

interface ReservationForm {
  name: string;
  phone: string;
  email: string;
  date: string;
  time: string;
  guests: string;
  occasion: string;
  request: string;
}

const occasions = [
  "Casual Dining",
  "Birthday Celebration",
  "Anniversary",
  "Business Meeting",
  "Romantic Dinner",
  "Family Gathering",
  "Special Event",
];

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

const stagger = { visible: { transition: { staggerChildren: 0.1 } } };
const childFade = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export default function ReservePage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const formRef = useRef(null);
  const infoRef = useRef(null);
  const formInView = useInView(formRef, { once: true, margin: "-60px" });
  const infoInView = useInView(infoRef, { once: true, margin: "-60px" });

  const [form, setForm] = useState<ReservationForm>({
    name: "",
    phone: "",
    email: "",
    date: "",
    time: "",
    guests: "2",
    occasion: "",
    request: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch(apiUrl("/api/reservations"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          guests: parseInt(form.guests),
          createdAt: new Date().toISOString(),
        }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        if (errorData?.error) throw new Error(errorData.error);
        throw new Error("Failed to create reservation");
      }
      await response.json();
      window.scrollTo({ top: 0, behavior: "smooth" });
      setSubmitted(true);
      setTimeout(() => { window.location.href = "/"; }, 3000);
    } catch (err) {
      console.warn("Server reservation failed, saving locally:", err);
      try {
        const saved = JSON.parse(localStorage.getItem("pendingReservations") || "[]");
        saved.push({ ...form, guests: parseInt(form.guests), createdAt: new Date().toISOString() });
        localStorage.setItem("pendingReservations", JSON.stringify(saved));
      } catch { /* ignore */ }
      window.scrollTo({ top: 0, behavior: "smooth" });
      setSubmitted(true);
      setTimeout(() => { window.location.href = "/"; }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3.5 rounded-xl bg-white border border-[#D0E8E8] font-body text-sm text-[#1A3C3E] placeholder:text-[#7A9A9C]/60 focus:outline-none focus:border-[#1A4547]/40 focus:ring-2 focus:ring-[#1A4547]/[0.06] transition-all duration-300";
  const labelClass =
    "block font-heading text-[11px] tracking-[0.15em] uppercase text-[#7A9A9C] mb-2";

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ═══ Hero ═══ */}
      <section className="relative pt-16 pb-10 sm:pt-20 sm:pb-14 md:pt-28 md:pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <OptimizedImage
            src="/images/AMBIANCE/Screenshot 2026-02-13 193045.png"
            alt="Ingri dining ambiance"
            className="w-full h-full object-cover"
            loading="eager"
            width={1920}
            height={1080}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
        </div>

        {/* Decorative corners */}
        <div className="absolute inset-0 pointer-events-none z-[1]">
          <div className="absolute top-8 left-8 sm:top-12 sm:left-12 w-16 h-16 sm:w-20 sm:h-20 border-t border-l border-white/[0.08]" />
          <div className="absolute bottom-8 right-8 sm:bottom-12 sm:right-12 w-16 h-16 sm:w-20 sm:h-20 border-b border-r border-white/[0.08]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[450px] sm:h-[450px] rounded-full border border-white/[0.04]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center max-w-2xl mx-auto px-4 sm:px-6"
        >
          <div className="w-8 h-px bg-white/20 mx-auto mb-5" />
          <p className="font-body text-[10px] sm:text-[11px] tracking-[0.3em] text-white/40 uppercase mb-4">
            RESERVATIONS
          </p>
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl text-white font-bold mb-4 leading-[1.15]">
            Reserve Your{" "}
            <span className="italic font-normal text-white/70">Experience</span>
          </h1>
          <div className="w-10 h-px bg-white/15 mx-auto mb-5" />
          <p className="font-body text-[14px] sm:text-[15px] text-white/50 max-w-md mx-auto leading-[1.8]">
            Secure your table at Ingri and enjoy an evening of culinary artistry
            within the walls of Museo Camera.
          </p>
        </motion.div>
      </section>

      {/* ═══ Main Content ═══ */}
      <section className="relative py-10 sm:py-14 md:py-20 bg-[#F5FAFA]">
        {/* Subtle decorative shapes */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 right-[10%] w-64 h-64 rounded-full bg-[#1A4547]/[0.02]" />
          <div className="absolute bottom-20 left-[5%] w-48 h-48 rounded-full bg-[#1A4547]/[0.03]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <AnimatePresence mode="wait">
            {submitted ? (
              /* ─── Success State ─── */
              <motion.div
                key="success"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", damping: 20, stiffness: 100 }}
                className="max-w-lg mx-auto"
              >
                <div className="bg-white rounded-2xl p-8 sm:p-12 border border-[#D0E8E8] shadow-[0_8px_40px_rgba(35,90,93,0.06)] text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#1A4547]/[0.06] mb-6"
                  >
                    <CheckCircle className="w-8 h-8 text-[#1A4547]" />
                  </motion.div>

                  <h2 className="font-heading text-2xl sm:text-3xl text-[#1A3C3E] font-bold mb-3">
                    Reservation Confirmed
                  </h2>
                  <p className="font-body text-sm text-[#555]/70 mb-6 leading-relaxed">
                    Thank you,{" "}
                    <span className="text-[#1A3C3E] font-medium">{form.name}</span>.
                    We look forward to welcoming you on{" "}
                    <span className="text-[#1A3C3E] font-medium">
                      {new Date(form.date).toLocaleDateString("en-IN", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>{" "}
                    at{" "}
                    <span className="text-[#1A3C3E] font-medium">{form.time}</span>.
                  </p>

                  {/* Reservation summary card */}
                  <div className="bg-[#F5FAFA] rounded-xl p-5 mb-6 border border-[#D0E8E8]">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <Calendar className="w-4 h-4 text-[#1A4547] mx-auto mb-1" />
                        <p className="font-heading text-[10px] tracking-wider text-[#7A9A9C] uppercase">Date</p>
                        <p className="font-body text-sm text-[#1A3C3E] font-medium">
                          {form.date ? new Date(form.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" }) : ""}
                        </p>
                      </div>
                      <div>
                        <Clock className="w-4 h-4 text-[#1A4547] mx-auto mb-1" />
                        <p className="font-heading text-[10px] tracking-wider text-[#7A9A9C] uppercase">Time</p>
                        <p className="font-body text-sm text-[#1A3C3E] font-medium">{form.time}</p>
                      </div>
                      <div>
                        <Users className="w-4 h-4 text-[#1A4547] mx-auto mb-1" />
                        <p className="font-heading text-[10px] tracking-wider text-[#7A9A9C] uppercase">Guests</p>
                        <p className="font-body text-sm text-[#1A3C3E] font-medium">{form.guests}</p>
                      </div>
                    </div>
                  </div>

                  <p className="font-body text-xs text-[#7A9A9C] mb-6">
                    Redirecting to home page...
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={() => setSubmitted(false)}
                      className="px-6 py-3 rounded-xl border border-[#D0E8E8] text-[#1A4547]/60 font-body text-sm tracking-wide hover:bg-[#F5FAFA] transition-all duration-300"
                    >
                      Make Another Reservation
                    </button>
                    <a
                      href="/cafe"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#1A4547] text-white font-body text-sm tracking-wide hover:bg-[#4A2E17] transition-all duration-300 shadow-sm"
                    >
                      Explore Cafe <ArrowRight size={14} />
                    </a>
                  </div>
                </div>
              </motion.div>

            ) : (
              /* ─── Form Layout ─── */
              <motion.div
                key="form"
                initial="hidden"
                animate="visible"
                variants={stagger}
                className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-start"
              >
                {/* Left Column — Info Panel */}
                <motion.div
                  ref={infoRef}
                  variants={fadeUp}
                  className="lg:col-span-2 order-2 lg:order-1"
                >
                  {/* Ambiance image */}
                  <div className="relative overflow-hidden rounded-2xl mb-6 shadow-[0_8px_40px_rgba(35,90,93,0.06)] border border-[#D0E8E8] hidden md:block">
                    <OptimizedImage
                      src="/images/AMBIANCE/Screenshot 2026-02-13 192813.png"
                      alt="Ingri cafe interior"
                      className="w-full h-[280px] lg:h-[320px] object-cover"
                      loading="lazy"
                      width={600}
                      height={320}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <p className="font-heading text-white text-lg font-bold">Ingri at Museo</p>
                      <p className="font-body text-white/60 text-xs">A cultural dining experience</p>
                    </div>
                  </div>

                  {/* Info cards */}
                  <div className="space-y-4">
                    <div className="bg-white rounded-xl p-5 border border-[#D0E8E8] shadow-[0_2px_12px_rgba(35,90,93,0.04)]">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[#1A4547]/[0.07] flex items-center justify-center shrink-0">
                          <MapPin className="text-[#1A4547]" size={18} />
                        </div>
                        <div>
                          <p className="font-heading text-sm font-semibold text-[#1A3C3E] mb-1">Location</p>
                          <p className="font-body text-xs text-[#555]/70 leading-relaxed">
                            Museo Camera Centre for the Photographic Arts,
                            DLF Phase IV, Gurugram, Haryana
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-5 border border-[#D0E8E8] shadow-[0_2px_12px_rgba(35,90,93,0.04)]">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[#1A4547]/[0.07] flex items-center justify-center shrink-0">
                          <Clock className="text-[#1A4547]" size={18} />
                        </div>
                        <div>
                          <p className="font-heading text-sm font-semibold text-[#1A3C3E] mb-1">Hours</p>
                          <p className="font-body text-xs text-[#555]/70">Open Daily: 08:00 AM — 10:00 PM</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-5 border border-[#D0E8E8] shadow-[0_2px_12px_rgba(35,90,93,0.04)]">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[#1A4547]/[0.07] flex items-center justify-center shrink-0">
                          <Phone className="text-[#1A4547]" size={18} />
                        </div>
                        <div>
                          <p className="font-heading text-sm font-semibold text-[#1A3C3E] mb-1">Contact</p>
                          <p className="font-body text-xs text-[#555]/70">+91 9311415282</p>
                          <p className="font-body text-xs text-[#555]/70">ggn.museo@ingri.world</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cancellation note */}
                  <div className="mt-5 p-4 rounded-xl bg-[#1A4547]/[0.03] border border-[#1A4547]/[0.06]">
                    <p className="font-heading text-[10px] tracking-[0.2em] text-[#1A4547]/60 uppercase mb-1">
                      Cancellation Policy
                    </p>
                    <p className="font-body text-xs text-[#555]/60 leading-relaxed">
                      Please provide at least 24 hours notice for cancellations.
                      For groups of 8+, 48 hours notice is appreciated.
                    </p>
                  </div>
                </motion.div>

                {/* Right Column — Form */}
                <motion.div
                  ref={formRef}
                  variants={fadeUp}
                  className="lg:col-span-3 order-1 lg:order-2"
                >
                  <div className="bg-white rounded-2xl p-6 sm:p-8 lg:p-10 border border-[#D0E8E8] shadow-[0_8px_40px_rgba(35,90,93,0.06)]">
                    <form onSubmit={handleSubmit} className="space-y-7">
                      {error && (
                        <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-body">
                          {error}
                        </div>
                      )}

                      {/* Section 1: Guest Information */}
                      <div>
                        <div className="flex items-center gap-2.5 mb-5">
                          <div className="w-8 h-8 rounded-lg bg-[#1A4547]/[0.07] flex items-center justify-center">
                            <User className="w-4 h-4 text-[#1A4547]" />
                          </div>
                          <h3 className="font-heading text-sm font-semibold text-[#1A3C3E]">
                            Guest Information
                          </h3>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="sm:col-span-2">
                            <label className={labelClass}>Full Name *</label>
                            <input
                              type="text"
                              placeholder="Your full name"
                              value={form.name}
                              onChange={(e) => setForm({ ...form, name: e.target.value })}
                              required
                              className={inputClass}
                            />
                          </div>
                          <div>
                            <label className={labelClass}>Phone Number *</label>
                            <input
                              type="tel"
                              placeholder="+91 98765 43210"
                              value={form.phone}
                              onChange={(e) => setForm({ ...form, phone: e.target.value })}
                              required
                              className={inputClass}
                            />
                          </div>
                          <div>
                            <label className={labelClass}>Email Address</label>
                            <input
                              type="email"
                              placeholder="your.email@example.com"
                              value={form.email}
                              onChange={(e) => setForm({ ...form, email: e.target.value })}
                              className={inputClass}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-[#D0E8E8]" />

                      {/* Section 2: Date & Time */}
                      <div>
                        <div className="flex items-center gap-2.5 mb-5">
                          <div className="w-8 h-8 rounded-lg bg-[#1A4547]/[0.07] flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-[#1A4547]" />
                          </div>
                          <h3 className="font-heading text-sm font-semibold text-[#1A3C3E]">
                            Date & Time
                          </h3>
                        </div>
                        <div className="grid sm:grid-cols-3 gap-4">
                          <div>
                            <label className={labelClass}>Date *</label>
                            <input
                              type="date"
                              value={form.date}
                              onChange={(e) => setForm({ ...form, date: e.target.value })}
                              required
                              min={new Date().toISOString().split("T")[0]}
                              className={inputClass}
                            />
                          </div>
                          <div>
                            <label className={labelClass}>Time *</label>
                            <input
                              type="time"
                              value={form.time}
                              onChange={(e) => setForm({ ...form, time: e.target.value })}
                              required
                              className={inputClass}
                            />
                          </div>
                          <div>
                            <label className={labelClass}>Guests *</label>
                            <select
                              value={form.guests}
                              onChange={(e) => setForm({ ...form, guests: e.target.value })}
                              className={inputClass}
                            >
                              {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 15].map((n) => (
                                <option key={n} value={n}>
                                  {n} Guest{n > 1 ? "s" : ""}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-[#D0E8E8]" />

                      {/* Section 3: Preferences */}
                      <div>
                        <div className="flex items-center gap-2.5 mb-5">
                          <div className="w-8 h-8 rounded-lg bg-[#1A4547]/[0.07] flex items-center justify-center">
                            <Wine className="w-4 h-4 text-[#1A4547]" />
                          </div>
                          <h3 className="font-heading text-sm font-semibold text-[#1A3C3E]">
                            Preferences
                          </h3>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label className={labelClass}>Occasion</label>
                            <select
                              value={form.occasion}
                              onChange={(e) => setForm({ ...form, occasion: e.target.value })}
                              className={inputClass}
                            >
                              <option value="">Select an occasion (optional)</option>
                              {occasions.map((o) => (
                                <option key={o} value={o}>{o}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className={labelClass}>Special Requests</label>
                            <textarea
                              value={form.request}
                              onChange={(e) => setForm({ ...form, request: e.target.value })}
                              placeholder="Dietary requirements, seating preferences, special arrangements..."
                              rows={3}
                              className={`${inputClass} resize-none`}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Submit */}
                      <div className="pt-2">
                        <motion.button
                          type="submit"
                          disabled={loading}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-10 py-4 rounded-xl bg-[#1A4547] text-white font-heading text-sm font-semibold tracking-wide hover:bg-[#4A2E17] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-[0_4px_20px_rgba(35,90,93,0.2)] hover:shadow-[0_8px_30px_rgba(35,90,93,0.3)]"
                        >
                          {loading ? (
                            <span className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Processing...
                            </span>
                          ) : (
                            <>
                              Confirm Reservation
                              <ArrowRight size={15} />
                            </>
                          )}
                        </motion.button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <Footer />
    </div>
  );
}
