import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Package, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { apiUrl } from '@/lib/api';

export default function OrderConfirmationPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    fetch(apiUrl(`/api/orders/public/${id}`))
      .then(res => res.json())
      .then(data => {
        if (data.order) setOrder(data.order);
      })
      .catch(() => {});
  }, [id]);

  return (
    <div className="min-h-screen bg-[#F5FAFA] flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center py-20 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 md:p-12 rounded-3xl shadow-xl max-w-lg w-full text-center border border-[#1A4547]/10"
        >
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-emerald-500 w-10 h-10" />
          </div>
          
          <h1 className="font-heading text-3xl text-[#1A3C3E] font-bold mb-2">Order Confirmed!</h1>
          <p className="text-gray-500 font-body mb-8">Thank you for your purchase. We've received your order and are getting it ready.</p>
          
          <div className="bg-[#F9F9F9] rounded-2xl p-6 mb-8 border border-gray-100 text-left">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-gray-500 font-medium">Order ID</span>
              <span className="text-sm font-bold text-[#1A4547]">{id?.slice(-8).toUpperCase()}</span>
            </div>
            {order && (
              <div className="flex justify-between items-center border-t border-gray-100 pt-3">
                <span className="text-sm text-gray-500 font-medium">Amount Paid</span>
                <span className="text-sm font-bold text-gray-900">₹{order.total}</span>
              </div>
            )}
          </div>
          
          <div className="space-y-3">
            <Link to="/track-order" className="w-full flex items-center justify-center gap-2 bg-[#1A4547] text-white py-4 rounded-xl font-body font-semibold hover:bg-[#4A2E17] transition-all">
              <Package size={18} /> Track Your Order
            </Link>
            <Link to="/products" className="w-full flex items-center justify-center gap-2 bg-white border border-[#1A4547]/20 text-[#1A4547] py-4 rounded-xl font-body font-semibold hover:bg-[#F5FAFA] transition-all">
              <Home size={18} /> Continue Shopping
            </Link>
          </div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
}
