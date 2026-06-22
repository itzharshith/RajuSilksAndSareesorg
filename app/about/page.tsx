import React from 'react';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 animate-fade-in font-sans leading-relaxed text-gray-700">
      <div className="text-center mb-12">
        <h1 className="font-serif font-bold text-4xl text-brand-blue tracking-wide mb-2 uppercase">About Us</h1>
        <div className="h-0.5 w-24 bg-brand-cream-text mx-auto mb-6"></div>
      </div>

      <div className="space-y-8 bg-white border border-gray-200 p-8 md:p-12 rounded-xl shadow-luxury">
        <section className="space-y-4">
          <h2 className="font-serif font-semibold text-2xl text-brand-blue uppercase">Our Heritage</h2>
          <p>
            Established in 1985 in Kanchipuram, the historical city of silk weavers, <strong>Raju Silks & Sarees</strong> has stood as a beacon of genuine craftsmanship and unadulterated luxury. For generations, we have partnered with local master weavers to preserve and showcase the rich heritage of traditional Indian drapes.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-serif font-semibold text-2xl text-brand-blue uppercase">The Weaver Direct Commitment</h2>
          <p>
            Our core mission is to bridge the gap between rural Indian weavers and contemporary saree connoisseurs. By removing intermediaries, we ensure that our master craftsmen receive fair wages while delivering authentic, premium quality Silk Mark certified sarees directly to you.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-serif font-semibold text-2xl text-brand-blue uppercase">Purity & Assurance</h2>
          <p>
            Every single pure silk saree in our collections carries the prestigious <strong>Silk Mark</strong> certification, assuring you of 100% pure mulberry silk and authentic zari materials. We custom weave our threads in our own looms to maintain the highest levels of quality and luxury.
          </p>
        </section>

        <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500 gap-4">
          <div>
            <p className="font-semibold text-brand-blue">Raju Silks & Sarees</p>
            <p>BK 114, Shivam Rd, Sai Baba Colony, Bagh Amberpet, New Nallakunta, Hyderabad, Telangana 500044</p>
          </div>
          <p className="font-semibold">Established 1985</p>
        </div>
      </div>
    </div>
  );
}
