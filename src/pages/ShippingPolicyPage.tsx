import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';

export default function ShippingPolicyPage() {
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
            Shipping &amp; Delivery Policy
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
              At Ingri, we are committed to delivering your orders in a timely and secure manner. This Shipping and Delivery Policy outlines the details of our shipping process, delivery timelines, and related information.
            </p>

            <h2 className="font-heading text-xl font-semibold text-[#1A3C3E] mt-10 mb-4">1. Order Processing Time</h2>
            <p>
              All orders are processed within 1–3 business days (excluding weekends and public holidays) after payment confirmation. You will receive an email confirmation once your order has been placed and another notification when it has been dispatched.
            </p>

            <h2 className="font-heading text-xl font-semibold text-[#1A3C3E] mt-10 mb-4">2. Delivery Timelines</h2>
            <p>Estimated delivery times after dispatch are as follows:</p>
            <div className="overflow-x-auto mt-4">
              <table className="w-full border-collapse border border-[#C8E0E0] text-sm">
                <thead>
                  <tr className="bg-[#F5FAFA]">
                    <th className="border border-[#C8E0E0] px-4 py-3 text-left font-semibold text-[#1A3C3E]">Location</th>
                    <th className="border border-[#C8E0E0] px-4 py-3 text-left font-semibold text-[#1A3C3E]">Estimated Delivery</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-[#C8E0E0] px-4 py-3">Delhi NCR (Gurugram, Delhi, Noida, Faridabad, Ghaziabad)</td>
                    <td className="border border-[#C8E0E0] px-4 py-3">1–3 business days</td>
                  </tr>
                  <tr className="bg-[#F5FAFA]/50">
                    <td className="border border-[#C8E0E0] px-4 py-3">Metro cities (Mumbai, Bangalore, Chennai, Kolkata, Hyderabad, Pune)</td>
                    <td className="border border-[#C8E0E0] px-4 py-3">3–5 business days</td>
                  </tr>
                  <tr>
                    <td className="border border-[#C8E0E0] px-4 py-3">Rest of India</td>
                    <td className="border border-[#C8E0E0] px-4 py-3">5–7 business days</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm text-[#777]">
              Please note: Delivery timelines are estimates and may vary due to unforeseen circumstances such as weather conditions, courier delays, or public holidays.
            </p>

            <h2 className="font-heading text-xl font-semibold text-[#1A3C3E] mt-10 mb-4">3. Shipping Charges</h2>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Free shipping on all orders above ₹499.</li>
              <li>A flat shipping fee of ₹49 applies to orders below ₹499.</li>
              <li>Shipping charges, if applicable, will be displayed at checkout before payment.</li>
            </ul>

            <h2 className="font-heading text-xl font-semibold text-[#1A3C3E] mt-10 mb-4">4. Order Tracking</h2>
            <p>
              Once your order has been dispatched, you will receive a shipping confirmation email with a tracking number and a link to track your shipment. You can also track your order status by logging into your account on our website and visiting the "My Orders" section.
            </p>

            <h2 className="font-heading text-xl font-semibold text-[#1A3C3E] mt-10 mb-4">5. Delivery Attempts</h2>
            <p>
              Our delivery partners will make up to 2 delivery attempts. If the delivery is unsuccessful after 2 attempts, the order will be returned to our warehouse. In such cases, we will contact you to arrange re-delivery or process a refund (minus shipping charges).
            </p>

            <h2 className="font-heading text-xl font-semibold text-[#1A3C3E] mt-10 mb-4">6. Incorrect Address</h2>
            <p>
              Please ensure that the shipping address provided at checkout is accurate and complete. Ingri is not responsible for delays or non-delivery caused by incorrect or incomplete address information. Any additional shipping charges incurred due to address corrections will be borne by the customer.
            </p>

            <h2 className="font-heading text-xl font-semibold text-[#1A3C3E] mt-10 mb-4">7. Damaged or Lost Shipments</h2>
            <p>
              If your order arrives damaged or is lost in transit, please contact us within 48 hours of the expected delivery date at <a href="mailto:support@ingri.world" className="text-[#1A4547] underline">support@ingri.world</a> with your order number and photographs of the damaged package/product. We will arrange a replacement or full refund at no additional cost.
            </p>

            <h2 className="font-heading text-xl font-semibold text-[#1A3C3E] mt-10 mb-4">8. Serviceable Areas</h2>
            <p>
              We currently deliver across India. Serviceability to your pin code can be checked at checkout. We do not offer international shipping at this time.
            </p>

            <h2 className="font-heading text-xl font-semibold text-[#1A3C3E] mt-10 mb-4">9. Contact Us</h2>
            <p>For any shipping-related queries, please reach out to us:</p>
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
