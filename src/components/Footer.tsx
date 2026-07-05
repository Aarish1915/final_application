import { Instagram, Facebook, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";

const shopLinks = [
  { label: "All Products", path: "/products" },
  { label: "Gifting", path: "/gifting" },
  { label: "Horeca", path: "/b2b" },
  { label: "Best Sellers", path: "/products?sort=rating" },
  { label: "New Arrivals", path: "/products?sort=newest" },
];

const supportLinks = [
  { label: "FAQs", path: "/contact" },
  { label: "Contact Us", path: "/contact" },
  { label: "Shipping & Delivery", path: "/shipping-policy" },
  { label: "Refund & Cancellation", path: "/refund-policy" },
  { label: "Order Tracking", path: "/track-order" },
];

export default function Footer() {
  return (
    <footer className="bg-[#EFF7F7] border-t border-[#C8E0E0]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Brand */}
          <div className="col-span-2 md:col-span-2 lg:col-span-1">
            <Link to="/" className="inline-block mb-2">
              <img
                src="/ingri-green-logo.png"
                alt="Ingri"
                className="h-12 w-auto object-contain"
              />
            </Link>
            <p className="font-body text-sm text-[#1A4547]/60 leading-relaxed">
              Ingri is a chef-led food and hospitality brand built on ingredient-led cooking, disciplined systems, and scalable product innovation.
            </p>
            {/* Social icons */}
            <div className="flex gap-4 mt-3">
              <a href="https://www.instagram.com/ingriatmuseo/?hl=en" target="_blank" rel="noopener noreferrer" className="text-[#1A4547]/40 hover:text-[#1A4547] transition-colors">
                <Instagram size={18} />
              </a>
              <a href="#" className="text-[#1A4547]/40 hover:text-[#1A4547] transition-colors">
                <Facebook size={18} />
              </a>
              <a href="#" className="text-[#1A4547]/40 hover:text-[#1A4547] transition-colors">
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-heading text-sm font-semibold tracking-[0.15em] text-[#1A4547] mb-2.5">SHOP</h4>
            <ul className="space-y-1.5">
              {shopLinks.map((l) => (
                <li key={l.label}>
                  <Link to={l.path} className="font-body text-sm text-[#1A4547]/50 hover:text-[#1A4547] transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-heading text-sm font-semibold tracking-[0.15em] text-[#1A4547] mb-2.5">SUPPORT</h4>
            <ul className="space-y-1.5">
              {supportLinks.map((l) => (
                <li key={l.label}>
                  <Link to={l.path} className="font-body text-sm text-[#1A4547]/50 hover:text-[#1A4547] transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Address */}
          <div className="col-span-2 lg:col-span-1">
            <h4 className="font-heading text-sm font-semibold tracking-[0.15em] text-[#1A4547] mb-2.5">ADDRESS</h4>
            <p className="font-body text-sm font-medium text-[#1A4547]/70 mb-1">
              Jatiyan Foods Private Limited
            </p>
            <p className="font-body text-sm text-[#1A4547]/50 leading-relaxed">
              Plot no. 39, Udyog Vihar Phase 1, Dundahera Village, Sector 20, Gurugram, Haryana, 122016
            </p>
            <a
              href="https://maps.app.goo.gl/BGPMMg6ryqHS2WqCA"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block font-body text-sm text-[#1A4547]/60 hover:text-[#1A4547] underline mt-2"
            >
              View on Google Maps
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#C8E0E0]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-3 flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="font-body text-xs text-[#1A4547]/40">
            © 2026 INGRI. All rights reserved. | FSSAI Lic. No. 10820005000706
          </p>
          <div className="flex gap-6">
            <Link to="/privacy-policy" className="font-body text-xs text-[#1A4547]/40 hover:text-[#1A4547] transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="font-body text-xs text-[#1A4547]/40 hover:text-[#1A4547] transition-colors">Terms & Conditions</Link>
            <Link to="/refund-policy" className="font-body text-xs text-[#1A4547]/40 hover:text-[#1A4547] transition-colors">Refund Policy</Link>
            <Link to="/shipping-policy" className="font-body text-xs text-[#1A4547]/40 hover:text-[#1A4547] transition-colors">Shipping Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
