'use client';
import Link from 'next/link';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="glass-dark text-brand-cream border-t border-white/10">

      {/* Top Banner (Value Propositions) */}
      <div className="border-b border-white/10 py-8 bg-white/[0.03]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="flex flex-col items-center">
            <span className="text-brand-cream-text font-serif font-bold text-lg mb-1">Authentic Handlooms</span>
            <p className="text-xs text-brand-cream/60 max-w-xs">Sourced directly from weavers in Kanchipuram, Banaras, and Gadwal.</p>
          </div>
          <div className="flex flex-col items-center border-y md:border-y-0 md:border-x border-white/10 py-4 md:py-0">
            <span className="text-brand-cream-text font-serif font-bold text-lg mb-1">Silk Mark Assurance</span>
            <p className="text-xs text-brand-cream/60 max-w-xs">100% Pure silk sarees with genuine purity certification markings.</p>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-brand-cream-text font-serif font-bold text-lg mb-1">Master Craftsmanship</span>
            <p className="text-xs text-brand-cream/60 max-w-xs">Intricate designs carrying generations of traditional weaver heritage.</p>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">

        {/* Brand Column */}
        <div className="space-y-4">
          <div className="flex flex-col">
            <span className="font-serif font-bold text-lg text-brand-cream-text tracking-widest">
              RAJU SILKS &amp; SAREES
            </span>
            <span className="text-[10px] text-brand-cream/70 tracking-wider font-sans -mt-1 uppercase">
              Ethnic Master Weavers
            </span>
          </div>
          <p className="text-xs text-brand-cream/60 leading-relaxed font-sans">
            Draping generations in luxury since 1978. We showcase the pinnacle of ethnic Indian weave arts, handcrafting custom silks of unrivaled luxury and detail.
          </p>
          <div className="pt-2 flex items-center space-x-1 text-xs text-brand-cream-text bg-white/10 py-1.5 px-3 rounded border border-white/15 w-fit">
            <span>Verified Silk Mark Certified Store</span>
          </div>
        </div>

        {/* Categories Quick Links */}
        <div>
          <h4 className="font-serif font-bold text-sm text-brand-cream-text tracking-wider uppercase mb-4">
            Collections
          </h4>
          <ul className="space-y-2 text-xs text-brand-cream/75">
            <li><Link href="/shop?category=Kanjeevaram%20Silks" className="hover:text-brand-cream-text hover:underline transition-all">Kanjeevaram Silks</Link></li>
            <li><Link href="/shop?category=Pure%20Silks" className="hover:text-brand-cream-text hover:underline transition-all">Pure Silks</Link></li>
            <li><Link href="/shop?category=Bridal%20Collection" className="hover:text-brand-cream-text hover:underline transition-all">Bridal Collection</Link></li>
            <li><Link href="/shop?category=Soft%20Silks" className="hover:text-brand-cream-text hover:underline transition-all">Soft Silks</Link></li>
            <li><Link href="/shop?category=Banaras%20Sarees" className="hover:text-brand-cream-text hover:underline transition-all">Banaras Sarees</Link></li>
          </ul>
        </div>

        {/* Customer Support & Policies */}
        <div>
          <h4 className="font-serif font-bold text-sm text-brand-cream-text tracking-wider uppercase mb-4">
            Customer Corner
          </h4>
          <ul className="space-y-2 text-xs text-brand-cream/75">
            <li><Link href="/about" className="hover:text-brand-cream-text hover:underline transition-all">About Us</Link></li>
            <li><Link href="/contact" className="hover:text-brand-cream-text hover:underline transition-all">Contact Us</Link></li>
            <li><Link href="/terms" className="hover:text-brand-cream-text hover:underline transition-all">Terms &amp; Conditions</Link></li>
            <li><Link href="/privacy" className="hover:text-brand-cream-text hover:underline transition-all">Privacy Policy</Link></li>
            <li><Link href="/refund-policy" className="hover:text-brand-cream-text hover:underline transition-all">Refund &amp; Cancellation Policy</Link></li>
            <li><Link href="/shipping-policy" className="hover:text-brand-cream-text hover:underline transition-all">Shipping &amp; Delivery Policy</Link></li>
          </ul>
        </div>

        {/* Address and Contact info */}
        <div>
          <h4 className="font-serif font-bold text-sm text-brand-cream-text tracking-wider uppercase mb-4">
            Store Information
          </h4>
          <ul className="space-y-3 text-xs text-brand-cream/75">
            <li className="flex items-start space-x-2">
              <MapPin size={16} className="text-brand-cream-text shrink-0 mt-0.5" />
              <span>BK 114, Shivam Rd, Sai Baba Colony, Bagh Amberpet, New Nallakunta, Hyderabad, Telangana 500044</span>
            </li>
            <li className="flex items-center space-x-2">
              <Phone size={16} className="text-brand-cream-text shrink-0" />
              <span>+91 98492 92252</span>
            </li>
            <li className="flex items-center space-x-2">
              <Mail size={16} className="text-brand-cream-text shrink-0" />
              <span>raj.hanumanslk@gmail.com</span>
            </li>
            <li className="flex items-start space-x-2">
              <Clock size={16} className="text-brand-cream-text shrink-0 mt-0.5" />
              <span>Mon - Sun: 11:00 AM to 8:00 PM</span>
            </li>
          </ul>
        </div>

      </div>

      {/* Copyright Bar */}
      <div className="py-6 border-t border-white/10 text-center text-xs text-brand-cream/40 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Raju Silks &amp; Sarees. All Rights Reserved.</p>
          <p className="flex items-center space-x-1.5">
            <span>Secure payments powered by mock architecture</span>
            <span className="text-brand-cream-text font-semibold">Razorpay-ready</span>
          </p>
        </div>
      </div>

    </footer>
  );
}
