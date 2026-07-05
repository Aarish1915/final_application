import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';

export default function RefundPolicyPage() {
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
            Refund &amp; Cancellation Policy
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
              At Ingri, we strive to ensure complete customer satisfaction with every order. This Refund and Cancellation Policy outlines the terms under which you may cancel an order or request a refund.
            </p>

            <h2 className="font-heading text-xl font-semibold text-[#1A3C3E] mt-10 mb-4">1. Order Cancellation</h2>
            <p>You may cancel your order under the following conditions:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Orders can be cancelled within 24 hours of placing the order, provided the order has not been shipped.</li>
              <li>To cancel an order, please contact us at <a href="mailto:support@ingri.world" className="text-[#1A4547] underline">support@ingri.world</a> with your order number and reason for cancellation.</li>
              <li>Once an order has been dispatched, it cannot be cancelled. You may, however, request a return after delivery (subject to the conditions below).</li>
            </ul>

            <h2 className="font-heading text-xl font-semibold text-[#1A3C3E] mt-10 mb-4">2. Refund Eligibility</h2>
            <p>Refunds may be issued in the following cases:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>The product received is damaged, defective, or broken during transit</li>
              <li>The wrong product was delivered</li>
              <li>The product is significantly different from what was described on the website</li>
              <li>The order was cancelled before dispatch</li>
            </ul>

            <h2 className="font-heading text-xl font-semibold text-[#1A3C3E] mt-10 mb-4">3. Non-Refundable Items</h2>
            <p>The following items are not eligible for return or refund:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Perishable food items (e.g., fresh baked goods, prepared meals, items with a short shelf life)</li>
              <li>Products that have been opened, used, or are not in their original packaging</li>
              <li>Gift cards and promotional items</li>
              <li>Items purchased during clearance or final sale</li>
              <li>Digital downloads or e-gift vouchers</li>
            </ul>

            <h2 className="font-heading text-xl font-semibold text-[#1A3C3E] mt-10 mb-4">4. Return Process</h2>
            <p>To initiate a return:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Contact us at <a href="mailto:support@ingri.world" className="text-[#1A4547] underline">support@ingri.world</a> within 7 days of receiving the product.</li>
              <li>Provide your order number, a description of the issue, and photographs of the product (if damaged or defective).</li>
              <li>Our team will review your request and respond within 2 business days.</li>
              <li>If approved, we will provide instructions for returning the product. Items must be returned in their original packaging and unused condition.</li>
            </ul>

            <h2 className="font-heading text-xl font-semibold text-[#1A3C3E] mt-10 mb-4">5. Refund Timeline</h2>
            <p>Once your return is received and inspected:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Approved refunds will be processed within 5–7 working days.</li>
              <li>Refunds will be credited to the original payment method used during purchase.</li>
              <li>For payments made via Razorpay (UPI, credit/debit card, net banking), the refund will reflect in your account as per your bank's processing time.</li>
              <li>In case of cancelled orders, the refund will be initiated within 3–5 working days from the date of cancellation.</li>
            </ul>

            <h2 className="font-heading text-xl font-semibold text-[#1A3C3E] mt-10 mb-4">6. Exchanges</h2>
            <p>
              We currently do not offer direct exchanges. If you wish to exchange a product, please initiate a return and place a new order for the desired item.
            </p>

            <h2 className="font-heading text-xl font-semibold text-[#1A3C3E] mt-10 mb-4">7. Contact Us</h2>
            <p>For any questions or concerns regarding refunds and cancellations, please reach out to us:</p>
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
