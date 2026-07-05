import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';

import { useAuth } from '../context/useAuth';
import { apiUrl, apiFetch } from '@/lib/api';
import { ShoppingBag, Plus, Check, MapPin, Home, Building2, ChevronRight, XCircle } from 'lucide-react';

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void; on: (event: string, cb: () => void) => void };
  }
}

type CartItem = { _id: string; name: string; price: number; image: string; qty: number };

type Address = {
  _id: string; fullName: string; phone: string; houseNo: string;
  addressLine1: string; locality: string; city: string; district: string;
  state: string; pincode: string; landmark?: string; type: 'home' | 'work'; isDefault: boolean;
};

type AddressForm = {
  fullName: string; email: string; phone: string; houseNo: string; addressLine1: string;
  locality: string; city: string; district: string; state: string;
  pincode: string; landmark: string; type: 'home' | 'work'; isDefault: boolean;
};

const emptyAddr: AddressForm = {
  fullName: '', email: '', phone: '', houseNo: '', addressLine1: '', locality: '',
  city: '', district: '', state: '', pincode: '', landmark: '', type: 'home', isDefault: false,
};

const states = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
  "Uttarakhand","West Bengal","Delhi","Chandigarh","Puducherry","Ladakh",
  "Jammu and Kashmir",
];

const inputCls = "w-full px-3 py-2.5 bg-white border border-[#C8E0E0] rounded-lg font-body text-sm text-[#1a1a1a] focus:outline-none focus:border-[#1A4547] transition-colors";
const labelCls = "block font-body text-xs tracking-wide text-[#555] mb-1";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user, token, loading: authLoading } = useAuth();

  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [paymentFailed, setPaymentFailed] = useState(false);
  const [failReason, setFailReason] = useState('');

  // Addresses
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addrLoading, setAddrLoading] = useState(true);
  const [selectedAddrId, setSelectedAddrId] = useState<string | null>(null);
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [editingAddrId, setEditingAddrId] = useState<string | null>(null);
  const [addrForm, setAddrForm] = useState<AddressForm>(() => {
    try {
      const saved = localStorage.getItem('checkout_guest_form');
      return saved ? JSON.parse(saved) : { ...emptyAddr };
    } catch { return { ...emptyAddr }; }
  });
  const [addrSaving, setAddrSaving] = useState(false);
  const [addrError, setAddrError] = useState('');

  // Persist guest form to localStorage
  useEffect(() => {
    if (!token) localStorage.setItem('checkout_guest_form', JSON.stringify(addrForm));
  }, [addrForm, token]);

  // Coupon — read from cart (applied in cart page)
  const [appliedCoupon, setAppliedCoupon] = useState<{ couponId: string; code: string; discount: number; description: string } | null>(null);

  useEffect(() => {
    if (authLoading) return;
    const buyNow = sessionStorage.getItem('buyNowItem');
    if (buyNow) {
      setItems([JSON.parse(buyNow)]);
      sessionStorage.removeItem('buyNowItem');
    } else {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      if (cart.length === 0) { navigate('/products'); return; }
      setItems(cart);
    }
  }, [user, navigate, authLoading]);

  // Load saved addresses
  useEffect(() => {
    if (!token) {
      setShowAddrForm(true);
      setAddrLoading(false);
      return;
    }
    (async () => {
      setAddrLoading(true);
      try {
        const res = await apiFetch('/api/addresses');
        if (res.ok) {
          const d = await res.json();
          const list: Address[] = d.addresses || [];
          setAddresses(list);
          const def = list.find(a => a.isDefault) || list[0];
          if (def) setSelectedAddrId(def._id);
          else if (list.length === 0) setShowAddrForm(true);
        }
      } catch { /* silent */ }
      setAddrLoading(false);
    })();
  }, [token]);

  // Pre-fill name/phone from user
  useEffect(() => {
    if (user && !addrForm.fullName) {
      setAddrForm(f => ({ ...f, fullName: user.name || '', phone: user.phone || '' }));
    }
  }, [user]);

  // Load applied coupon from cart
  useEffect(() => {
    const saved = localStorage.getItem('appliedCoupon');
    if (saved) { 
      try { 
        const parsed = JSON.parse(saved);
        // Revalidate against current subtotal
        fetch(apiUrl('/api/coupons/validate'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: parsed.code, orderTotal: subtotal, userId: user?.id })
        })
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(data => {
          const updated = { couponId: data.couponId, code: data.code, discount: data.discount, description: data.description || '' };
          setAppliedCoupon(updated);
          localStorage.setItem('appliedCoupon', JSON.stringify(updated));
        })
        .catch(() => {
          setAppliedCoupon(null);
          localStorage.removeItem('appliedCoupon');
        });
      } catch { /* ignore */ } 
    }
  }, []);

  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const totalQty = items.reduce((s, i) => s + i.qty, 0);
  const discount = appliedCoupon?.discount || 0;

  // Fetch MRP data for items
  const [mrpMap, setMrpMap] = useState<Record<string, number>>({});
  useEffect(() => {
    if (items.length === 0) return;
    (async () => {
      const map: Record<string, number> = {};
      await Promise.all(items.map(async (item) => {
        try {
          const res = await fetch(apiUrl(`/api/products/${item._id}`));
          if (res.ok) {
            const d = await res.json();
            const p = d.product;
            if (p?.mrp && p.mrp > (p.salePrice || p.price)) map[item._id] = p.mrp;
          }
        } catch { /* silent */ }
      }));
      setMrpMap(map);
    })();
  }, [items]);

  const mrpTotal = items.reduce((s, i) => s + (mrpMap[i._id] || i.price) * i.qty, 0);
  const mrpDiscount = mrpTotal - total;
  const subtotalAfterDiscount = total - discount;
  const shippingFee = subtotalAfterDiscount < 499 ? 49 : 0;
  const grandTotal = subtotalAfterDiscount + shippingFee;
  const selectedAddr = addresses.find(a => a._id === selectedAddrId);

  const handleSaveAddr = async () => {
    if (!addrForm.fullName || !addrForm.phone || !addrForm.addressLine1 || !addrForm.city || !addrForm.state || !addrForm.pincode) {
      setAddrError('Please fill all required fields'); return;
    }
    
    // Strict Regex Validation
    if (!/^\d{10}$/.test(addrForm.phone.replace(/\s+/g, ''))) {
      setAddrError('Please enter a valid 10-digit phone number'); return;
    }
    if (!/^\d{6}$/.test(addrForm.pincode.replace(/\s+/g, ''))) {
      setAddrError('Please enter a valid 6-digit PIN code'); return;
    }

    setAddrSaving(true); setAddrError('');
    
    // Check if pincode is serviceable
    try {
      const res = await apiFetch(`/api/pincodes/check?code=${addrForm.pincode}`);
      const data = await res.json();
      if (!res.ok || !data.serviceable) {
        setAddrError(data.message || 'Sorry, we do not deliver to this PIN code yet.');
        setAddrSaving(false);
        return;
      }
    } catch {
      setAddrError('Failed to verify PIN code. Please try again.');
      setAddrSaving(false);
      return;
    }

    if (!user) {
      // Guest mode: save to local state only
      const newAddr = { ...addrForm, _id: editingAddrId || ('guest_addr_' + Date.now()) } as Address;
      setAddresses(prev => editingAddrId ? prev.map(a => a._id === editingAddrId ? newAddr : a) : [...prev, newAddr]);
      setSelectedAddrId(newAddr._id);
      setShowAddrForm(false);
      setEditingAddrId(null);
      setAddrSaving(false);
      return;
    }

    try {
      const url = editingAddrId ? `/api/addresses/${editingAddrId}` : '/api/addresses';
      const method = editingAddrId ? 'PUT' : 'POST';
      const res = await apiFetch(url, { method, body: JSON.stringify(addrForm) });
      if (res.ok) {
        const d = await res.json();
        const newAddr = d.address;
        setAddresses(prev => editingAddrId ? prev.map(a => a._id === editingAddrId ? newAddr : a) : [...prev, newAddr]);
        setSelectedAddrId(newAddr._id);
        setShowAddrForm(false);
        setEditingAddrId(null);
        setAddrForm({ ...emptyAddr, fullName: user?.name || '', phone: user?.phone || '' });
      } else {
        const d = await res.json();
        setAddrError(d.error || 'Failed to save');
      }
    } catch { setAddrError('Failed to save address'); }
    setAddrSaving(false);
  };

  const handleProceedToPay = async () => {
    if (!selectedAddr) { alert('Please select a delivery address'); return; }
    setLoading(true);
    setPaymentFailed(false);
    setFailReason('');
    try {
      const addr = selectedAddr;
      // Step 1: Create Razorpay order on server
      const createRes = await apiFetch('/api/orders/checkout', {
        method: 'POST',
        body: JSON.stringify({
          customerName: addr.fullName,
          customerEmail: addr.email || user?.email || '',
          customerPhone: addr.phone,
          customerPincode: addr.pincode,
          total: grandTotal,
          items: items.map(i => ({ productId: i._id, name: i.name, price: i.price, quantity: i.qty, image: i.image })),
          addressId: addr._id,
          coupon: appliedCoupon ? { couponId: appliedCoupon.couponId, code: appliedCoupon.code, discount: appliedCoupon.discount } : null,
        }),
      });
      if (!createRes.ok) {
        const d = await createRes.json();
        throw new Error(d.error || 'Failed to create payment order');
      }
      const data = await createRes.json();
      const razorpayOrderId = data.rpOrder.id;
      const amountInPaise = data.rpOrder.amount;
      const currency = data.rpOrder.currency;

      // Step 2: Open Razorpay Checkout
      const scriptLoaded = await new Promise((resolve) => {
        if (window.Razorpay) return resolve(true);
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });

      if (!scriptLoaded || !window.Razorpay) {
        throw new Error('Failed to load payment gateway. Please disable your adblocker and try again.');
      }

      const configRes = await fetch(apiUrl('/api/config'));
      const configData = await configRes.json();
      const razorpayKeyId = configData.razorpayKeyId;
      if (!razorpayKeyId) throw new Error('Payment gateway not configured');

      const options = {
        key: razorpayKeyId,
        amount: amountInPaise,
        currency,
        name: 'Ingri',
        description: `Order — ${items.length} item${items.length > 1 ? 's' : ''}`,
        image: '/logo-favicon-green.png',
        order_id: razorpayOrderId,
        prefill: {
          name: addr.fullName,
          email: addr.email || user?.email || '',
          contact: addr.phone
        },
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          // Step 3: Verify payment on server
          try {
            const verifyRes = await apiFetch('/api/orders/verify', {
              method: 'POST',
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            if (verifyRes.ok) {
              const d = await verifyRes.json();
              localStorage.setItem('cart', JSON.stringify([]));
              localStorage.removeItem('appliedCoupon');
              setSuccess(true);
              setTimeout(() => navigate(`/order-confirmation/${d.orderId}`), 2500);
            } else {
              const d = await verifyRes.json();
              setPaymentFailed(true);
              setFailReason(d.error || 'Payment verification failed');
            }
          } catch {
            setPaymentFailed(true);
            setFailReason('Payment verification failed. Please contact support.');
          }
          setLoading(false);
        },

        notes: {
          contact: addr.phone
        },
        callback_url: `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/orders/verify-callback`,
        redirect: true,
        theme: {
          color: '#1A4547'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        setPaymentFailed(true);
        setFailReason(response.error.description || 'Payment failed. Please try again.');
      });
      rzp.open();
    } catch (err) {
      setPaymentFailed(true);
      setFailReason(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-[70vh] px-4">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="text-green-600" size={32} />
            </div>
            <h2 className="font-heading text-2xl text-[#1A3C3E] font-bold mb-2">Order Placed!</h2>
            <p className="font-body text-sm text-[#555] mb-4">Payment successful. Your order has been confirmed. Redirecting...</p>
            <div className="w-6 h-6 mx-auto border-2 border-[#1A4547]/30 border-t-[#1A4547] rounded-full animate-spin" />
          </motion.div>
        </div>
      </div>
    );
  }

  if (paymentFailed) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-[70vh] px-4">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle className="text-red-500" size={32} />
            </div>
            <h2 className="font-heading text-2xl text-[#1A3C3E] font-bold mb-2">Payment Failed</h2>
            <p className="font-body text-sm text-[#555] mb-6">{failReason || 'Your payment could not be processed. No amount has been deducted.'}</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => { setPaymentFailed(false); setFailReason(''); }}
                className="px-6 py-2.5 bg-[#1A4547] text-white font-body text-sm font-medium rounded-lg hover:bg-[#4A2E17] transition-colors">
                Try Again
              </button>
              <button onClick={() => navigate('/products')}
                className="px-6 py-2.5 border border-[#C8E0E0] text-[#555] font-body text-sm rounded-lg hover:bg-[#EFF7F7] transition-colors">
                Continue Shopping
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Header */}
      <section className="border-b border-[#D8EDED] bg-[#F5FAFA]">
        <div className="max-w-5xl mx-auto px-4 lg:px-8 pt-8 pb-6 md:pt-12 md:pb-8">
          <p className="font-body text-[11px] tracking-[0.2em] uppercase text-[#7A9A9C] mb-2">SECURE CHECKOUT</p>
          <h1 className="font-heading text-2xl md:text-3xl text-[#1A3C3E] font-bold">Checkout</h1>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 lg:px-8 py-6 md:py-10">
        {/* Order Summary — always on top on mobile, sidebar on desktop */}
        <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">

          {/* Order Summary — mobile: first, desktop: right column */}
          <div className="lg:col-span-2 lg:order-2">
            <div className="lg:sticky lg:top-20">
              <h2 className="font-heading text-base text-[#1A3C3E] font-bold mb-4 flex items-center gap-2">
                <ShoppingBag size={16} className="text-[#1A4547]" />
                Order Summary ({totalQty} {totalQty === 1 ? 'item' : 'items'})
              </h2>
              <div className="space-y-3 mb-4">
                {items.map(item => (
                  <div key={item._id} className="flex gap-3 items-center">
                    <img src={item.image} alt={item.name} className="w-14 h-14 rounded-lg object-cover border border-[#D8EDED] flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-sm text-[#1a1a1a] font-medium truncate">{item.name}</p>
                      <p className="font-body text-xs text-[#7A9A9C]">Qty: {item.qty}</p>
                    </div>
                    <p className="font-heading text-sm text-[#1a1a1a] font-bold flex-shrink-0">₹{item.price * item.qty}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-[#D8EDED] pt-3 space-y-2">
                <div className="flex justify-between font-body text-sm text-[#555]">
                  <span>Total MRP ({totalQty} {totalQty === 1 ? 'item' : 'items'})</span><span>₹{mrpTotal}</span>
                </div>
                {mrpDiscount > 0 && (
                  <div className="flex justify-between font-body text-sm text-[#555]">
                    <span>Discount on MRP</span><span className="text-[#6B8F71] font-medium">-₹{mrpDiscount}</span>
                  </div>
                )}
                {appliedCoupon && (
                  <div className="flex justify-between font-body text-sm text-[#555]">
                    <span>Coupon ({appliedCoupon.code})</span><span className="text-[#6B8F71] font-medium">-₹{appliedCoupon.discount}</span>
                  </div>
                )}
                <div className="flex justify-between font-body text-sm text-[#555]">
                  <span>Delivery</span>
                  {shippingFee === 0 ? (
                    <span className="text-[#6B8F71] font-medium">Free</span>
                  ) : (
                    <span className="font-medium">₹{shippingFee}</span>
                  )}
                </div>
                <div className="border-t border-[#D8EDED] pt-2 flex justify-between font-heading text-lg text-[#1a1a1a] font-bold">
                  <span>Total</span><span>₹{grandTotal}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Left column — Address + Payment + Place Order */}
          <div className="lg:col-span-3 lg:order-1 space-y-6">

            {/* Delivery Address */}
            <div>
              <h2 className="font-heading text-base text-[#1A3C3E] font-bold mb-4 flex items-center gap-2">
                <MapPin size={16} className="text-[#1A4547]" />
                Delivery Address
              </h2>

              {addrLoading ? (
                <div className="flex justify-center py-8">
                  <div className="w-5 h-5 border-2 border-[#1A4547]/20 border-t-[#1A4547] rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  {/* Saved addresses */}
                  {addresses.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {addresses.map(addr => (
                        <button key={addr._id} onClick={() => { setSelectedAddrId(addr._id); setShowAddrForm(false); }}
                          className={`w-full text-left p-4 rounded-lg border transition-all ${
                            selectedAddrId === addr._id
                              ? 'border-[#1A4547] bg-[#1A4547]/[0.03]'
                              : 'border-[#C8E0E0] hover:border-[#1A4547]/40'
                          }`}>
                          <div className="flex items-start gap-3">
                            <div className={`w-4 h-4 mt-0.5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                              selectedAddrId === addr._id ? 'border-[#1A4547]' : 'border-[#ccc]'
                            }`}>
                              {selectedAddrId === addr._id && <div className="w-2 h-2 rounded-full bg-[#1A4547]" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-heading text-sm font-semibold text-[#1a1a1a]">{addr.fullName}</span>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-[#EFF7F7] text-[#1A4547]">
                                  {addr.type === 'home' ? <Home size={10} /> : <Building2 size={10} />}
                                  {addr.type}
                                </span>
                                {addr.isDefault && <span className="text-[10px] text-[#1A4547] font-medium">Default</span>}
                              </div>
                              <p className="font-body text-xs text-[#555] leading-relaxed">
                                {[addr.houseNo, addr.addressLine1, addr.locality].filter(Boolean).join(', ')}
                              </p>
                              <p className="font-body text-xs text-[#555]">
                                {[addr.city, addr.state, addr.pincode].filter(Boolean).join(', ')}
                              </p>
                              <p className="font-body text-xs text-[#7A9A9C] mt-1">Phone: {addr.phone}</p>
                            </div>
                            <div className="flex shrink-0">
                               <button type="button" onClick={(e) => {
                                 e.stopPropagation();
                                 setAddrForm({
                                   fullName: addr.fullName, phone: addr.phone, houseNo: addr.houseNo || "",
                                   addressLine1: addr.addressLine1 || "", locality: addr.locality || "",
                                   city: addr.city, district: addr.district || "", state: addr.state,
                                   pincode: addr.pincode, landmark: addr.landmark || "",
                                   type: addr.type, isDefault: addr.isDefault,
                                 });
                                 setEditingAddrId(addr._id);
                                 setShowAddrForm(true);
                                 setAddrError("");
                               }}
                               className="text-[#7A9A9C] hover:text-[#1A4547] p-2 hover:bg-[#1A4547]/[0.06] rounded-md transition-colors" title="Edit Address">
                                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                               </button>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Add new address button */}
                  {!showAddrForm && (
                    <button onClick={() => setShowAddrForm(true)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 border border-dashed border-[#1A4547]/30 text-[#1A4547] font-body text-sm rounded-lg hover:bg-[#1A4547]/[0.03] transition-colors">
                      <Plus size={16} /> Add New Address
                    </button>
                  )}

                  {/* Address form */}
                  {showAddrForm && (
                    <div className="mt-4 p-4 rounded-lg border border-[#C8E0E0] bg-[#F5FAFA]">
                      <h3 className="font-heading text-sm text-[#1A3C3E] font-bold mb-4">New Address</h3>
                      {addrError && <p className="mb-3 text-xs text-red-600 bg-red-50 p-2 rounded">{addrError}</p>}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className={labelCls}>Full Name *</label>
                          <input type="text" value={addrForm.fullName} onChange={e => setAddrForm(f => ({ ...f, fullName: e.target.value }))} className={inputCls} placeholder="Full name" />
                        </div>
                        <div>
                          <label className={labelCls}>Email Address *</label>
                          <input type="email" value={addrForm.email} onChange={e => setAddrForm(f => ({ ...f, email: e.target.value }))} className={inputCls} placeholder="john@example.com" />
                        </div>
                        <div>
                          <label className={labelCls}>Phone *</label>
                          <input type="tel" value={addrForm.phone} onChange={e => setAddrForm(f => ({ ...f, phone: e.target.value }))} className={inputCls} placeholder="+91 98765 43210" />
                        </div>
                        <div>
                          <label className={labelCls}>House/Flat No.</label>
                          <input type="text" value={addrForm.houseNo} onChange={e => setAddrForm(f => ({ ...f, houseNo: e.target.value }))} className={inputCls} placeholder="e.g. B-204" />
                        </div>
                        <div>
                          <label className={labelCls}>Locality</label>
                          <input type="text" value={addrForm.locality} onChange={e => setAddrForm(f => ({ ...f, locality: e.target.value }))} className={inputCls} placeholder="e.g. Sector 28" />
                        </div>
                        <div className="col-span-2">
                          <label className={labelCls}>Address (Street, Road) *</label>
                          <input type="text" value={addrForm.addressLine1} onChange={e => setAddrForm(f => ({ ...f, addressLine1: e.target.value }))} className={inputCls} placeholder="e.g. MG Road" />
                        </div>
                        <div>
                          <label className={labelCls}>City *</label>
                          <input type="text" value={addrForm.city} onChange={e => setAddrForm(f => ({ ...f, city: e.target.value }))} className={inputCls} placeholder="City" />
                        </div>
                        <div>
                          <label className={labelCls}>District</label>
                          <input type="text" value={addrForm.district} onChange={e => setAddrForm(f => ({ ...f, district: e.target.value }))} className={inputCls} placeholder="District" />
                        </div>
                        <div>
                          <label className={labelCls}>State *</label>
                          <select value={addrForm.state} onChange={e => setAddrForm(f => ({ ...f, state: e.target.value }))} className={inputCls}>
                            <option value="">Select</option>
                            {states.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className={labelCls}>Pincode *</label>
                          <input type="text" value={addrForm.pincode} onChange={e => setAddrForm(f => ({ ...f, pincode: e.target.value }))} className={inputCls} placeholder="110001" maxLength={6} />
                        </div>
                        <div className="col-span-2">
                          <label className={labelCls}>Landmark</label>
                          <input type="text" value={addrForm.landmark} onChange={e => setAddrForm(f => ({ ...f, landmark: e.target.value }))} className={inputCls} placeholder="Near..." />
                        </div>
                        <div className="col-span-2 flex items-center gap-4">
                          <div className="flex gap-2">
                            {(['home', 'work'] as const).map(t => (
                              <button key={t} type="button" onClick={() => setAddrForm(f => ({ ...f, type: t }))}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                                  addrForm.type === t ? 'bg-[#1A4547] text-white border-[#1A4547]' : 'border-[#C8E0E0] text-[#555] hover:border-[#1A4547]/40'
                                }`}>
                                {t === 'home' ? <Home size={12} className="inline mr-1" /> : <Building2 size={12} className="inline mr-1" />}
                                {t.charAt(0).toUpperCase() + t.slice(1)}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3 mt-4">
                        <button onClick={handleSaveAddr} disabled={addrSaving}
                          className="px-5 py-2.5 bg-[#1A4547] text-white font-body text-sm font-medium rounded-lg hover:bg-[#4A2E17] transition-colors disabled:opacity-50">
                          {addrSaving ? 'Saving...' : editingAddrId ? 'Update Address' : 'Save Address'}
                        </button>
                        <button onClick={() => { setShowAddrForm(false); setEditingAddrId(null); setAddrError(''); }}
                          className="px-5 py-2.5 border border-[#C8E0E0] text-[#555] font-body text-sm rounded-lg hover:bg-[#EFF7F7] transition-colors">
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Payment */}
            <div>
              <h2 className="font-heading text-base text-[#1A3C3E] font-bold mb-3">Payment</h2>
              <div className="p-3 rounded-lg border border-[#1A4547] bg-[#1A4547]/[0.03] flex items-center gap-3">
                <div className="w-4 h-4 rounded-full border-2 border-[#1A4547] flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-[#1A4547]" />
                </div>
                <div>
                  <p className="font-body text-sm text-[#1a1a1a] font-medium">Pay Online</p>
                  <p className="font-body text-[11px] text-[#7A9A9C]">UPI, Cards, Net Banking, Wallets & more via Razorpay</p>
                </div>
              </div>
            </div>

            {/* Proceed to Pay */}
            <button onClick={handleProceedToPay} disabled={loading || !selectedAddr}
              className="w-full py-3.5 rounded-lg bg-[#1A4547] text-white font-heading text-sm font-semibold tracking-wide hover:bg-[#4A2E17] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
              ) : (
                <>Proceed to Pay — ₹{grandTotal} <ChevronRight size={16} /></>
              )}
            </button>
            <p className="text-center font-body text-[11px] text-[#7A9A9C]">Secure checkout powered by Razorpay • 256-bit SSL encryption</p>
          </div>
        </div>
      </div>


    </div>
  );
}
