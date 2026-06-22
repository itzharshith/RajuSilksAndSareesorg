import React from 'react';

export default function ShippingPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 animate-fade-in font-sans leading-relaxed text-gray-700">
      <div className="text-center mb-12">
        <h1 className="font-serif font-bold text-4xl text-brand-blue tracking-wide mb-2 uppercase">Shipping & Delivery Policy</h1>
        <div className="h-0.5 w-24 bg-brand-cream-text mx-auto mb-6"></div>
        <p className="text-xs text-gray-500">Last updated: June 04, 2026</p>
      </div>

      <div className="space-y-8 bg-white border border-gray-200 p-8 md:p-12 rounded-xl shadow-luxury">
        <p>
          At <strong>Raju Silks & Sarees</strong>, we partner with premier domestic and international logistics services to ensure your handloom sarees are handled with care and delivered securely.
        </p>

        <section className="space-y-3">
          <h2 className="font-serif font-semibold text-lg text-brand-blue uppercase">1. Order Processing & Dispatch Timelines</h2>
          <p>
            Each product goes through rigorous quality checks at our Hyderabad facility before packaging:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Standard In-Stock Products</strong>: Orders are processed and dispatched within <strong>1 to 2 business days</strong> from order confirmation.</li>
            <li><strong>Custom Weaving / Saree Customizations</strong>: Since these products are custom crafted on looms, dispatch can take <strong>7 to 15 business days</strong> depending on the order requirements. Timelines will be communicated directly during checkout/confirmation.</li>
            <li>We process and ship orders from Monday to Saturday, excluding national holidays.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif font-semibold text-lg text-brand-blue uppercase">2. Delivery Timeframes</h2>
          <p>
            Once dispatched, standard delivery timelines are as follows:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Domestic Shipments (within India)</strong>: Delivered in <strong>3 to 7 business days</strong> to metropolitan and major cities. Rest of India pin codes may take up to <strong>7 to 10 business days</strong>.</li>
            <li><strong>International Shipments</strong>: Delivered in <strong>7 to 15 business days</strong> depending on destination country and customs clearing procedures.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif font-semibold text-lg text-brand-blue uppercase">3. Shipping Charges</h2>
          <p>
            Shipping charges are calculated dynamically at checkout:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Domestic Shipping (within India)</strong>: We offer <strong>Free Shipping</strong> on all orders across India.</li>
            <li><strong>International Shipping</strong>: Charged based on the parcel weight and shipping destination. Any customs duties, import fees, or country-specific taxes levied at the destination port are the sole responsibility of the customer.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif font-semibold text-lg text-brand-blue uppercase">4. Delivery Partners</h2>
          <p>
            To guarantee safety and speed, we work exclusively with leading logistics partners:
            <br />
            Domestic: <strong>BlueDart, Delhivery, DTDC, and Speed Post</strong>.
            <br />
            International: <strong>DHL, FedEx, and UPS</strong>.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif font-semibold text-lg text-brand-blue uppercase">5. Order Tracking</h2>
          <p>
            Once your order is handed over to our courier partner, we will email you a <strong>Tracking Number</strong> and a link to track the status of your shipment in real-time. You can also track your order through the <strong>Track Orders</strong> page in your profile.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif font-semibold text-lg text-brand-blue uppercase">6. Shipping Support</h2>
          <p>
            If your package is delayed or has delivery status discrepancies, please reach out to us:
            <br />
            Email: <strong>raj.hanumanslk@gmail.com</strong>
            <br />
            Phone: <strong>+91 98492 92252</strong>
          </p>
        </section>
      </div>
    </div>
  );
}
