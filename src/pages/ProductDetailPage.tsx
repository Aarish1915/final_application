import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/useAuth';
import { apiUrl } from '@/lib/api';
import {
  Heart, Star, Package, Truck, Shield,
  Plus, Minus, ChevronLeft, ChevronRight, ShoppingCart, RotateCcw, Leaf, AlertTriangle, Snowflake, Info,
  ShoppingBag, X, Trash2, ArrowRight, Send, User as UserIcon, PenLine, MapPin, Loader2
} from 'lucide-react';

type Product = {
  _id: string; name: string; category: string; price: number;
  mrp?: number; salePrice?: number; discount?: number;
  image: string; images?: string[]; rating: number; description?: string; reviews?: number; stock?: number;
  bestSeller?: boolean; isAddon?: boolean; weight?: string;
  allergens?: string; storage?: string; shelfLife?: string; ingredients?: string;
};
type CartItem = { _id: string; name: string; price: number; image: string; qty: number };

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [inWishlist, setInWishlist] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);
  const [cartOpen, setCartOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ couponId: string; code: string; discount: number; description: string } | null>(null);
  const [addonProducts, setAddonProducts] = useState<Product[]>([]);

  // Reviews state
  type ReviewData = { _id: string; userName: string; rating: number; title: string; comment: string; createdAt: string; userId: string };
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [reviewTotal, setReviewTotal] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [ratingCounts, setRatingCounts] = useState<Record<number, number>>({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewPages, setReviewPages] = useState(1);
  const [reviewSort, setReviewSort] = useState("newest");
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewName, setReviewName] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Pincode state
  const [pincodeCheck, setPincodeCheck] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [pincodeMessage, setPincodeMessage] = useState('');

  const allImages = product ? [product.image, ...(product.images || []).filter(img => img !== product.image)] : [];
  const effectivePrice = product ? (product.salePrice || product.price) : 0;
  const discountPercent = product?.mrp && product.mrp > effectivePrice ? Math.round(((product.mrp - effectivePrice) / product.mrp) * 100) : 0;

  const loadCart = useCallback((): CartItem[] => JSON.parse(localStorage.getItem('cart') || '[]'), []);
  const saveCartToStorage = useCallback((items: CartItem[]) => { localStorage.setItem('cart', JSON.stringify(items)); setCart(items); }, []);

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartMrpTotal = cart.reduce((sum, item) => {
    const prod = relatedProducts.find(p => p._id === item._id);
    const mrp = prod?.mrp || (product?._id === item._id ? product?.mrp : undefined) || item.price;
    return sum + mrp * item.qty;
  }, 0);
  const cartDiscount = cartMrpTotal - cartTotal;
  const couponDiscount = appliedCoupon?.discount || 0;
  const subtotalAfterDiscount = cartTotal - couponDiscount;
  const shippingFee = subtotalAfterDiscount < 499 ? 49 : 0;
  const cartFinalTotal = subtotalAfterDiscount + shippingFee;

  // Load saved coupon from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('appliedCoupon');
    if (saved) { try { setAppliedCoupon(JSON.parse(saved)); } catch { /* ignore */ } }
  }, []);

  // Re-validate coupon when cart total changes
  useEffect(() => {
    if (!appliedCoupon) return;
    (async () => {
      try {
        const res = await fetch(apiUrl('/api/coupons/validate'), {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: appliedCoupon.code, orderTotal: cartTotal, userId: user?.id }),
        });
        if (res.ok) {
          const data = await res.json();
          const updated = { couponId: data.couponId, code: data.code, discount: data.discount, description: data.description || '' };
          setAppliedCoupon(updated);
          localStorage.setItem('appliedCoupon', JSON.stringify(updated));
        } else { setAppliedCoupon(null); localStorage.removeItem('appliedCoupon'); }
      } catch { /* keep existing */ }
    })();
  }, [cartTotal, cart.length]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true); setCouponError('');
    try {
      const res = await fetch(apiUrl('/api/coupons/validate'), {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim(), orderTotal: cartTotal, userId: user?.id }),
      });
      const data = await res.json();
      if (!res.ok) { setCouponError(data.error || 'Invalid coupon'); setAppliedCoupon(null); localStorage.removeItem('appliedCoupon'); }
      else {
        const coupon = { couponId: data.couponId, code: data.code, discount: data.discount, description: data.description || '' };
        setAppliedCoupon(coupon); setCouponError('');
        localStorage.setItem('appliedCoupon', JSON.stringify(coupon));
      }
    } catch { setCouponError('Failed to validate coupon'); }
    setCouponLoading(false);
  };

  const removeCoupon = () => { setAppliedCoupon(null); setCouponCode(''); setCouponError(''); localStorage.removeItem('appliedCoupon'); };

  useEffect(() => {
    window.scrollTo(0, 0);
    setSelectedImage(0);
    setAddedToCart(false);
    setQuantity(1);
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch(apiUrl(`/api/products/${id}`));
        if (res.ok) {
          const data = await res.json();
          if (data.product) {
            setProduct(data.product);
            if (data.related || data.relatedProducts) {
              setRelatedProducts((data.related || data.relatedProducts).filter((p: Product) => p._id !== id).slice(0, 8));
            } else {
              try {
                const rRes = await fetch(apiUrl(`/api/products?category=${encodeURIComponent(data.product.category)}&limit=10`));
                if (rRes.ok) { const rData = await rRes.json(); setRelatedProducts((rData.products || []).filter((p: Product) => p._id !== id).slice(0, 8)); }
              } catch { /* silent */ }
            }
          }
        }
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (!product) return;
    const saved = JSON.parse(localStorage.getItem('wishlist') || '[]');
    setInWishlist(saved.some((i: { _id: string }) => i._id === product._id));
    const c = loadCart();
    setAddedToCart(c.some(ci => ci._id === product._id));
  }, [product, loadCart]);

  // Load cart from localStorage
  useEffect(() => { setCart(loadCart()); }, [loadCart]);

  // Listen for open-cart event (from Navbar)
  useEffect(() => {
    const handler = () => setCartOpen(true);
    window.addEventListener('open-cart', handler);
    return () => window.removeEventListener('open-cart', handler);
  }, []);

  // Fetch addon products
  useEffect(() => {
    const fetchAddons = async () => {
      try {
        const res = await fetch(apiUrl('/api/products?isAddon=true&limit=12'));
        if (res.ok) { const data = await res.json(); if (data.products?.length > 0) setAddonProducts(data.products); }
      } catch { /* silent */ }
    };
    fetchAddons();
  }, []);

  // Fetch reviews
  const fetchReviews = useCallback(async (page = 1, sort = "newest") => {
    if (!id) return;
    try {
      const res = await fetch(apiUrl(`/api/reviews/${id}?page=${page}&limit=5&sort=${sort}`));
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
        setReviewTotal(data.total || 0);
        setAvgRating(data.avgRating || 0);
        setRatingCounts(data.ratingCounts || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
        setReviewPages(data.pagination?.pages || 1);
      }
    } catch { /* silent */ }
  }, [id]);

  useEffect(() => { fetchReviews(reviewPage, reviewSort); }, [id, reviewPage, reviewSort, fetchReviews]);

  const handleSubmitReview = async () => {
    if (!reviewName.trim()) { setReviewError("Please enter your name"); return; }
    if (reviewRating === 0) { setReviewError("Please select a star rating"); return; }
    setSubmittingReview(true); setReviewError(""); setReviewSuccess("");
    try {
      const cookieMatch = document.cookie.match(/(?:^|;\s*)ingri_token=([^;]*)/);
      const token = cookieMatch ? decodeURIComponent(cookieMatch[1]) : localStorage.getItem("ingri_token");
      const res = await fetch(apiUrl("/api/reviews"), {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ productId: id, rating: reviewRating, title: reviewTitle, comment: reviewComment, userName: reviewName }),
      });
      const data = await res.json();
      if (res.ok) {
        setReviewSuccess(data.message || "Review submitted!");
        setReviewRating(0); setReviewTitle(""); setReviewComment("");
        fetchReviews(1, reviewSort);
        setReviewPage(1);
      } else { setReviewError(data.error || "Failed to submit review"); }
    } catch { setReviewError("Something went wrong. Please try again."); }
    finally { setSubmittingReview(false); }
  };

  const checkPincode = async () => {
    if (!pincodeCheck || pincodeCheck.length !== 6) {
      setPincodeStatus('error');
      setPincodeMessage('Please enter a valid 6-digit pincode');
      return;
    }
    setPincodeStatus('loading');
    try {
      const res = await fetch(apiUrl(`/api/pincodes/check?code=${pincodeCheck}`));
      const data = await res.json();
      if (res.ok && data.serviceable) {
        setPincodeStatus('success');
        setPincodeMessage('Delivery Available!');
      } else {
        setPincodeStatus('error');
        setPincodeMessage(data.message || 'Sorry, we do not deliver to this pincode yet.');
      }
    } catch {
      setPincodeStatus('error');
      setPincodeMessage('Error checking pincode. Please try again.');
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    const c = loadCart();
    const ex = c.find(ci => ci._id === product._id);
    if (ex) { ex.qty += quantity; }
    else { c.push({ _id: product._id, name: product.name, price: effectivePrice, image: product.image, qty: quantity }); }
    saveCartToStorage(c);
    setAddedToCart(true);
    setCartOpen(true);
  };

  const updateQty = (cid: string, d: number) => {
    const updated = cart.map(c => c._id === cid ? { ...c, qty: Math.max(0, c.qty + d) } : c).filter(c => c.qty > 0);
    saveCartToStorage(updated);
  };
  const removeFromCart = (cid: string) => saveCartToStorage(cart.filter(c => c._id !== cid));

  const addRelatedToCart = (rp: Product) => {
    const c = loadCart();
    const ex = c.find(ci => ci._id === rp._id);
    const rpPrice = rp.salePrice || rp.price;
    if (ex) { ex.qty += 1; } else { c.push({ _id: rp._id, name: rp.name, price: rpPrice, image: rp.image, qty: 1 }); }
    saveCartToStorage(c);
    setCartOpen(true);
  };

  const handleBuyNow = () => {
    setCartOpen(false);
    navigate('/checkout');
  };

  const toggleWishlist = () => {
    if (!product) return;
    const saved = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const exists = saved.find((i: { _id: string }) => i._id === product._id);
    const updated = exists ? saved.filter((i: { _id: string }) => i._id !== product._id) : [...saved, product];
    localStorage.setItem('wishlist', JSON.stringify(updated));
    setInWishlist(!exists);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 lg:px-10 pt-8 pb-20">
          <div className="h-4 w-48 bg-[#EFF7F7] rounded mb-6 animate-pulse" />
          <div className="grid lg:grid-cols-[1fr_1fr] gap-8">
            <div className="space-y-3">
              <div className="h-[400px] md:h-[520px] bg-[#EFF7F7] rounded-lg animate-pulse" />
              <div className="flex gap-2">{[...Array(4)].map((_, i) => <div key={i} className="w-16 h-16 bg-[#EFF7F7] rounded animate-pulse" />)}</div>
            </div>
            <div className="space-y-4 animate-pulse">
              <div className="h-5 w-24 bg-[#EFF7F7] rounded" />
              <div className="h-8 w-3/4 bg-[#EFF7F7] rounded" />
              <div className="h-4 w-32 bg-[#EFF7F7] rounded" />
              <div className="h-20 w-full bg-[#EFF7F7] rounded" />
              <div className="h-8 w-40 bg-[#EFF7F7] rounded" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 lg:px-10 pt-16 pb-20 text-center">
          <Package className="mx-auto text-[#9CB8BA] mb-4" size={48} />
          <p className="font-body text-[#7A9A9C] mb-4">Product not found</p>
          <Link to="/products" className="font-body text-sm text-[#1A4547] hover:underline">← Back to Shop</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>{product.name} | Ingri World</title>
        <meta name="description" content={product.description || `Buy ${product.name} at Ingri World. ${product.category} - ₹${product.salePrice || product.price}`} />
      </Helmet>
      <Navbar />

      {/* ══ PRODUCT SECTION ══ */}
      <div className="max-w-6xl mx-auto px-4 lg:px-10 pt-5 md:pt-8 pb-6 md:pb-10">
        {/* Inline breadcrumb */}
        <nav className="flex items-center gap-1.5 font-body text-[11px] tracking-wide text-[#9CB8BA] mb-5 md:mb-7">
          <Link to="/" className="hover:text-[#1A4547] transition-colors">Home</Link>
          <ChevronRight size={9} strokeWidth={2} className="text-[#A8C8CA]" />
          <Link to="/products" className="hover:text-[#1A4547] transition-colors">Shop</Link>
          <ChevronRight size={9} strokeWidth={2} className="text-[#A8C8CA]" />
          <Link to={`/products?category=${encodeURIComponent(product.category)}`} className="hover:text-[#1A4547] transition-colors">{product.category}</Link>
          <ChevronRight size={9} strokeWidth={2} className="text-[#A8C8CA]" />
          <span className="text-[#7A9A9C] truncate max-w-[120px] md:max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-[1fr_1fr] gap-6 lg:gap-12">

          {/* ── LEFT: Image Gallery ── */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            {/* Main Image */}
            <div className="relative bg-[#EFF7F7] rounded-lg overflow-hidden border border-[#D8EDED] mb-3">
              <img
                src={allImages[selectedImage] || product.image}
                alt={product.name}
                className="w-full h-[340px] sm:h-[420px] md:h-[520px] object-cover"
              />
              {product.bestSeller && (
                <span className="absolute top-3 left-3 bg-[#1A4547] text-white font-body text-[10px] tracking-[0.1em] uppercase px-2.5 py-1 rounded-sm">Bestseller</span>
              )}
              {discountPercent > 0 && (
                <span className="absolute top-3 right-3 bg-[#D4553A] text-white font-body text-[10px] font-bold px-2 py-1 rounded-sm">{discountPercent}% OFF</span>
              )}
            </div>

            {/* Thumbnail Strip */}
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-16 h-16 md:w-[72px] md:h-[72px] rounded-md overflow-hidden border-2 flex-shrink-0 transition-all ${
                      selectedImage === i ? 'border-[#1A4547] shadow-sm' : 'border-[#D8EDED] hover:border-[#9CB8BA]'
                    }`}
                  >
                    <img src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* ── RIGHT: Product Info ── */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>

            {/* Category */}
            <p className="font-body text-[10px] tracking-[0.2em] uppercase text-[#7A9A9C] mb-2">{product.category}</p>

            {/* Name */}
            <h1 className="font-heading text-xl sm:text-2xl md:text-3xl text-[#1a1a1a] font-bold leading-tight mb-3">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1 bg-[#EFF7F7] px-2.5 py-1 rounded-md">
                <Star size={13} className="fill-[#F5A623] text-[#F5A623]" />
                <span className="font-body text-sm text-[#1a1a1a] font-semibold">{avgRating || product.rating}</span>
              </div>
              <span className="font-body text-xs text-[#7A9A9C]">{reviewTotal || product.reviews || 0} reviews</span>
              {product.weight && <span className="font-body text-xs text-[#7A9A9C]">· {product.weight}</span>}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-5 pb-5 border-b border-[#D8EDED]">
              <span className="font-heading text-2xl md:text-3xl text-[#1a1a1a] font-bold">₹{effectivePrice}</span>
              {product.mrp && product.mrp > effectivePrice && (
                <>
                  <span className="font-body text-base text-[#9CB8BA] line-through">₹{product.mrp}</span>
                  <span className="font-body text-sm text-[#D4553A] font-medium">({discountPercent}% off)</span>
                </>
              )}
            </div>

            {/* Pincode Checker */}
            <div className="mb-5 bg-[#EFF7F7] p-4 rounded-lg border border-[#D8EDED]">
              <p className="font-heading text-sm text-[#1A4547] font-semibold flex items-center gap-2 mb-2">
                <MapPin size={16} /> Check Delivery Availability
              </p>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <input
                      type="text"
                      maxLength={6}
                      value={pincodeCheck}
                      onChange={(e) => setPincodeCheck(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter 6-digit Pincode"
                      className="w-full h-10 px-3 py-2 bg-white border border-[#A8C8CA] text-sm text-[#1a1a1a] font-body rounded focus:outline-none focus:border-[#1A4547] transition-colors"
                    />
                </div>
                <button
                  onClick={checkPincode}
                  disabled={pincodeStatus === 'loading'}
                  className="h-10 px-4 bg-[#1A4547] text-white text-sm font-heading rounded hover:bg-[#122e30] transition-colors flex items-center gap-2 disabled:opacity-70"
                >
                  {pincodeStatus === 'loading' ? <Loader2 size={16} className="animate-spin" /> : 'Check'}
                </button>
              </div>
              {pincodeStatus === 'success' && (
                <p className="font-body text-xs text-green-600 mt-2 font-medium">{pincodeMessage}</p>
              )}
              {pincodeStatus === 'error' && (
                <p className="font-body text-xs text-red-500 mt-2 font-medium">{pincodeMessage}</p>
              )}
            </div>

            {/* Description */}
            <div className="mb-5">
              <p className="font-body text-sm text-[#666] leading-relaxed">{product.description || 'No description available.'}</p>
            </div>

            {/* Ingredients, Storage & Allergen Info */}
            <div className="mb-5 space-y-3">
              <div className="flex items-start gap-2.5">
                <Leaf size={14} className="text-[#1A4547] mt-0.5 flex-shrink-0" />
                <div><p className="font-body text-[11px] text-[#7A9A9C] uppercase tracking-wide mb-0.5">Ingredients</p><p className="font-body text-sm text-[#555] leading-relaxed">{product.ingredients || 'Details available on packaging.'}</p></div>
              </div>
              <div className="flex items-start gap-2.5">
                <Snowflake size={14} className="text-[#1A4547] mt-0.5 flex-shrink-0" />
                <div><p className="font-body text-[11px] text-[#7A9A9C] uppercase tracking-wide mb-0.5">Storage</p><p className="font-body text-sm text-[#555]">{product.storage || 'Refer to packaging for storage instructions.'}</p></div>
              </div>
              {product.shelfLife && (
                <div className="flex items-start gap-2.5">
                  <Info size={14} className="text-[#1A4547] mt-0.5 flex-shrink-0" />
                  <div><p className="font-body text-[11px] text-[#7A9A9C] uppercase tracking-wide mb-0.5">Shelf Life</p><p className="font-body text-sm text-[#555]">{product.shelfLife}</p></div>
                </div>
              )}
              <div className="flex items-start gap-2.5">
                <AlertTriangle size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
                <div><p className="font-body text-[11px] text-[#7A9A9C] uppercase tracking-wide mb-0.5">Allergen Info</p><p className="font-body text-sm text-[#555]">{product.allergens || 'Please check product label for allergen details.'}</p></div>
              </div>
            </div>

            {/* Quantity + Add to Cart */}
            <div className="mb-5 pb-5 border-b border-[#D8EDED]">
              <div className="flex items-center gap-4 mb-4">
                <label className="font-body text-xs text-[#7A9A9C] tracking-wide uppercase">Qty</label>
                <div className="flex items-center border border-[#D0E8E8] rounded-lg overflow-hidden">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-9 h-9 flex items-center justify-center text-[#5E8A8C] hover:bg-[#EFF7F7] transition-colors"><Minus size={14} /></button>
                  <span className="font-body text-sm text-[#1a1a1a] w-10 text-center font-semibold border-x border-[#D0E8E8]">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(10, quantity + 1))} className="w-9 h-9 flex items-center justify-center text-[#5E8A8C] hover:bg-[#EFF7F7] transition-colors"><Plus size={14} /></button>
                </div>
                {product.stock !== undefined && <span className="font-body text-[11px] text-[#9CB8BA]">{product.stock} in stock</span>}
              </div>

              <div className="flex gap-2.5">
                {(!product.inStock || product.quantity <= 0) ? (
                  <button
                    disabled
                    className="flex-1 py-3.5 rounded-xl font-body text-sm tracking-wide flex items-center justify-center gap-2 transition-all bg-[#F5F5F5] text-[#999] cursor-not-allowed"
                  >
                    Out of Stock
                  </button>
                ) : (
                  <button
                    onClick={handleAddToCart}
                    disabled={addedToCart}
                    className={`flex-1 py-3.5 rounded-xl font-body text-sm tracking-wide flex items-center justify-center gap-2 transition-all ${
                      addedToCart
                        ? 'bg-[#EFF7F7] text-[#1A4547] border border-[#1A4547]/20 cursor-default'
                        : 'bg-[#1A4547] text-white hover:bg-[#122E30] shadow-[0_4px_12px_rgba(35,90,93,0.2)]'
                    }`}
                  >
                    <ShoppingCart size={16} />
                    {addedToCart ? 'Added to Cart' : 'Add to Cart'}
                  </button>
                )}
                <button
                  onClick={toggleWishlist}
                  className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-all ${
                    inWishlist ? 'border-red-200 bg-red-50' : 'border-[#D0E8E8] hover:border-[#9CB8BA]'
                  }`}
                  aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart size={18} className={inWishlist ? 'fill-red-500 text-red-500' : 'text-[#7A9A9C]'} />
                </button>
              </div>
            </div>

            {/* Delivery & Return Policy — Horizontal */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              <div className="flex flex-col items-center text-center p-3 bg-[#EFF7F7] rounded-xl">
                <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center mb-2 shadow-sm"><Truck size={16} className="text-[#1A4547]" /></div>
                <p className="font-body text-[11px] text-[#1a1a1a] font-medium leading-tight">Free Delivery</p>
                <p className="font-body text-[9px] text-[#7A9A9C] mt-0.5">Above ₹499</p>
              </div>
              <div className="flex flex-col items-center text-center p-3 bg-[#EFF7F7] rounded-xl">
                <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center mb-2 shadow-sm"><RotateCcw size={16} className="text-[#1A4547]" /></div>
                <p className="font-body text-[11px] text-[#1a1a1a] font-medium leading-tight">Easy Returns</p>
                <p className="font-body text-[9px] text-[#7A9A9C] mt-0.5">7-day policy</p>
              </div>
              <div className="flex flex-col items-center text-center p-3 bg-[#EFF7F7] rounded-xl">
                <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center mb-2 shadow-sm"><Shield size={16} className="text-[#1A4547]" /></div>
                <p className="font-body text-[11px] text-[#1a1a1a] font-medium leading-tight">Quality Assured</p>
                <p className="font-body text-[9px] text-[#7A9A9C] mt-0.5">FSSAI certified</p>
              </div>
              <div className="flex flex-col items-center text-center p-3 bg-[#EFF7F7] rounded-xl">
                <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center mb-2 shadow-sm"><Leaf size={16} className="text-[#1A4547]" /></div>
                <p className="font-body text-[11px] text-[#1a1a1a] font-medium leading-tight">Clean Label</p>
                <p className="font-body text-[9px] text-[#7A9A9C] mt-0.5">No preservatives</p>
              </div>
            </div>

          </motion.div>
        </div>
      </div>

      {/* ══ SIMILAR PRODUCTS — HomePage Bestseller Style ══ */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-[#D8EDED] bg-[#EFF7F7] py-10 md:py-14">
          <div className="max-w-6xl mx-auto px-4 lg:px-10">
            <div className="flex items-end justify-between mb-6">
              <h2 className="font-heading text-xl md:text-2xl text-[#1a1a1a] font-bold">More Items Like This</h2>
              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2">
                  <button onClick={() => { const el = document.getElementById('similar-scroll'); if (el) el.scrollBy({ left: -300, behavior: 'smooth' }); }}
                    className="w-9 h-9 rounded-full border border-[#1A4547]/20 flex items-center justify-center text-[#1A4547] hover:bg-[#1A4547] hover:text-white transition-all duration-200">
                    <ChevronLeft size={16} />
                  </button>
                  <button onClick={() => { const el = document.getElementById('similar-scroll'); if (el) el.scrollBy({ left: 300, behavior: 'smooth' }); }}
                    className="w-9 h-9 rounded-full border border-[#1A4547]/20 flex items-center justify-center text-[#1A4547] hover:bg-[#1A4547] hover:text-white transition-all duration-200">
                    <ChevronRight size={16} />
                  </button>
                </div>
                <Link to="/products" className="font-body text-sm text-[#1A4547] font-medium hover:underline hidden md:inline-flex items-center gap-1">
                  View All <ChevronRight size={14} />
                </Link>
              </div>
            </div>
            <div id="similar-scroll" className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {relatedProducts.map(rp => {
                const rpMrp = rp.mrp || Math.round((rp.salePrice || rp.price) * 1.25);
                const rpSale = rp.salePrice || rp.price;
                const rpDiscount = rpMrp > rpSale ? Math.round(((rpMrp - rpSale) / rpMrp) * 100) : 0;
                return (
                  <div key={rp._id} className="shrink-0 w-[42vw] sm:w-[30vw] md:w-[22vw] lg:w-[17vw] snap-start group">
                    <Link to={`/products/${rp._id}`} onClick={() => window.scrollTo(0, 0)} className="block">
                      <div className="relative bg-white border border-gray-100 rounded-xl overflow-hidden aspect-square shadow-sm">
                        <img src={rp.image} alt={rp.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      </div>
                      <div className="mt-3 space-y-1 px-0.5">
                        <h3 className="font-heading text-[13px] text-[#1a1a1a] font-semibold leading-snug line-clamp-1">{rp.name}</h3>
                        <div className="flex items-center gap-1.5">
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={10} className={i < Math.round(rp.rating || 0) ? "text-[#F5A623] fill-[#F5A623]" : "text-gray-200 fill-gray-200"} />
                            ))}
                          </div>
                          <span className="font-body text-[10px] text-[#1a1a1a]/50">({rp.reviews || 0})</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="font-heading text-sm font-bold text-[#1a1a1a]">₹{rpSale}</span>
                          {rpDiscount > 0 && <span className="font-body text-[11px] text-[#1a1a1a]/35 line-through">MRP ₹{rpMrp}</span>}
                        </div>
                      </div>
                    </Link>
                    <div className="px-0.5 mt-2">
                      <button
                        onClick={() => addRelatedToCart(rp)}
                        className="w-full py-2 bg-[#1a1a1a] text-white font-heading text-[11px] font-semibold tracking-wide rounded-lg hover:bg-[#1A4547] transition-colors"
                      >
                        Add to cart
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ══ REVIEWS SECTION ══ */}
      <section className="border-t border-[#D8EDED] bg-white py-10 md:py-14">
        <div className="max-w-6xl mx-auto px-4 lg:px-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>

            {/* Header */}
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="font-body text-[10px] tracking-[0.2em] uppercase text-[#7A9A9C] mb-2">CUSTOMER FEEDBACK</p>
                <h2 className="font-heading text-xl md:text-2xl text-[#1a1a1a] font-bold">Ratings & Reviews</h2>
              </div>
            </div>

            <div className="grid lg:grid-cols-[320px_1fr] gap-8 lg:gap-12">

              {/* Left: Rating Summary + Write Review */}
              <div>
                {/* Rating Summary */}
                <div className="bg-[#EFF7F7] rounded-2xl p-5 mb-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-center">
                      <p className="font-heading text-4xl text-[#1a1a1a] font-bold leading-none">{avgRating || product?.rating || 0}</p>
                      <div className="flex items-center gap-0.5 mt-1.5 justify-center">
                        {[1, 2, 3, 4, 5].map(i => (
                          <Star key={i} size={14} className={i <= Math.round(avgRating || product?.rating || 0) ? "text-[#F5A623] fill-[#F5A623]" : "text-[#A8C8CA] fill-[#A8C8CA]"} />
                        ))}
                      </div>
                      <p className="font-body text-[11px] text-[#7A9A9C] mt-1">{reviewTotal} review{reviewTotal !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="flex-1 space-y-1.5">
                      {[5, 4, 3, 2, 1].map(star => {
                        const count = ratingCounts[star] || 0;
                        const pct = reviewTotal > 0 ? (count / reviewTotal) * 100 : 0;
                        return (
                          <div key={star} className="flex items-center gap-2">
                            <span className="font-body text-[11px] text-[#5E8A8C] w-3 text-right">{star}</span>
                            <Star size={10} className="text-[#F5A623] fill-[#F5A623] flex-shrink-0" />
                            <div className="flex-1 h-1.5 bg-[#D0E8E8] rounded-full overflow-hidden">
                              <div className="h-full bg-[#F5A623] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="font-body text-[10px] text-[#7A9A9C] w-6 text-right">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {/* Mobile: Write a Review button */}
                  <button
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="lg:hidden w-full mt-2 py-2.5 bg-[#1A4547] text-white font-body text-sm tracking-wide rounded-xl hover:bg-[#122E30] transition-colors flex items-center justify-center gap-2"
                  >
                    <PenLine size={14} />
                    {showReviewForm ? "Hide Review Form" : "Write a Review"}
                  </button>
                </div>

                {/* Write Review Form — always visible on desktop, toggled on mobile */}
                <div className={`${showReviewForm ? 'block' : 'hidden'} lg:block`}>
                  <div className="bg-[#F5FAFA] border border-[#D8EDED] rounded-2xl p-5">
                    <h3 className="font-heading text-sm text-[#1a1a1a] font-bold mb-4">Write a Review</h3>

                    {/* Star Selection */}
                    <div className="mb-4">
                      <p className="font-body text-[11px] text-[#7A9A9C] uppercase tracking-wide mb-2">Your Rating</p>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(i => (
                          <button key={i} type="button"
                            onMouseEnter={() => setReviewHover(i)}
                            onMouseLeave={() => setReviewHover(0)}
                            onClick={() => setReviewRating(i)}
                            className="p-0.5 transition-transform hover:scale-110"
                            aria-label={`Rate ${i} star${i > 1 ? 's' : ''}`}>
                            <Star size={24} className={`transition-colors ${i <= (reviewHover || reviewRating) ? "text-[#F5A623] fill-[#F5A623]" : "text-[#A8C8CA]"}`} />
                          </button>
                        ))}
                        {reviewRating > 0 && <span className="font-body text-xs text-[#5E8A8C] ml-2">{reviewRating}/5</span>}
                      </div>
                    </div>

                    {/* Title */}
                    <div className="mb-3">
                      <input type="text" placeholder="Your Name *" value={reviewName} onChange={(e) => setReviewName(e.target.value)} className="w-full px-4 py-3 bg-[#1A4547]/[0.02] border border-[#1A4547]/10 rounded-xl text-sm font-body focus:outline-none focus:border-[#1A4547]/30 focus:ring-1 focus:ring-[#1A4547]/30 transition-all placeholder:text-[#9CB8BA] mb-3" />
                    <input type="text" placeholder="Review title (optional)" value={reviewTitle}
                        onChange={e => setReviewTitle(e.target.value)} maxLength={100}
                        className="w-full px-3.5 py-2.5 border border-[#D0E8E8] rounded-xl font-body text-sm text-[#1a1a1a] placeholder:text-[#9CB8BA] focus:outline-none focus:border-[#5E9A9C] bg-white" />
                    </div>

                    {/* Comment */}
                    <div className="mb-4">
                      <textarea placeholder="Share your experience with this product..." value={reviewComment}
                        onChange={e => setReviewComment(e.target.value)} maxLength={500} rows={3}
                        className="w-full px-3.5 py-2.5 border border-[#D0E8E8] rounded-xl font-body text-sm text-[#1a1a1a] placeholder:text-[#9CB8BA] focus:outline-none focus:border-[#5E9A9C] resize-none bg-white" />
                      <p className="font-body text-[10px] text-[#9CB8BA] text-right mt-1">{reviewComment.length}/500</p>
                    </div>

                    {reviewError && <p className="font-body text-xs text-red-500 mb-3">{reviewError}</p>}
                    {reviewSuccess && <p className="font-body text-xs text-[#25A56A] mb-3">{reviewSuccess}</p>}

                    <button onClick={handleSubmitReview} disabled={submittingReview}
                      className="w-full py-3 bg-[#1A4547] text-white font-body text-sm tracking-wide rounded-xl hover:bg-[#122E30] transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                      <Send size={14} />
                      {submittingReview ? "Submitting..." : "Submit Review"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right: Reviews List */}
              <div>
                {/* Sort */}
                {reviewTotal > 0 && (
                  <div className="flex items-center justify-between mb-5">
                    <p className="font-body text-xs text-[#7A9A9C]">{reviewTotal} review{reviewTotal !== 1 ? 's' : ''}</p>
                    <select value={reviewSort} onChange={e => { setReviewSort(e.target.value); setReviewPage(1); }}
                      className="font-body text-xs text-[#1A4547] bg-transparent border border-[#D0E8E8] rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#5E9A9C] cursor-pointer">
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="highest">Highest Rated</option>
                      <option value="lowest">Lowest Rated</option>
                    </select>
                  </div>
                )}

                {reviews.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-[#EFF7F7] flex items-center justify-center">
                      <Star className="text-[#9CB8BA]" size={24} />
                    </div>
                    <p className="font-heading text-sm text-[#1a1a1a] font-semibold mb-1">No reviews yet</p>
                    <p className="font-body text-xs text-[#7A9A9C]">Be the first to share your experience</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((r, idx) => (
                      <motion.div key={r._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: idx * 0.05 }}
                        className="border border-[#D8EDED] rounded-xl p-4 bg-[#F5FAFA]">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#1A4547]/10 flex items-center justify-center">
                              <UserIcon size={14} className="text-[#1A4547]" />
                            </div>
                            <div>
                              <p className="font-heading text-[13px] text-[#1a1a1a] font-semibold">{r.userName}</p>
                              <p className="font-body text-[10px] text-[#7A9A9C]">{new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 bg-[#EFF7F7] px-2 py-1 rounded-md">
                            <Star size={11} className="fill-[#F5A623] text-[#F5A623]" />
                            <span className="font-body text-xs text-[#1a1a1a] font-semibold">{r.rating}</span>
                          </div>
                        </div>
                        {r.title && <p className="font-heading text-sm text-[#1a1a1a] font-semibold mb-1">{r.title}</p>}
                        {r.comment && <p className="font-body text-sm text-[#666] leading-relaxed">{r.comment}</p>}
                      </motion.div>
                    ))}

                    {/* Pagination */}
                    {reviewPages > 1 && (
                      <div className="flex items-center justify-center gap-2 pt-4">
                        {Array.from({ length: reviewPages }, (_, i) => i + 1).map(p => (
                          <button key={p} onClick={() => setReviewPage(p)}
                            className={`w-8 h-8 rounded-lg font-body text-xs font-medium transition-colors ${p === reviewPage ? 'bg-[#1A4547] text-white' : 'bg-[#EFF7F7] text-[#5E8A8C] hover:bg-[#D8EDED]'}`}>
                            {p}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ QUOTE SECTION ══ */}
      <section className="relative py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0">
          <img src="/images/AMBIANCE/Screenshot 2026-02-13 192822.png" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[#1a1a1a]/70" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-6 lg:px-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <blockquote className="font-heading text-xl md:text-2xl text-white/90 font-light leading-relaxed mb-6 italic">
              "Great food, like great art, is built on discipline and detail. What we create in the kitchen is meant to be experienced beyond it."
            </blockquote>
            <p className="font-heading text-sm text-white font-bold tracking-[0.1em] uppercase">Chef Sunil Chauhan</p>
            <p className="font-body text-xs text-white/50 tracking-[0.1em] uppercase mt-1">Founding Curator, Ingri</p>
          </motion.div>
        </div>
      </section>

      <Footer />

      {/* ══ CART — Desktop: animated sidebar ══ */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="fixed inset-0 z-50 bg-black/25 backdrop-blur-[8px] hidden md:block" onClick={() => setCartOpen(false)} />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 32, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-[420px] bg-[#F5FAFA] shadow-[-8px_0_30px_rgba(0,0,0,0.1)] hidden md:flex flex-col">
              <div className="flex items-center justify-between px-5 py-4 bg-white border-b border-[#D8EDED]">
                <div className="flex items-center gap-3"><ShoppingBag size={18} className="text-[#1A4547]" /><h3 className="font-heading text-base text-[#1a1a1a] font-bold">Your Cart</h3>{cartCount > 0 && <span className="bg-[#1A4547] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{cartCount}</span>}</div>
                <button aria-label="Close cart" onClick={() => setCartOpen(false)} className="w-8 h-8 rounded-full bg-[#EFF7F7] flex items-center justify-center text-[#5E8A8C] hover:bg-[#D8EDED] hover:text-[#1A4547] transition-colors"><X size={16} /></button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {cart.length === 0 ? (
                  <div className="text-center py-20 px-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#EFF7F7] flex items-center justify-center"><ShoppingBag className="text-[#9CB8BA]" size={28} /></div>
                    <p className="font-heading text-sm text-[#1a1a1a] font-semibold mb-1">Your cart is empty</p>
                    <p className="font-body text-xs text-[#7A9A9C] mb-5">Add something delicious to get started</p>
                    <button onClick={() => setCartOpen(false)} className="font-body text-xs text-[#1A4547] font-medium border border-[#D0E8E8] rounded-lg px-5 py-2.5 hover:bg-[#EFF7F7] transition-colors">Continue Shopping</button>
                  </div>
                ) : (
                  <>
                    <div className="px-4 py-3 space-y-2.5">
                      {cart.map(item => (
                        <div key={item._id} className="flex gap-3 p-3 bg-white rounded-xl border border-[#D8EDED] shadow-[0_1px_4px_rgba(35,90,93,0.04)]">
                          <img src={item.image} alt={item.name} className="w-[68px] h-[68px] object-cover rounded-lg flex-shrink-0" />
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div><p className="font-heading text-[13px] text-[#1a1a1a] font-semibold leading-snug line-clamp-2">{item.name}</p><p className="font-body text-xs text-[#7A9A9C] mt-0.5">₹{item.price} each</p></div>
                            <div className="flex items-center justify-between mt-1.5">
                              <div className="flex items-center border border-[#D0E8E8] rounded-lg overflow-hidden">
                                <button aria-label="Decrease quantity" onClick={() => updateQty(item._id, -1)} className="w-7 h-7 flex items-center justify-center text-[#5E8A8C] hover:bg-[#EFF7F7] transition-colors"><Minus size={12} /></button>
                                <span className="font-body text-xs text-[#1a1a1a] w-7 text-center font-semibold">{item.qty}</span>
                                <button aria-label="Increase quantity" onClick={() => updateQty(item._id, 1)} className="w-7 h-7 flex items-center justify-center text-[#5E8A8C] hover:bg-[#EFF7F7] transition-colors"><Plus size={12} /></button>
                              </div>
                              <div className="flex items-center gap-3"><p className="font-heading text-sm text-[#1a1a1a] font-bold">₹{item.price * item.qty}</p><button aria-label="Remove from cart" onClick={() => removeFromCart(item._id)} className="text-[#9CB8BA] hover:text-red-400 transition-colors"><Trash2 size={13} /></button></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {addonProducts.filter(a => !cart.some(c => c._id === a._id)).length > 0 && (
                      <div className="mt-3 border-t border-[#D8EDED] pt-4 pb-2">
                        <div className="px-5 mb-3 flex items-center gap-2"><Plus size={13} className="text-[#1A4547]" /><h4 className="font-heading text-xs tracking-[0.1em] uppercase text-[#5E8A8C] font-bold">You might also like</h4></div>
                        <div className="flex gap-2.5 overflow-x-auto px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                          {addonProducts.filter(a => !cart.some(c => c._id === a._id)).slice(0, 8).map(addon => {
                            const addonPrice = addon.salePrice || addon.price;
                            return (
                              <div key={addon._id} className="min-w-[130px] max-w-[130px] bg-white rounded-xl border border-[#D8EDED] overflow-hidden shadow-[0_1px_4px_rgba(35,90,93,0.04)] flex-shrink-0">
                                <div className="h-[90px] bg-[#EFF7F7] overflow-hidden"><img src={addon.image} alt={addon.name} className="w-full h-full object-cover" /></div>
                                <div className="p-2.5"><p className="font-heading text-[11px] text-[#1a1a1a] font-semibold leading-snug line-clamp-2 mb-1.5">{addon.name}</p><div className="flex items-center justify-between"><span className="font-body text-[11px] text-[#1A4547] font-semibold">₹{addonPrice}</span><button onClick={() => addRelatedToCart(addon)} className="w-6 h-6 rounded-full bg-[#1A4547] text-white flex items-center justify-center hover:bg-[#122E30] transition-colors"><Plus size={12} /></button></div></div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    <div className="mx-4 mt-2 mb-3 p-3 bg-white rounded-xl border border-[#D8EDED]">
                      <p className="font-heading text-xs tracking-[0.08em] uppercase text-[#5E8A8C] font-bold mb-2">Apply Coupon</p>
                      {appliedCoupon ? (
                        <div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-[#1A4547] bg-[#F5EFE7] px-2 py-1 rounded">{appliedCoupon.code}</span>
                              <span className="font-body text-[11px] text-[#5E8A8C]">Applied</span>
                            </div>
                            <button onClick={removeCoupon} className="text-[10px] text-[#7A9A9C] hover:text-red-500 font-medium transition-colors">Remove</button>
                          </div>
                          <p className="font-body text-[11px] text-[#6B8F71] mt-1.5">You save ₹{appliedCoupon.discount} on this order</p>
                        </div>
                      ) : (
                        <>
                          <div className="flex gap-2">
                            <input type="text" placeholder="Enter code" value={couponCode} onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); }} className="flex-1 px-3 py-2 border border-[#D0E8E8] rounded-lg font-body text-xs text-[#1a1a1a] placeholder:text-[#9CB8BA] focus:outline-none focus:border-[#5E9A9C]" onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()} />
                            <button onClick={handleApplyCoupon} disabled={couponLoading || !couponCode.trim()} className="px-4 py-2 rounded-lg font-body text-xs font-medium bg-[#1A4547] text-white hover:bg-[#122E30] transition-colors disabled:opacity-50">{couponLoading ? '...' : 'Apply'}</button>
                          </div>
                          {couponError && <p className="font-body text-[10px] text-red-500 mt-1.5">{couponError}</p>}
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
              {cart.length > 0 && (
                <div className="bg-white border-t border-[#D8EDED] px-5 py-4">
                  <div className="space-y-1.5 mb-4">
                    <div className="flex justify-between font-body text-xs text-[#7A9A9C]"><span>Total MRP</span><span className="text-[#1a1a1a] font-medium">₹{cartMrpTotal}</span></div>
                    {cartDiscount > 0 && <div className="flex justify-between font-body text-xs text-[#7A9A9C]"><span>Discount on MRP</span><span className="text-[#6B8F71] font-medium">-₹{cartDiscount}</span></div>}
                    {couponDiscount > 0 && <div className="flex justify-between font-body text-xs text-[#7A9A9C]"><span>Coupon Discount</span><span className="text-[#6B8F71] font-medium">-₹{couponDiscount}</span></div>}
                    <div className="flex justify-between font-body text-xs text-[#7A9A9C]">
                      <span>Delivery</span>
                      {shippingFee === 0 ? (
                        <span className="text-[#6B8F71] font-medium">Free</span>
                      ) : (
                        <span className="text-[#1a1a1a] font-medium">₹{shippingFee}</span>
                      )}
                    </div>
                    <div className="h-px bg-[#D8EDED] my-1" />
                    <div className="flex justify-between font-heading text-base text-[#1a1a1a] font-bold"><span>Total</span><span>₹{cartFinalTotal}</span></div>
                  </div>
                  <button type="button" onClick={handleBuyNow} className="w-full py-3.5 bg-[#1A4547] text-white font-body text-sm tracking-wide rounded-xl hover:bg-[#122E30] transition-colors shadow-[0_4px_12px_rgba(35,90,93,0.2)]">Proceed to Checkout</button>
                  <button onClick={() => setCartOpen(false)} className="w-full mt-2 py-2 font-body text-xs text-[#5E8A8C] hover:text-[#1A4547] transition-colors">Continue Shopping</button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ══ CART — Mobile: instant full-page ══ */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 bg-[#F5FAFA] md:hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-3.5 bg-white border-b border-[#D8EDED]">
            <button aria-label="Close cart" onClick={() => setCartOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center text-[#5E8A8C]"><ArrowRight size={18} className="rotate-180" /></button>
            <div className="flex items-center gap-2"><h3 className="font-heading text-[15px] text-[#1a1a1a] font-bold">My Cart</h3>{cartCount > 0 && <span className="bg-[#1A4547] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{cartCount}</span>}</div>
            <div className="w-8" />
          </div>
          <div className="flex-1 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="text-center py-24 px-6">
                <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-[#EFF7F7] flex items-center justify-center"><ShoppingBag className="text-[#9CB8BA]" size={32} /></div>
                <p className="font-heading text-base text-[#1a1a1a] font-semibold mb-1">Your cart is empty</p>
                <p className="font-body text-sm text-[#7A9A9C] mb-6">Explore our collection and add items you love</p>
                <button onClick={() => setCartOpen(false)} className="font-body text-sm text-[#1A4547] font-medium border border-[#D0E8E8] rounded-xl px-6 py-3 hover:bg-[#EFF7F7] transition-colors">Start Shopping</button>
              </div>
            ) : (
              <>
                <div className="px-4 pt-4 pb-2 space-y-3">
                  <p className="font-heading text-xs tracking-[0.1em] uppercase text-[#5E8A8C] font-bold px-1">Items in your cart</p>
                  {cart.map(item => (
                    <div key={item._id} className="flex gap-3 p-3 bg-white rounded-2xl border border-[#D8EDED] shadow-[0_1px_4px_rgba(35,90,93,0.04)]">
                      <img src={item.image} alt={item.name} className="w-[72px] h-[72px] object-cover rounded-xl flex-shrink-0" />
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div><p className="font-heading text-[13px] text-[#1a1a1a] font-semibold leading-snug line-clamp-2">{item.name}</p><p className="font-body text-[11px] text-[#7A9A9C] mt-0.5">₹{item.price} each</p></div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-[#D0E8E8] rounded-lg overflow-hidden">
                            <button aria-label="Decrease quantity" onClick={() => updateQty(item._id, -1)} className="w-8 h-8 flex items-center justify-center text-[#5E8A8C] active:bg-[#EFF7F7]"><Minus size={13} /></button>
                            <span className="font-body text-sm text-[#1a1a1a] w-8 text-center font-semibold">{item.qty}</span>
                            <button aria-label="Increase quantity" onClick={() => updateQty(item._id, 1)} className="w-8 h-8 flex items-center justify-center text-[#5E8A8C] active:bg-[#EFF7F7]"><Plus size={13} /></button>
                          </div>
                          <div className="flex items-center gap-3"><p className="font-heading text-[15px] text-[#1a1a1a] font-bold">₹{item.price * item.qty}</p><button aria-label="Remove from cart" onClick={() => removeFromCart(item._id)} className="text-[#9CB8BA] hover:text-red-400 transition-colors"><Trash2 size={14} /></button></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {addonProducts.filter(a => !cart.some(c => c._id === a._id)).length > 0 && (
                  <div className="mt-4 border-t border-[#D8EDED] pt-4 pb-2">
                    <div className="px-5 mb-3 flex items-center gap-2"><Plus size={14} className="text-[#1A4547]" /><h4 className="font-heading text-xs tracking-[0.1em] uppercase text-[#5E8A8C] font-bold">You might also like</h4></div>
                    <div className="flex gap-3 overflow-x-auto px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                      {addonProducts.filter(a => !cart.some(c => c._id === a._id)).slice(0, 8).map(addon => {
                        const addonPrice = addon.salePrice || addon.price;
                        return (
                          <div key={addon._id} className="min-w-[140px] max-w-[140px] bg-white rounded-2xl border border-[#D8EDED] overflow-hidden shadow-[0_1px_4px_rgba(35,90,93,0.04)] flex-shrink-0">
                            <div className="h-[100px] bg-[#EFF7F7] overflow-hidden"><img src={addon.image} alt={addon.name} className="w-full h-full object-cover" /></div>
                            <div className="p-2.5"><p className="font-heading text-[11px] text-[#1a1a1a] font-semibold leading-snug line-clamp-2 mb-2">{addon.name}</p><div className="flex items-center justify-between"><span className="font-body text-[12px] text-[#1A4547] font-semibold">₹{addonPrice}</span><button onClick={() => addRelatedToCart(addon)} className="w-7 h-7 rounded-full bg-[#1A4547] text-white flex items-center justify-center active:bg-[#122E30]"><Plus size={13} /></button></div></div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                <div className="mx-4 mt-3 p-4 bg-white rounded-2xl border border-[#D8EDED]">
                  <p className="font-heading text-xs tracking-[0.08em] uppercase text-[#5E8A8C] font-bold mb-2.5">Apply Coupon</p>
                  {appliedCoupon ? (
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-[#1A4547] bg-[#F5EFE7] px-2.5 py-1 rounded-lg">{appliedCoupon.code}</span>
                          <span className="font-body text-xs text-[#5E8A8C]">Applied</span>
                        </div>
                        <button onClick={removeCoupon} className="text-xs text-[#7A9A9C] hover:text-red-500 font-medium transition-colors">Remove</button>
                      </div>
                      <p className="font-body text-xs text-[#6B8F71] mt-2">You save ₹{appliedCoupon.discount} on this order</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex gap-2">
                        <input type="text" placeholder="Enter coupon code" value={couponCode} onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); }} className="flex-1 px-3.5 py-2.5 border border-[#D0E8E8] rounded-xl font-body text-sm text-[#1a1a1a] placeholder:text-[#9CB8BA] focus:outline-none focus:border-[#5E9A9C]" onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()} />
                        <button onClick={handleApplyCoupon} disabled={couponLoading || !couponCode.trim()} className="px-5 py-2.5 rounded-xl font-body text-sm font-medium bg-[#1A4547] text-white active:bg-[#122E30] transition-colors disabled:opacity-50">{couponLoading ? '...' : 'Apply'}</button>
                      </div>
                      {couponError && <p className="font-body text-xs text-red-500 mt-1.5">{couponError}</p>}
                    </>
                  )}
                </div>
                <div className="mx-4 mt-3 mb-4 p-4 bg-white rounded-2xl border border-[#D8EDED]">
                  <p className="font-heading text-xs tracking-[0.08em] uppercase text-[#5E8A8C] font-bold mb-3">Price Details</p>
                  <div className="space-y-2.5">
                    <div className="flex justify-between font-body text-sm text-[#666]"><span>Total MRP ({cartCount} items)</span><span className="text-[#1a1a1a]">₹{cartMrpTotal}</span></div>
                    {cartDiscount > 0 && <div className="flex justify-between font-body text-sm text-[#666]"><span>Discount on MRP</span><span className="text-[#6B8F71] font-medium">-₹{cartDiscount}</span></div>}
                    {couponDiscount > 0 && <div className="flex justify-between font-body text-sm text-[#666]"><span>Coupon Discount</span><span className="text-[#6B8F71] font-medium">-₹{couponDiscount}</span></div>}
                    <div className="flex justify-between font-body text-sm text-[#666]">
                      <span>Delivery</span>
                      {shippingFee === 0 ? (
                        <span className="text-[#6B8F71] font-medium">Free</span>
                      ) : (
                        <span className="text-[#1a1a1a] font-medium">₹{shippingFee}</span>
                      )}
                    </div>
                    <div className="h-px bg-[#D8EDED]" />
                    <div className="flex justify-between font-heading text-base text-[#1a1a1a] font-bold"><span>Total Amount</span><span>₹{cartFinalTotal}</span></div>
                  </div>
                </div>
              </>
            )}
          </div>
          {cart.length > 0 && (
            <div className="bg-white border-t border-[#D8EDED] px-4 py-4">
              <div className="flex items-center justify-between">
                <div><p className="font-body text-[11px] text-[#7A9A9C]">Total Amount</p><p className="font-heading text-lg text-[#1a1a1a] font-bold">₹{cartFinalTotal}</p></div>
                <button type="button" onClick={handleBuyNow} className="px-8 py-3.5 bg-[#1A4547] text-white font-body text-sm font-medium tracking-wide rounded-xl active:bg-[#122E30] shadow-[0_4px_12px_rgba(35,90,93,0.25)]">Checkout</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
