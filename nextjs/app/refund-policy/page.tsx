import React from 'react';

export default function RefundPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 animate-fade-in font-sans leading-relaxed text-gray-700">
      <div className="text-center mb-12">
        <h1 className="font-serif font-bold text-4xl text-brand-blue tracking-wide mb-2 uppercase">Refund & Cancellation Policy</h1>
        <div className="h-0.5 w-24 bg-brand-cream-text mx-auto mb-6"></div>
        <p className="text-xs text-gray-500">Last updated: June 04, 2026</p>
      </div>

      <div className="space-y-8 bg-white border border-gray-200 p-8 md:p-12 rounded-xl shadow-luxury">
        <p>
          At <strong>Raju Silks & Sarees</strong>, we take immense pride in the quality and craftsmanship of our heritage handloom sarees. Since each saree is handcrafted with pure silk and genuine zari, we have structured our cancellation and refund policy to protect both our customers and our artisan weavers.
        </p>

        <section className="space-y-3">
          <h2 className="font-serif font-semibold text-lg text-brand-blue uppercase">1. Order Cancellations</h2>
          <p>
            You can request to cancel your order at any time <strong>before it is dispatched</strong> for shipping. 
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>To request a cancellation, please email us at <strong>raj.hanumanslk@gmail.com</strong> or call us at <strong>+91 98492 92252</strong> with your Order ID.</li>
            <li>If the order has not been shipped, we will process your cancellation immediately and issue a full refund to your original payment source.</li>
            <li>Once an order is dispatched/shipped, it cannot be cancelled.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif font-semibold text-lg text-brand-blue uppercase">2. Returns & Exchange Window</h2>
          <p>
            We offer a <strong>7-day return and exchange policy</strong> from the date of delivery. Returns are accepted under the following conditions:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>The product received is physically damaged during transit or has manufacturing defects.</li>
            <li>The product received is different from what was ordered (e.g. wrong color, wrong product).</li>
            <li>The saree must be unused, unwashed, unaltered (no fall/pico stitched), and in its original packaging with all brand tags and Silk Mark certification labels intact.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif font-semibold text-lg text-brand-blue uppercase">3. Return Process</h2>
          <p>
            To initiate a return:
          </p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Email <strong>raj.hanumanslk@gmail.com</strong> within 7 days of delivery, attaching images of the damaged/incorrect product.</li>
            <li>Once approved, we will arrange a reverse pickup from your shipping address at no extra cost.</li>
            <li>Upon receiving the returned product at our Hyderabad facility, it will undergo a quality check.</li>
          </ol>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif font-semibold text-lg text-brand-blue uppercase">4. Refund Timelines</h2>
          <p>
            Once the returned product passes the quality check, your refund will be approved and processed:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Refunds will be credited directly to the <strong>original payment source</strong> (credit card, debit card, NetBanking, UPI, or wallet) used during checkout.</li>
            <li>
              According to banking norms and payment gateway standards, it takes <strong>5 to 7 business days</strong> for the refund amount to reflect in your bank account or card statement after processing.
            </li>
            <li>We do not offer cash refunds for digital online payments.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif font-semibold text-lg text-brand-blue uppercase">5. Support Contact</h2>
          <p>
            For any queries regarding refunds, exchanges, or return status, feel free to reach our dedicated support desk:
            <br />
            Email: <strong>raj.hanumanslk@gmail.com</strong>
            <br />
            Phone: <strong>+91 98492 92252</strong> (Operational 11:00 AM to 8:00 PM, Mon-Sun)
          </p>
        </section>
      </div>
    </div>
  );
}
