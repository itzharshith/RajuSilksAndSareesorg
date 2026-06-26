'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { ArrowRight, Sparkles, Quote, Award, ShieldCheck, HeartHandshake } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  discount?: number;
  rating?: number;
  numReviews?: number;
  images?: string[];
  category?: {
    _id: string;
    name: string;
  };
}

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        // Fetch Categories
        const catRes = await fetch('/api/categories');
        if (catRes.ok) {
          const catData = await catRes.json();
          if (Array.isArray(catData)) {
            setCategories(catData);
          }
        }

        // Fetch Featured Products
        const featRes = await fetch('/api/products?featured=true&limit=4');
        if (featRes.ok) {
          const featData = await featRes.json();
          if (featData && Array.isArray(featData.products)) {
            setFeaturedProducts(featData.products);
          }
        }

        // Fetch New Arrivals
        const newRes = await fetch('/api/products?limit=4');
        if (newRes.ok) {
          const newData = await newRes.json();
          if (newData && Array.isArray(newData.products)) {
            setNewArrivals(newData.products);
          }
        }
      } catch (err) {
        console.error('Error fetching homepage details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const testimonials = [
    {
      name: "Radhika K. Pillai",
      city: "Bangalore",
      quote: "The bridal Kanjeevaram Saree I purchased for my daughter was a piece of art. The weight of the silk, the gold zari work, and the richness of the maroon were exactly as described. Outstanding customer care!"
    },
    {
      name: "Sowmya Narasimhan",
      city: "Chennai",
      quote: "Raju Silks has the best Soft Silks collection. The fabric is light as air and the color combinations are very unique. They have earned a lifetime customer."
    },
    {
      name: "Anjali Mukherji",
      city: "Hyderabad",
      quote: "Stunning Banarasi saree! I wore it for a family wedding and received endless compliments. The mock payment process and shipping tracking worked flawlessly."
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-cream-text"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16 font-sans">
      
      {/* 1. Hero Luxury Banner */}
      <section className="relative glass-dark text-white overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:16px_16px]"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-28 relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center space-x-1.5 bg-brand-cream-text/10 border border-brand-cream-text/30 px-3 py-1 rounded-full text-brand-cream-text text-xs tracking-widest uppercase mb-6 animate-pulse">
            <Sparkles size={12} />
            <span>Master Weavers of Heritage Silks</span>
          </div>
          
          <h1 className="font-serif font-bold text-2xl sm:text-6xl lg:text-7xl text-brand-cream tracking-wide leading-tight max-w-4xl">
            Where Every Thread Tells a <span className="text-brand-cream-text">Royal Story</span>
          </h1>
          
          <p className="mt-4 sm:mt-6 text-xs sm:text-base text-brand-cream/80 max-w-2xl font-sans tracking-wide leading-relaxed">
            Discover a curated universe of authentic handloom silk sarees, crafted with absolute purity and generations of weaver heritage. Bring home the eternal glow of traditional weave art.
          </p>
          
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-center w-full max-w-[280px] sm:max-w-none">
            <Link
              href="/shop"
              className="bg-brand-cream-text hover:bg-white text-brand-blue-deep font-sans font-semibold tracking-wider text-xs px-8 py-3.5 rounded-full shadow-lg hover:shadow-2xl transition-all duration-200 w-full sm:w-auto text-center"
            >
              EXPLORE COLLECTIONS
            </Link>
            <Link
              href="/shop?category=Kanjeevaram%20Silks"
              className="hidden sm:inline-block bg-transparent hover:bg-brand-cream-text/10 text-brand-cream-text font-sans font-semibold border border-brand-cream-text/50 hover:border-brand-cream-text text-xs px-8 py-3.5 rounded-full transition-all duration-200"
            >
              KANJEEVARAM EXCLUSIVES
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Shop By Category */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center mb-8">
          <h2 className="font-serif font-bold text-xl sm:text-3xl text-brand-cream-text tracking-wider">
            Shop By Heritage Category
          </h2>
          <div className="h-0.5 w-16 sm:w-24 bg-brand-cream-text mx-auto mt-2"></div>
        </div>

        {/* Mobile horizontal category scroller - elegant pills */}
        <div className="flex lg:hidden overflow-x-auto gap-3 pb-4 px-2 snap-x snap-mandatory no-scrollbar">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              href={`/shop?category=${encodeURIComponent(cat.name)}`}
              className="snap-start shrink-0 flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 px-4 py-3 min-h-[44px] shadow-sm active:border-brand-gold transition-colors whitespace-nowrap touch-manipulation"
            >
              <span className="inline-block h-2 w-2 rounded-full bg-brand-gold animate-pulse"></span>
              <span className="font-sans font-bold text-[10px] text-brand-cream-text tracking-wider uppercase">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>

        {/* Desktop grid layout */}
        <div className="hidden lg:grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6 justify-center">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              href={`/shop?category=${encodeURIComponent(cat.name)}`}
              className="group glass-card rounded-xl p-4 flex flex-col items-center text-center shadow-luxury hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="h-16 w-16 rounded-full bg-brand-blue/20 border border-brand-cream-text/25 flex items-center justify-center mb-3 group-hover:bg-brand-blue group-hover:text-brand-cream-text text-brand-blue transition-all duration-300">
                <span className="font-serif font-bold text-lg">{cat.name[0]}</span>
              </div>
              <span className="font-serif font-bold text-xs sm:text-sm text-brand-blue-deep line-clamp-1 group-hover:text-brand-cream-text transition-colors">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="border-t border-white/10 py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-serif font-bold text-xl sm:text-3xl text-brand-cream-text tracking-wider">
                  Featured Masterpieces
                </h2>
                <p className="text-[10px] sm:text-xs text-brand-cream/60 mt-1">Exquisite signature selections from our looms</p>
              </div>
              <Link
                href="/shop?featured=true"
                className="flex items-center space-x-1 text-brand-cream-text hover:text-white font-sans font-semibold text-[10px] sm:text-xs tracking-wider transition-colors"
              >
                <span>VIEW ALL</span>
                <ArrowRight size={12} className="sm:w-[14px] sm:h-[14px]" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {featuredProducts.map((prod) => (
                <ProductCard key={prod._id} product={prod} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. Luxury Image Mid-Banner */}
      <section className="glass-dark border-y border-white/10 text-white py-10 sm:py-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <span className="font-serif italic text-brand-cream-text text-sm sm:text-lg tracking-widest block mb-2">~ Traditional Weaving Inheritance ~</span>
          <p className="font-serif font-bold text-base sm:text-2xl text-brand-cream max-w-2xl mx-auto leading-relaxed italic">
            "A saree is not just an attire. It is a canvas of heritage, woven with threads of nostalgia, gold, and absolute pride."
          </p>
          <div className="h-px w-16 bg-brand-cream-text/40 mx-auto mt-4"></div>
        </div>
      </section>

      {/* 5. New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-serif font-bold text-xl sm:text-3xl text-brand-cream-text tracking-wider">
                Fresh From the Looms
              </h2>
              <p className="text-[10px] sm:text-xs text-brand-cream/60 mt-1">Our latest creations freshly listed for you</p>
            </div>
            <Link
              href="/shop"
              className="flex items-center space-x-1 text-brand-cream-text hover:text-white font-sans font-semibold text-[10px] sm:text-xs tracking-wider transition-colors"
            >
              <span>VIEW ALL</span>
              <ArrowRight size={12} className="sm:w-[14px] sm:h-[14px]" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {newArrivals.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        </section>
      )}

      {/* 6. Brand Assurances */}
      <section className="border-t border-white/10 py-12 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <div className="glass-card flex items-start space-x-4 p-5 rounded-xl shadow-luxury">
            <div className="bg-brand-blue/30 p-3 rounded-lg text-brand-cream-text border border-white/20 shrink-0">
              <Award size={24} />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm sm:text-base text-brand-blue-deep">Silk Mark Certified</h3>
              <p className="text-[11px] sm:text-xs text-gray-500 mt-1 leading-relaxed">Each pure silk saree is accompanied by a certificate and holographic identification marking to assure its pure composition.</p>
            </div>
          </div>
          <div className="glass-card flex items-start space-x-4 p-5 rounded-xl shadow-luxury">
            <div className="bg-brand-blue/30 p-3 rounded-lg text-brand-cream-text border border-white/20 shrink-0">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm sm:text-base text-brand-blue-deep">Secure Razorpay Gateway</h3>
              <p className="text-[11px] sm:text-xs text-gray-500 mt-1 leading-relaxed">Enjoy smooth payments through secure tokenised mock systems. Rest easy knowing transactions are handled safely.</p>
            </div>
          </div>
          <div className="glass-card flex items-start space-x-4 p-5 rounded-xl shadow-luxury">
            <div className="bg-brand-blue/30 p-3 rounded-lg text-brand-cream-text border border-white/20 shrink-0">
              <HeartHandshake size={24} />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm sm:text-base text-brand-blue-deep">Support Weaving Communities</h3>
              <p className="text-[11px] sm:text-xs text-gray-500 mt-1 leading-relaxed">By buying from Raju Silks, you contribute directly to supporting traditional handloom artisans and preserving their ancestral skills.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 border-t border-white/10">
        <div className="text-center mb-10">
          <h2 className="font-serif font-bold text-xl sm:text-3xl text-brand-cream-text tracking-wider">
            Voices of Patronage
          </h2>
          <div className="h-0.5 w-16 sm:w-24 bg-brand-cream-text mx-auto mt-2"></div>
        </div>

        {/* Mobile-first horizontal scroll snap carousel / Desktop grid */}
        <div className="flex md:grid md:grid-cols-3 overflow-x-auto md:overflow-x-visible gap-4 md:gap-6 pb-6 md:pb-0 px-2 md:px-0 snap-x snap-mandatory no-scrollbar">
          {testimonials.map((t, idx) => (
            <div key={idx} className="snap-start shrink-0 w-[290px] md:w-auto glass-card p-5 sm:p-6 rounded-lg shadow-luxury relative flex flex-col justify-between">
              <Quote className="absolute top-4 right-4 text-brand-cream-dark h-8 w-8 -z-0 opacity-40" />
              <p className="text-xs text-gray-600 leading-relaxed italic relative z-10 font-sans mb-4 min-h-[90px] md:min-h-0">
                "{t.quote}"
              </p>
              <div className="border-t border-brand-cream-text/20 pt-3">
                <p className="text-xs font-serif font-bold text-brand-blue-deep">{t.name}</p>
                <p className="text-[10px] text-gray-400 font-sans">{t.city}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
