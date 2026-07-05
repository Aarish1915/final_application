import { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, ArrowUpRight } from 'lucide-react';
import { apiUrl } from '@/lib/api';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(apiUrl('/api/inquiries'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send message');
      setSuccess(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setTimeout(() => setSuccess(false), 6000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-16 pb-10 sm:pt-20 sm:pb-14 md:pt-28 md:pb-18 overflow-hidden bg-[#F5FAFA]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 right-[10%] w-64 h-64 rounded-full bg-[#1A4547]/[0.03]" />
          <div className="absolute bottom-10 left-[5%] w-48 h-48 rounded-full bg-[#1A4547]/[0.04]" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="font-body text-xs tracking-[0.25em] text-[#7A9A9C] uppercase mb-4">CONTACT US</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.15 }}
            className="font-heading text-4xl sm:text-5xl md:text-6xl text-[#1A3C3E] font-bold leading-tight mb-5">
            We'd Love to <span className="italic font-normal text-[#5E8A8C]">Hear</span> From You
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
            className="font-body text-[15px] md:text-base text-[#555] leading-[1.8] max-w-2xl mx-auto">
            Whether you have a question about our products, Horeca partnerships, reservations, or anything else — our team is ready to help.
          </motion.p>
        </div>
      </section>

      {/* Form + Map */}
      <section className="py-10 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Form */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6 }}>
              <p className="font-body text-xs tracking-[0.25em] text-[#7A9A9C] uppercase mb-3">SEND A MESSAGE</p>
              <h2 className="font-heading text-2xl md:text-3xl text-[#1A3C3E] font-bold mb-6">
                Get in <span className="italic font-normal text-[#5E8A8C]">Touch</span>
              </h2>

              {success && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                  <CheckCircle size={18} className="text-green-600 shrink-0" />
                  <p className="font-body text-sm text-green-700">Message sent successfully! We'll be in touch soon.</p>
                </motion.div>
              )}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="font-body text-sm text-red-700">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-body text-xs tracking-wide text-[#555] mb-1.5">Your Name *</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required
                      className="w-full px-4 py-3 bg-white border border-[#C8E0E0] rounded-xl font-body text-sm text-[#1a1a1a] focus:outline-none focus:border-[#1A4547] transition-colors" placeholder="Your name" />
                  </div>
                  <div>
                    <label className="block font-body text-xs tracking-wide text-[#555] mb-1.5">Email Address *</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required
                      className="w-full px-4 py-3 bg-white border border-[#C8E0E0] rounded-xl font-body text-sm text-[#1a1a1a] focus:outline-none focus:border-[#1A4547] transition-colors" placeholder="you@example.com" />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-body text-xs tracking-wide text-[#555] mb-1.5">Phone Number</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                      className="w-full px-4 py-3 bg-white border border-[#C8E0E0] rounded-xl font-body text-sm text-[#1a1a1a] focus:outline-none focus:border-[#1A4547] transition-colors" placeholder="+91 98765 43210" />
                  </div>
                  <div>
                    <label className="block font-body text-xs tracking-wide text-[#555] mb-1.5">Subject *</label>
                    <select name="subject" value={formData.subject} onChange={handleChange} required
                      className="w-full px-4 py-3 bg-white border border-[#C8E0E0] rounded-xl font-body text-sm text-[#1a1a1a] focus:outline-none focus:border-[#1A4547] transition-colors">
                      <option value="">Select a subject</option>
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Product Information">Product Information</option>
                      <option value="Reservation">Reservation</option>
                      <option value="Horeca Partnership">Horeca Partnership</option>
                      <option value="Feedback">Feedback</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block font-body text-xs tracking-wide text-[#555] mb-1.5">Message *</label>
                  <textarea name="message" value={formData.message} onChange={handleChange} required rows={5}
                    className="w-full px-4 py-3 bg-white border border-[#C8E0E0] rounded-xl font-body text-sm text-[#1a1a1a] focus:outline-none focus:border-[#1A4547] transition-colors resize-none" placeholder="Tell us how we can help..." />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-3.5 bg-[#1A4547] text-white font-body text-sm font-semibold rounded-xl hover:bg-[#4A2E17] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? (<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending...</>) : (<><Send size={16} />Send Message</>)}
                </button>
              </form>
            </motion.div>

            {/* Map */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6, delay: 0.15 }}
              className="rounded-2xl overflow-hidden border border-[#1A4547]/[0.06] h-[350px] lg:h-auto lg:min-h-[500px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3507.0!2d77.09!3d28.46!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sMuseo+Camera!5e0!3m2!1sen!2sin!4v1700000000000"
                width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy"
                referrerPolicy="no-referrer-when-downgrade" title="Ingri at Museo Camera — Location" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Details — Bottom */}
      <section className="py-12 sm:py-16 lg:py-20 bg-[#F5FAFA]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5 }}
            className="text-center mb-10 sm:mb-14">
            <p className="font-body text-xs tracking-[0.25em] text-[#7A9A9C] uppercase mb-3">REACH US</p>
            <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl text-[#1A3C3E] font-bold">
              Other Ways to <span className="italic font-normal text-[#5E8A8C]">Connect</span>
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-6 lg:gap-8">
            {/* Visit */}
            <motion.a href="https://maps.google.com/?q=Museo+Camera+Gurugram" target="_blank" rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5 }}
              className="group flex gap-5 p-5 sm:p-6 rounded-2xl bg-white border border-[#1A4547]/[0.06] hover:border-[#1A4547]/[0.15] transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#1A4547] flex items-center justify-center shrink-0">
                <MapPin size={20} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <h3 className="font-heading text-sm font-bold text-[#1A3C3E]">Visit Us</h3>
                  <ArrowUpRight size={14} className="text-[#7A9A9C] group-hover:text-[#1A4547] transition-colors" />
                </div>
                <p className="font-body text-[13px] text-[#555] leading-relaxed">Plot No. 39, Udyog Vihar, Phase - I, Gurugram, Haryana, 122022</p>
              </div>
            </motion.a>

            {/* Call */}
            <motion.a href="tel:+919311415282"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5, delay: 0.08 }}
              className="group flex gap-5 p-5 sm:p-6 rounded-2xl bg-white border border-[#1A4547]/[0.06] hover:border-[#1A4547]/[0.15] transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#1A4547] flex items-center justify-center shrink-0">
                <Phone size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <h3 className="font-heading text-sm font-bold text-[#1A3C3E]">Call Us</h3>
                  <ArrowUpRight size={14} className="text-[#7A9A9C] group-hover:text-[#1A4547] transition-colors" />
                </div>
                <p className="font-body text-[15px] text-[#555]">+91 9311415282</p>
                <p className="font-body text-[12px] text-[#7A9A9C] mt-1">Mon – Sun, 11 AM – 8 PM</p>
              </div>
            </motion.a>

            {/* Email */}
            <motion.a href="mailto:ggn.museo@ingri.world"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5, delay: 0.16 }}
              className="group flex gap-5 p-5 sm:p-6 rounded-2xl bg-white border border-[#1A4547]/[0.06] hover:border-[#1A4547]/[0.15] transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#1A4547] flex items-center justify-center shrink-0">
                <Mail size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <h3 className="font-heading text-sm font-bold text-[#1A3C3E]">Email Us</h3>
                  <ArrowUpRight size={14} className="text-[#7A9A9C] group-hover:text-[#1A4547] transition-colors" />
                </div>
                <p className="font-body text-[15px] text-[#555]">ggn.museo@ingri.world</p>
                <p className="font-body text-[12px] text-[#7A9A9C] mt-1">We typically reply within 24 hours</p>
              </div>
            </motion.a>

            {/* Hours */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5, delay: 0.24 }}
              className="flex gap-5 p-5 sm:p-6 rounded-2xl bg-white border border-[#1A4547]/[0.06]">
              <div className="w-12 h-12 rounded-xl bg-[#1A4547] flex items-center justify-center shrink-0">
                <Clock size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-heading text-sm font-bold text-[#1A3C3E] mb-1.5">Opening Hours</h3>
                <p className="font-body text-[15px] text-[#555]">Open Daily</p>
                <p className="font-body text-[15px] text-[#1A4547] font-medium">08:00 AM — 10:00 PM</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
