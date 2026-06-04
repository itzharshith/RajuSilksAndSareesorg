import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { ArrowRight, Sparkles, Quote, Award, ShieldCheck, HeartHandshake } from 'lucide-react';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        // Fetch Categories
        const catRes = await api.get('/api/categories');
        setCategories(catRes.data);

        // Fetch Featured Products
        const featRes = await api.get('/api/products?featured=true&limit=4');
        setFeaturedProducts(featRes.data.products);

        // Fetch New Arrivals (sorted by date, default in backend controller)
        const newRes = await api.get('/api/products?limit=4');
        setNewArrivals(newRes.data.products);
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
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-blue"></div>
      </div>
    );
  }

  return (
    <div className="bg-brand-cream min-h-screen pb-16 font-sans">
      
      {/* 1. Hero Luxury Banner */}
      <section className="relative bg-gradient-to-r from-brand-blue-deep via-brand-blue to-brand-blue-dark text-white overflow-hidden border-b border-brand-creamText/30">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center space-x-1.5 bg-brand-creamText/10 border border-brand-creamText/30 px-3 py-1 rounded-full text-brand-creamText text-xs tracking-widest uppercase mb-6 animate-pulse">
            <Sparkles size={12} />
            <span>Master Weavers of Heritage Silks</span>
          </div>
          
          <h1 className="font-serif font-bold text-4xl sm:text-6xl lg:text-7xl text-brand-cream tracking-wide leading-tight max-w-4xl">
            Where Every Thread Tells a <span className="text-brand-creamText">Royal Story</span>
          </h1>
          
          <p className="mt-6 text-sm sm:text-base text-brand-cream/80 max-w-2xl font-sans tracking-wide leading-relaxed">
            Discover a curated universe of authentic handloom silk sarees, crafted with absolute purity and generations of weaver heritage. Bring home the eternal glow of traditional weave art.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Link
              to="/shop"
              className="bg-brand-creamText hover:bg-brand-creamText-glow text-brand-blue-deep font-sans font-semibold tracking-wider text-xs px-8 py-3.5 rounded-full shadow-lg hover:shadow-gold-glow transition-all duration-200"
            >
              EXPLORE COLLECTIONS
            </Link>
            <Link
              to="/shop?category=Kanjeevaram%20Silks"
              className="bg-transparent hover:bg-brand-creamText/10 text-brand-creamText font-sans font-semibold border border-brand-creamText/50 hover:border-brand-creamText text-xs px-8 py-3.5 rounded-full transition-all duration-200"
            >
              KANJEEVARAM EXCLUSIVES
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Shop By Category */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className="font-serif font-bold text-2xl sm:text-3xl text-brand-blue-deep tracking-wider">
            Shop By Heritage Category
          </h2>
          <div className="h-0.5 w-24 bg-brand-creamText mx-auto mt-2"></div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6 justify-center">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/shop?category=${encodeURIComponent(cat.name)}`}
              className="group bg-white rounded-xl border border-brand-creamText/15 p-4 flex flex-col items-center text-center shadow-luxury hover:border-brand-creamText transition-all duration-300"
            >
              <div className="h-16 w-16 rounded-full bg-brand-blue-deep/10 border border-brand-creamText/25 flex items-center justify-center mb-3 group-hover:bg-brand-blue group-hover:text-brand-creamText text-brand-blue transition-all duration-300">
                <span className="font-serif font-bold text-lg">{cat.name[0]}</span>
              </div>
              <span className="font-serif font-bold text-xs sm:text-sm text-brand-blue-deep line-clamp-1 group-hover:text-brand-creamText transition-colors">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="border-t border-brand-creamText/15 bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="font-serif font-bold text-2xl sm:text-3xl text-brand-blue-deep tracking-wider">
                  Featured Masterpieces
                </h2>
                <p className="text-xs text-gray-500 mt-1">Exquisite signature selections from our looms</p>
              </div>
              <Link
                to="/shop?featured=true"
                className="flex items-center space-x-1.5 text-brand-blue hover:text-brand-creamText font-sans font-semibold text-xs tracking-wider transition-colors"
              >
                <span>VIEW ALL</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts.map((prod) => (
                <ProductCard key={prod._id} product={prod} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. Luxury Image Mid-Banner */}
      <section className="bg-brand-blue-deep border-y border-brand-creamText/30 text-white py-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <span className="font-serif italic text-brand-creamText text-lg tracking-widest block mb-2">~ Traditional Weaving Inheritance ~</span>
          <p className="font-serif font-bold text-xl sm:text-2xl text-brand-cream max-w-2xl mx-auto leading-relaxed italic">
            "A saree is not just an attire. It is a canvas of heritage, woven with threads of nostalgia, gold, and absolute pride."
          </p>
          <div className="h-px w-16 bg-brand-creamText/40 mx-auto mt-4"></div>
        </div>
      </section>

      {/* 5. New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="font-serif font-bold text-2xl sm:text-3xl text-brand-blue-deep tracking-wider">
                Fresh From the Looms
              </h2>
              <p className="text-xs text-gray-500 mt-1">Our latest creations freshly listed for you</p>
            </div>
            <Link
              to="/shop"
              className="flex items-center space-x-1.5 text-brand-blue hover:text-brand-creamText font-sans font-semibold text-xs tracking-wider transition-colors"
            >
              <span>VIEW ALL</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {newArrivals.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        </section>
      )}

      {/* 6. Brand Assurances */}
      <section className="bg-white border-t border-brand-creamText/15 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-start space-x-4">
            <div className="bg-brand-cream p-3 rounded-lg text-brand-blue border border-brand-creamText/20">
              <Award size={24} />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-brand-blue-deep">Silk Mark Certified</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">Each pure silk saree is accompanied by a certificate and holographic identification marking to assure its pure composition.</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="bg-brand-cream p-3 rounded-lg text-brand-blue border border-brand-creamText/20">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-brand-blue-deep">Secure Razorpay Gateway</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">Enjoy smooth payments through secure tokenised mock systems. Rest easy knowing transactions are handled safely.</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="bg-brand-cream p-3 rounded-lg text-brand-blue border border-brand-creamText/20">
              <HeartHandshake size={24} />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-brand-blue-deep">Support Weaving Communities</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">By buying from Raju Silks, you contribute directly to supporting traditional handloom artisans and preserving their ancestral skills.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-brand-creamText/15">
        <div className="text-center mb-12">
          <h2 className="font-serif font-bold text-2xl sm:text-3xl text-brand-blue-deep tracking-wider">
            Voices of Patronage
          </h2>
          <div className="h-0.5 w-24 bg-brand-creamText mx-auto mt-2"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div key={idx} className="bg-white border border-brand-creamText/15 p-6 rounded-lg shadow-luxury relative flex flex-col justify-between">
              <Quote className="absolute top-4 right-4 text-brand-cream-dark h-8 w-8 -z-0 opacity-40" />
              <p className="text-xs text-gray-600 leading-relaxed italic relative z-10 font-sans mb-4">
                "{t.quote}"
              </p>
              <div className="border-t border-brand-cream-dark pt-3">
                <p className="text-xs font-serif font-bold text-brand-blue-deep">{t.name}</p>
                <p className="text-[10px] text-gray-400 font-sans">{t.city}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default Home;
