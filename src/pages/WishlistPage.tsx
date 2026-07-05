import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Heart, ShoppingBag, Trash2, Star, ArrowRight } from 'lucide-react';

type Product = {
  _id: string;
  name: string;
  category: string;
  price: number;
  salePrice?: number;
  mrp?: number;
  image: string;
  rating: number;
  description?: string;
  reviews?: number;
};

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<Product[]>([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('wishlist') || '[]');
    setWishlist(saved);
  }, []);

  const removeFromWishlist = (productId: string) => {
    const updated = wishlist.filter(item => item._id !== productId);
    localStorage.setItem('wishlist', JSON.stringify(updated));
    setWishlist(updated);
  };

  const clearWishlist = () => {
    localStorage.setItem('wishlist', JSON.stringify([]));
    setWishlist([]);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Header */}
      <section className="border-b border-[#D8EDED]/60" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F5FAFA 40%, #EFF7F7 100%)' }}>
        <div className="max-w-6xl mx-auto px-4 lg:px-8 pt-10 pb-8 md:pt-14 md:pb-10">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 mb-3">
              <Heart size={14} className="text-red-400 fill-red-400" />
              <span className="font-body text-[11px] tracking-[0.2em] uppercase text-[#8AACAE]">Your Favorites</span>
            </div>
            <h1 className="font-heading text-2xl md:text-4xl text-[#1a1a1a] font-bold mb-2">My Wishlist</h1>
            <p className="font-body text-sm text-[#7A9A9C]">
              {wishlist.length > 0
                ? `${wishlist.length} item${wishlist.length > 1 ? 's' : ''} saved for later`
                : 'Start adding your favorite products'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8 md:py-12">
        {wishlist.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-[#EFF7F7] flex items-center justify-center">
              <Heart className="text-[#9CB8BA]" size={36} />
            </div>
            <h2 className="font-heading text-lg text-[#1a1a1a] font-semibold mb-2">Your wishlist is empty</h2>
            <p className="font-body text-sm text-[#7A9A9C] mb-6 max-w-sm mx-auto">
              Browse our products and tap the heart icon to save items you love
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1A4547] text-white font-body text-sm hover:bg-[#122E30] transition-colors"
            >
              Browse Products <ArrowRight size={16} />
            </Link>
          </motion.div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-base md:text-lg text-[#1a1a1a] font-bold">
                {wishlist.length} Item{wishlist.length > 1 ? 's' : ''}
              </h2>
              <button
                onClick={clearWishlist}
                className="font-body text-xs text-[#7A9A9C] hover:text-red-500 transition-colors"
              >
                Clear All
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
              {wishlist.map((product, i) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                  className="group rounded-md overflow-hidden border border-[#EAEAEA] bg-white hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300"
                >
                  {/* Image */}
                  <Link to={`/products/${product._id}`} className="block relative h-[155px] sm:h-[220px] lg:h-[260px] overflow-hidden bg-[#F8F7F4]">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-2 left-2 sm:top-3 sm:left-3 font-body text-[9px] sm:text-[10px] tracking-[0.15em] uppercase bg-white/90 backdrop-blur-sm text-[#5E8A8C] px-2 py-1 rounded-sm">
                      {product.category}
                    </span>
                    <button
                      onClick={(e) => { e.preventDefault(); removeFromWishlist(product._id); }}
                      className="absolute top-2 right-2 sm:top-3 sm:right-3 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-red-50 transition-colors"
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 size={13} className="text-red-400" />
                    </button>
                  </Link>

                  {/* Details */}
                  <div className="p-2.5 sm:p-4">
                    <div className="flex items-center gap-1 mb-1.5">
                      <Star size={11} className="fill-[#F5A623] text-[#F5A623]" />
                      <span className="font-body text-[11px] text-[#1a1a1a]">{product.rating}</span>
                      <span className="hidden sm:inline font-body text-[11px] text-[#CCC]">({product.reviews || 0})</span>
                    </div>
                    <Link to={`/products/${product._id}`}>
                      <h3 className="font-heading text-[12px] sm:text-[14px] text-[#1a1a1a] font-semibold leading-snug mb-2 line-clamp-2 group-hover:text-[#1A4547] transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <span className="font-body text-[13px] sm:text-base text-[#1a1a1a] font-medium">₹{(product.salePrice || product.price).toFixed(2)}</span>
                        {(product.mrp || 0) > (product.salePrice || product.price) && (
                          <span className="ml-1.5 font-body text-[10px] sm:text-xs text-[#999] line-through">₹{product.mrp}</span>
                        )}
                      </div>
                      <Link
                        to={`/products/${product._id}`}
                        className="px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-sm bg-[#1a1a1a] text-white font-body text-[11px] sm:text-xs tracking-wide hover:bg-[#1A4547] transition-colors flex items-center gap-1"
                      >
                        <ShoppingBag size={12} /> <span className="hidden sm:inline">View</span>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
