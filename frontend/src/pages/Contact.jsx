import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, ShieldCheck } from 'lucide-react';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setForm({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in">
      <div className="text-center mb-12">
        <h1 className="font-serif font-bold text-4xl text-brand-blue tracking-wide mb-2 uppercase">Contact Us</h1>
        <div className="h-0.5 w-24 bg-brand-creamText-antique mx-auto mb-4"></div>
        <p className="text-sm text-gray-600 max-w-xl mx-auto font-sans">
          Have a question about our heritage sarees, customized weaving, or an order? We would love to assist you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Contact Info Card */}
        <div className="lg:col-span-1 bg-brand-blue text-brand-cream p-8 rounded-xl shadow-luxury space-y-6">
          <h2 className="font-serif font-semibold text-2xl text-brand-creamText tracking-wide uppercase border-b border-brand-creamText/25 pb-4">
            Raju Silks & Sarees
          </h2>
          
          <div className="space-y-6 text-sm font-sans text-brand-cream/80">
            <div className="flex items-start space-x-3">
              <MapPin className="text-brand-creamText shrink-0 mt-1" size={20} />
              <div>
                <p className="font-semibold text-brand-creamText">Registered Address</p>
                <p className="mt-1 leading-relaxed">
                  12 Weaver Street, Silk Nagar,<br />
                  Kanchipuram, Tamil Nadu,<br />
                  PIN: 631501, India
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Phone className="text-brand-creamText shrink-0 mt-1" size={20} />
              <div>
                <p className="font-semibold text-brand-creamText">Call / WhatsApp</p>
                <p className="mt-1">+91 98765 43210</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Mail className="text-brand-creamText shrink-0 mt-1" size={20} />
              <div>
                <p className="font-semibold text-brand-creamText">Email Inquiries</p>
                <p className="mt-1 hover:text-brand-creamText">care@rajusilks.com</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Clock className="text-brand-creamText shrink-0 mt-1" size={20} />
              <div>
                <p className="font-semibold text-brand-creamText">Weaving Showroom Hours</p>
                <p className="mt-1 leading-relaxed">
                  Mon - Sat: 9:30 AM to 8:30 PM<br />
                  Sunday: 10:00 AM to 6:00 PM
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2 bg-white p-8 rounded-xl border border-gray-200/80 shadow-luxury">
          <h2 className="font-serif font-semibold text-2xl text-brand-blue tracking-wide uppercase mb-6">
            Send an Inquiry
          </h2>
          
          {submitted && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg flex items-center space-x-2 animate-scale-up">
              <ShieldCheck className="shrink-0" size={18} />
              <span>Your message has been received! Our support team will respond to care@rajusilks.com within 24 business hours.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 font-sans">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-brand-cream/10 border border-gray-300 rounded px-4 py-2.5 text-sm focus:border-brand-blue focus:outline-none"
                  placeholder="Your Name"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-brand-cream/10 border border-gray-300 rounded px-4 py-2.5 text-sm focus:border-brand-blue focus:outline-none"
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Subject</label>
              <input
                type="text"
                required
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full bg-brand-cream/10 border border-gray-300 rounded px-4 py-2.5 text-sm focus:border-brand-blue focus:outline-none"
                placeholder="Product Inquiry / Customization request / Order Support"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Message</label>
              <textarea
                rows={5}
                required
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full bg-brand-cream/10 border border-gray-300 rounded px-4 py-2.5 text-sm focus:border-brand-blue focus:outline-none"
                placeholder="Write your message here..."
              ></textarea>
            </div>

            <button
              type="submit"
              className="bg-brand-blue text-brand-cream font-serif uppercase tracking-wider text-sm font-semibold px-6 py-3 rounded hover:bg-brand-blue-light transition-all flex items-center space-x-2"
            >
              <span>Submit Inquiry</span>
              <Send size={14} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
