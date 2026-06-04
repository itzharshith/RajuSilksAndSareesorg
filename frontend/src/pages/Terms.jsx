import React from 'react';

const Terms = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 animate-fade-in font-sans leading-relaxed text-gray-700">
      <div className="text-center mb-12">
        <h1 className="font-serif font-bold text-4xl text-brand-blue tracking-wide mb-2 uppercase">Terms & Conditions</h1>
        <div className="h-0.5 w-24 bg-brand-creamText-antique mx-auto mb-6"></div>
        <p className="text-xs text-gray-500">Last updated: June 04, 2026</p>
      </div>

      <div className="space-y-8 bg-white border border-gray-200 p-8 md:p-12 rounded-xl shadow-luxury">
        <p>
          Welcome to the website of <strong>Raju Silks & Sarees</strong> (referred to as "we", "us", or "our"). By accessing or using our website, placing an order, or utilizing our services, you agree to comply with and be bound by the following Terms and Conditions. Please read them carefully.
        </p>

        <section className="space-y-3">
          <h2 className="font-serif font-semibold text-lg text-brand-blue uppercase">1. Business Entity Information</h2>
          <p>
            Raju Silks & Sarees is a registered business operating in Kanchipuram, Tamil Nadu, India. 
            Registered Address: 12 Weaver Street, Silk Nagar, Kanchipuram, Tamil Nadu, 631501.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif font-semibold text-lg text-brand-blue uppercase">2. Use of the Site & Account Registration</h2>
          <p>
            To place orders, you may be required to register a user account. You are responsible for maintaining the confidentiality of your account credentials. All activities under your account are your responsibility.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif font-semibold text-lg text-brand-blue uppercase">3. Products, Pricing & Accuracy</h2>
          <p>
            We strive to display our handloom products as accurately as possible. However, because our products are handmade and hand-woven, minor differences in weaving patterns, colors, and textures are natural characteristics and not defects. All prices are in Indian Rupees (INR) and are subject to change without notice.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif font-semibold text-lg text-brand-blue uppercase">4. Payments & Transactions</h2>
          <p>
            All digital payments are processed through secure payment gateway partners (such as Razorpay). We do not store your complete card credentials or bank account details. You agree to pay all charges incurred by you or users of your account at the prices in effect when such charges are incurred.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif font-semibold text-lg text-brand-blue uppercase">5. Limitation of Liability & Warranty</h2>
          <p>
            Our products are supplied "as is" and "as available". We do not guarantee that the site will be error-free or uninterrupted. To the maximum extent permitted by law, we shall not be liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use our services or products.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif font-semibold text-lg text-brand-blue uppercase">6. Governing Law & Jurisdiction</h2>
          <p>
            These terms shall be governed by and construed in accordance with the laws of India. Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts located in Kanchipuram/Chennai, Tamil Nadu, India.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif font-semibold text-lg text-brand-blue uppercase">7. Contact Information</h2>
          <p>
            If you have any questions or complaints regarding these Terms and Conditions, please contact us at:
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

export default Terms;
