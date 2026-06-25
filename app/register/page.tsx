'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import { UserPlus, Sparkles } from 'lucide-react';
import { GlassButton } from '@/components/ui/apple-tahoe-liquid-glass-button';

export default function RegisterPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/');
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name || !email || !phone || !password) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Registration successful, log the user in automatically
      const loginRes = await signIn('credentials', {
        email,
        password,
        redirect: false
      });

      if (loginRes?.error) {
        router.push('/login');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-brand-cream min-h-screen py-16 flex items-center justify-center font-sans">
      <div className="w-full max-w-md bg-white border border-brand-cream-text/25 rounded-2xl shadow-luxury overflow-hidden animate-scale-up">
        
        {/* Banner header */}
        <div className="bg-brand-blue text-white p-8 text-center relative border-b border-brand-cream-text/30">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:12px_12px]"></div>
          
          <div className="inline-flex items-center space-x-1 bg-brand-cream-text/10 border border-brand-cream-text/20 px-2 py-0.5 rounded-full text-brand-cream-text text-[9px] tracking-widest uppercase mb-2">
            <Sparkles size={10} />
            <span>Join Our Patron Registry</span>
          </div>

          <h2 className="font-serif font-bold text-2xl tracking-wide text-brand-cream-text">RAJU SILKS & SAREES</h2>
          <p className="text-[10px] text-brand-cream/80 tracking-widest uppercase font-sans mt-0.5">Create Account</p>
        </div>

        {/* Form Body */}
        <div className="p-8 space-y-6">
          {errorMsg && <p className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 p-2.5 rounded-lg">{errorMsg}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Full Name</label>
              <input
                type="text"
                placeholder="Full Name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs bg-brand-cream/35 border border-brand-cream-text/15 rounded-lg p-2.5 focus:outline-none focus:border-brand-cream-text text-gray-800"
              />
            </div>

            <div>
              <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Email Address</label>
              <input
                type="email"
                placeholder="e.g. yourname@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs bg-brand-cream/35 border border-brand-cream-text/15 rounded-lg p-2.5 focus:outline-none focus:border-brand-cream-text text-gray-800"
              />
            </div>

            <div>
              <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Phone Number</label>
              <input
                type="text"
                placeholder="Mobile number..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xs bg-brand-cream/35 border border-brand-cream-text/15 rounded-lg p-2.5 focus:outline-none focus:border-brand-cream-text text-gray-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Password</label>
                <input
                  type="password"
                  placeholder="Password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs bg-brand-cream/35 border border-brand-cream-text/15 rounded-lg p-2.5 focus:outline-none focus:border-brand-cream-text text-gray-800"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Confirm Password</label>
                <input
                  type="password"
                  placeholder="Re-type..."
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full text-xs bg-brand-cream/35 border border-brand-cream-text/15 rounded-lg p-2.5 focus:outline-none focus:border-brand-cream-text text-gray-800"
                />
              </div>
            </div>

            <GlassButton
              type="submit"
              disabled={loading}
              glassColor="rgba(10, 37, 64, 0.92)"
              className="w-full !text-white"
            >
              <UserPlus size={14} />
              <span>{loading ? 'CREATING PATRON...' : 'REGISTER'}</span>
            </GlassButton>
          </form>

          <div className="text-center text-xs text-gray-500 pt-2 border-t border-brand-cream-dark">
            Already registered?{' '}
            <Link href="/login" className="text-brand-blue font-semibold hover:underline">
              Sign In Here
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
