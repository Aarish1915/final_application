import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';

export default function PrivacyPolicyPage() {
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
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="font-body text-xs tracking-[0.25em] text-[#7A9A9C] uppercase mb-4">
            LEGAL
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.15 }} className="font-heading text-4xl sm:text-5xl md:text-6xl text-[#1A3C3E] font-bold leading-tight mb-5">
            Privacy Policy
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="font-body text-[15px] md:text-base text-[#555] leading-[1.8] max-w-2xl mx-auto">
            Last updated: March 17, 2026
          </motion.p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-stone max-w-none font-body text-[#444] leading-[1.9] text-[15px]">

            <p>
              At Ingri ("we", "our", "us"), we are committed to protecting the privacy and personal information of our customers and website visitors. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or make a purchase from us.
            </p>

            <h2 className="font-heading text-xl font-semibold text-[#1A3C3E] mt-10 mb-4">1. Information We Collect</h2>
            <p>We may collect the following types of personal information when you interact with our website:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Name, email address, phone number, and shipping/billing address</li>
              <li>Payment information (processed securely through Razorpay; we do not store card details)</li>
              <li>Order history and transaction details</li>
              <li>Account credentials (email and encrypted password)</li>
              <li>Device information, IP address, browser type, and browsing behaviour on our website</li>
              <li>Any information you voluntarily provide through contact forms, reviews, or inquiries</li>
            </ul>

            <h2 className="font-heading text-xl font-semibold text-[#1A3C3E] mt-10 mb-4">2. How We Use Your Information</h2>
            <p>We use the information we collect for the following purposes:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>To process and fulfil your orders, including payment processing and delivery</li>
              <li>To create and manage your account on our platform</li>
              <li>To communicate with you regarding orders, promotions, and updates</li>
              <li>To improve our website, products, and customer experience</li>
              <li>To respond to your inquiries and provide customer support</li>
              <li>To comply with legal obligations and resolve disputes</li>
            </ul>

            <h2 className="font-heading text-xl font-semibold text-[#1A3C3E] mt-10 mb-4">3. Sharing of Information with Third Parties</h2>
            <p>We may share your personal information with the following third parties only as necessary:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Payment processors such as Razorpay for secure transaction processing</li>
              <li>Logistics and delivery partners to fulfil and ship your orders</li>
              <li>Analytics providers to help us understand website usage and improve our services</li>
              <li>Government or regulatory authorities when required by law or legal proceedings</li>
            </ul>
            <p className="mt-3">We do not sell, rent, or trade your personal information to any third party for marketing purposes.</p>

            <h2 className="font-heading text-xl font-semibold text-[#1A3C3E] mt-10 mb-4">4. Cookies and Tracking Technologies</h2>
            <p>Our website uses cookies and similar tracking technologies to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Authenticate users and maintain session security</li>
              <li>Remember your preferences and cart items</li>
              <li>Analyse website traffic and user behaviour for improving our services</li>
              <li>Deliver relevant content and personalised experiences</li>
            </ul>
            <p className="mt-3">You can manage or disable cookies through your browser settings. However, disabling cookies may affect the functionality of certain features on our website.</p>

            <h2 className="font-heading text-xl font-semibold text-[#1A3C3E] mt-10 mb-4">5. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your personal information, including SSL encryption for data transmission, secure server infrastructure, and restricted access to personal data. While we strive to use commercially acceptable means to protect your information, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>

            <h2 className="font-heading text-xl font-semibold text-[#1A3C3E] mt-10 mb-4">6. Data Retention</h2>
            <p>
              We retain your personal information for as long as your account is active or as needed to provide you services, comply with our legal obligations, resolve disputes, and enforce our agreements.
            </p>

            <h2 className="font-heading text-xl font-semibold text-[#1A3C3E] mt-10 mb-4">7. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate or incomplete data</li>
              <li>Request deletion of your personal data, subject to legal requirements</li>
              <li>Withdraw consent for data processing at any time</li>
            </ul>

            <h2 className="font-heading text-xl font-semibold text-[#1A3C3E] mt-10 mb-4">8. Grievance Redressal</h2>
            <p>
              If you have any concerns or complaints regarding the processing of your personal information, you may contact our Grievance Officer:
            </p>
            <div className="bg-[#F5FAFA] border border-[#C8E0E0] rounded-lg p-6 mt-4">
              <p className="font-semibold text-[#1A3C3E]">Grievance Officer</p>
              <p className="mt-2">Ingri</p>
              <p>Plot No. 39, Udyog Vihar, Phase - I,</p>
              <p>Gurugram, Haryana, 122022, India</p>
              <p className="mt-2">Email: <a href="mailto:support@ingri.world" className="text-[#1A4547] underline">support@ingri.world</a></p>
            </div>
            <p className="mt-4">We will acknowledge your complaint within 48 hours and endeavour to resolve it within 30 days.</p>

            <h2 className="font-heading text-xl font-semibold text-[#1A3C3E] mt-10 mb-4">9. Changes to This Policy</h2>
            <p>
              We reserve the right to update this Privacy Policy at any time. Any changes will be posted on this page with an updated "Last updated" date. We encourage you to review this policy periodically.
            </p>

            <h2 className="font-heading text-xl font-semibold text-[#1A3C3E] mt-10 mb-4">10. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at:</p>
            <div className="bg-[#F5FAFA] border border-[#C8E0E0] rounded-lg p-6 mt-4">
              <p className="font-semibold text-[#1A3C3E]">Ingri</p>
              <p>Email: <a href="mailto:support@ingri.world" className="text-[#1A4547] underline">support@ingri.world</a></p>
              <p>Address: Plot No. 39, Udyog Vihar, Phase - I, Gurugram, Haryana, 122022, India</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
