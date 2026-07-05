import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';

export default function TermsPage() {
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
            Terms &amp; Conditions
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
              Welcome to Ingri. These Terms and Conditions ("Terms") govern your use of our website and the purchase of products and services offered through it. By accessing or using our website, you agree to be bound by these Terms. Please read them carefully before using our services.
            </p>

            <h2 className="font-heading text-xl font-semibold text-[#1A3C3E] mt-10 mb-4">1. Eligibility</h2>
            <p>
              By using this website, you represent and warrant that you are at least 18 years of age and are a resident of India or any jurisdiction where our services are available. If you are under 18, you may use our website only with the involvement and consent of a parent or guardian.
            </p>

            <h2 className="font-heading text-xl font-semibold text-[#1A3C3E] mt-10 mb-4">2. Use of the Website</h2>
            <p>You agree to use our website only for lawful purposes and in a manner that does not:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Infringe the rights of any third party</li>
              <li>Restrict or inhibit anyone else's use of the website</li>
              <li>Violate any applicable local, state, national, or international law</li>
              <li>Transmit any harmful, threatening, abusive, or otherwise objectionable material</li>
              <li>Attempt to gain unauthorised access to any part of the website or its systems</li>
            </ul>

            <h2 className="font-heading text-xl font-semibold text-[#1A3C3E] mt-10 mb-4">3. Products and Services</h2>
            <p>
              We make every effort to display our products as accurately as possible on the website. However, we do not guarantee that the colours, dimensions, or descriptions of products are entirely accurate. All products are subject to availability, and we reserve the right to discontinue any product at any time without prior notice.
            </p>

            <h2 className="font-heading text-xl font-semibold text-[#1A3C3E] mt-10 mb-4">4. Pricing and Payments</h2>
            <p>
              All prices listed on the website are in Indian Rupees (INR) and are inclusive of applicable taxes unless stated otherwise. We reserve the right to change prices at any time without prior notice. Payments are processed securely through Razorpay. By making a purchase, you agree to Razorpay's terms of service and privacy policy.
            </p>

            <h2 className="font-heading text-xl font-semibold text-[#1A3C3E] mt-10 mb-4">5. User Accounts</h2>
            <p>
              When you create an account on our website, you are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorised use of your account. We reserve the right to suspend or terminate accounts that violate these Terms.
            </p>

            <h2 className="font-heading text-xl font-semibold text-[#1A3C3E] mt-10 mb-4">6. Intellectual Property</h2>
            <p>
              All content on this website, including but not limited to text, graphics, logos, images, recipes, and software, is the property of Ingri and is protected by applicable intellectual property laws. You may not reproduce, distribute, modify, or create derivative works from any content without our prior written consent.
            </p>

            <h2 className="font-heading text-xl font-semibold text-[#1A3C3E] mt-10 mb-4">7. Order Acceptance and Cancellation</h2>
            <p>
              Placing an order on our website constitutes an offer to purchase. We reserve the right to accept or reject any order at our sole discretion. Orders may be cancelled if the product is unavailable, there is an error in pricing or product information, or we suspect fraudulent activity.
            </p>

            <h2 className="font-heading text-xl font-semibold text-[#1A3C3E] mt-10 mb-4">8. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, Ingri shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the website or purchase of products. Our total liability shall not exceed the amount paid by you for the specific product or service giving rise to the claim.
            </p>

            <h2 className="font-heading text-xl font-semibold text-[#1A3C3E] mt-10 mb-4">9. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless Ingri, its directors, employees, and agents from any claims, damages, losses, or expenses arising from your use of the website or violation of these Terms.
            </p>

            <h2 className="font-heading text-xl font-semibold text-[#1A3C3E] mt-10 mb-4">10. Governing Law and Jurisdiction</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts in Gurugram, Haryana, India.
            </p>

            <h2 className="font-heading text-xl font-semibold text-[#1A3C3E] mt-10 mb-4">11. Changes to These Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting on this page. Your continued use of the website after any changes constitutes your acceptance of the revised Terms.
            </p>

            <h2 className="font-heading text-xl font-semibold text-[#1A3C3E] mt-10 mb-4">12. Contact Us</h2>
            <p>If you have any questions about these Terms and Conditions, please contact us at:</p>
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
