import React from 'react';

const ShippingPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 animate-fade-in font-sans leading-relaxed text-gray-700">
      <div className="text-center mb-12">
        <h1 className="font-serif font-bold text-4xl text-brand-blue tracking-wide mb-2 uppercase">Shipping & Delivery Policy</h1>
        <div className="h-0.5 w-24 bg-brand-creamText-antique mx-auto mb-6"></div>
        <p className="text-xs text-gray-500">Last updated: June 04, 2026</p>
      </div>

      <div className="space-y-8 bg-white border border-gray-200 p-8 md:p-12 rounded-xl shadow-luxury">
        <p>
          At <strong>Raju Silks & Sarees</strong>, we partner with premier domestic and international logistics services to ensure your handloom sarees are handled with care and delivered securely.
        </p>

        <section className="space-y-3">
          <h2 className="font-serif font-semibold text-lg text-brand-blue uppercase">1. Order Processing & Dispatch Timelines</h2>
          <p>
            Each product goes through rigorous quality checks at our Kanchipuram facility before packaging:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>**Standard In-Stock Products**: Orders are processed and dispatched within **1 to 2 business days** from order confirmation.</li>
            <li>**Custom Weaving / Saree Customizations**: Since these products are custom crafted on looms, dispatch can take **7 to 15 business days** depending on the order requirements. Timelines will be communicated directly during checkout/confirmation.</li>
            <li>We process and ship orders from Monday to Saturday, excluding national holidays.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif font-semibold text-lg text-brand-blue uppercase">2. Delivery Timeframes</h2>
          <p>
            Once dispatched, standard delivery timelines are as follows:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>**Domestic Shipments (within India)**: Delivered in **3 to 7 business days** to metropolitan and major cities. Rest of India pin codes may take up to **7 to 10 business days**.</li>
            <li>**International Shipments**: Delivered in **7 to 15 business days** depending on destination country and customs clearing procedures.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif font-semibold text-lg text-brand-blue uppercase">3. Shipping Charges</h2>
          <p>
            Shipping charges are calculated dynamically at checkout:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>**Domestic Shipping (within India)**: We offer **Free Shipping** on all orders across India.</li>
            <li>**International Shipping**: Charged based on the parcel weight and shipping destination. Any customs duties, import fees, or country-specific taxes levied at the destination port are the sole responsibility of the customer.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif font-semibold text-lg text-brand-blue uppercase">4. Delivery Partners</h2>
          <p>
            To guarantee safety and speed, we work exclusively with leading logistics partners:
            <br />
            Domestic: **BlueDart, Delhivery, DTDC, and Speed Post**.
            <br />
            International: **DHL, FedEx, and UPS**.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif font-semibold text-lg text-brand-blue uppercase">5. Order Tracking</h2>
          <p>
            Once your order is handed over to our courier partner, we will email you a **Tracking Number** and a link to track the status of your shipment in real-time. You can also track your order through the **Track Orders** page in your profile.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif font-semibold text-lg text-brand-blue uppercase">6. Shipping Support</h2>
          <p>
            If your package is delayed or has delivery status discrepancies, please reach out to us:
            <br />
            Email: <strong>care@rajusilks.com</strong>
            <br />
            Phone: <strong>+91 98765 43210</strong>
          </p>
        </section>
      </div>
    </div>
  );
};

export default ShippingPolicy;
