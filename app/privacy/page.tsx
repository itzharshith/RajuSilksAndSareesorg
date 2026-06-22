import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 animate-fade-in font-sans leading-relaxed text-gray-700">
      <div className="text-center mb-12">
        <h1 className="font-serif font-bold text-4xl text-brand-blue tracking-wide mb-2 uppercase">Privacy Policy</h1>
        <div className="h-0.5 w-24 bg-brand-cream-text mx-auto mb-6"></div>
        <p className="text-xs text-gray-500">Last updated: June 04, 2026</p>
      </div>

      <div className="space-y-8 bg-white border border-gray-200 p-8 md:p-12 rounded-xl shadow-luxury">
        <p>
          At <strong>Raju Silks & Sarees</strong>, we are committed to safeguarding the privacy of our website visitors and customers. This Privacy Policy details how we collect, use, and protect your personal information when you use our site and purchase our heritage sarees.
        </p>

        <section className="space-y-3">
          <h2 className="font-serif font-semibold text-lg text-brand-blue uppercase">1. Information We Collect</h2>
          <p>
            When you register, place an order, or contact us, we collect details such as:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Name and contact details (email, phone number, physical address).</li>
            <li>Billing and shipping information.</li>
            <li>Interaction details (IP address, browser type, site navigation history).</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif font-semibold text-lg text-brand-blue uppercase">2. How We Use Your Information</h2>
          <p>
            We use your personal data to:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Process transactions, handle shipping, and manage payments securely.</li>
            <li>Send order confirmations, tracking numbers, and account updates.</li>
            <li>Send password reset OTPs and answer customer support inquiries.</li>
            <li>Improve website performance and detect potential fraudulent activities.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif font-semibold text-lg text-brand-blue uppercase">3. Data Security & Payment Integrity</h2>
          <p>
            We deploy secure technical protocols (SSL/TLS encryption) to secure data transmissions. All transactions are securely handled directly by our PCI-DSS compliant payment gateway partner (Razorpay). We do not collect, process, or store sensitive credit/debit card credentials on our servers.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif font-semibold text-lg text-brand-blue uppercase">4. Cookies and Tracking</h2>
          <p>
            We use essential cookies to maintain your login session and shopping cart contents. You can adjust your browser settings to decline cookies, but this might restrict some functionalities of the e-commerce store.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif font-semibold text-lg text-brand-blue uppercase">5. Sharing of Information</h2>
          <p>
            We do not sell, lease, or rent customer databases to third parties. We share data only with necessary service partners (such as courier partners like BlueDart/DHL, and payment gateway Razorpay) strictly to complete your orders.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif font-semibold text-lg text-brand-blue uppercase">6. Your Rights</h2>
          <p>
            You have the right to request access to, edit, or delete your personal data. You can perform this by logging into your profile page or by contacting us directly at <strong>raj.hanumanslk@gmail.com</strong>.
          </p>
        </section>
      </div>
    </div>
  );
}
