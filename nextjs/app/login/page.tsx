'use client';
import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import { LogIn, Sparkles } from 'lucide-react';

function LoginContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [expiredMsg, setExpiredMsg] = useState(false);

  // Redirect if already logged in
  const redirectUrl = searchParams.get('redirect') || '/';

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace(redirectUrl);
    }
    if (searchParams.get('expired') === 'true') {
      setExpiredMsg(true);
    }
  }, [status, router, redirectUrl, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setExpiredMsg(false);

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setErrorMsg('Invalid email or password');
      } else {
        router.push(redirectUrl);
        router.refresh();
      }
    } catch (err) {
      setErrorMsg('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-brand-cream min-h-screen py-20 flex items-center justify-center font-sans">
      <div className="w-full max-w-md bg-white border border-brand-cream-text/25 rounded-2xl shadow-luxury overflow-hidden animate-scale-up">
        
        {/* Banner header */}
        <div className="bg-brand-blue text-white p-8 text-center relative border-b border-brand-cream-text/30">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:12px_12px]"></div>
          
          <div className="inline-flex items-center space-x-1 bg-brand-cream-text/10 border border-brand-cream-text/20 px-2 py-0.5 rounded-full text-brand-cream-text text-[9px] tracking-widest uppercase mb-2">
            <Sparkles size={10} />
            <span>Premium Handloom Store</span>
          </div>

          <h2 className="font-serif font-bold text-2xl tracking-wide text-brand-cream-text">RAJU SILKS & SAREES</h2>
          <p className="text-[10px] text-brand-cream/80 tracking-widest uppercase font-sans mt-0.5">Welcome Back Patron</p>
        </div>

        {/* Form Body */}
        <div className="p-8 space-y-6">
          {errorMsg && <p className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 p-2.5 rounded-lg">{errorMsg}</p>}
          {expiredMsg && <p className="text-xs font-semibold text-brand-blue-light bg-brand-cream border border-brand-cream-text/20 p-2.5 rounded-lg">Session expired. Please log in again.</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Email Address</label>
              <input
                type="email"
                placeholder="e.g. customer@rajusilks.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs bg-brand-cream/35 border border-brand-cream-text/15 rounded-lg p-3 focus:outline-none focus:border-brand-cream-text text-gray-800"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] text-gray-500 font-bold uppercase block">Password</label>
                <Link href="/forgot-password" className="text-[10px] text-brand-blue hover:underline font-semibold">
                  Forgot Password?
                </Link>
              </div>
              <input
                type="password"
                placeholder="Password credentials..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs bg-brand-cream/35 border border-brand-cream-text/15 rounded-lg p-3 focus:outline-none focus:border-brand-cream-text text-gray-800"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-blue hover:bg-brand-blue-deep text-white font-sans font-semibold tracking-wider text-xs py-3 rounded-lg flex items-center justify-center space-x-1.5 shadow-md border border-brand-cream-text/20 disabled:opacity-50"
            >
              <LogIn size={14} />
              <span>{loading ? 'AUTHENTICATING...' : 'SIGN IN'}</span>
            </button>
          </form>

          <div className="text-center text-xs text-gray-500">
            Don't have an account?{' '}
            <Link href="/register" className="text-brand-blue font-semibold hover:underline">
              Register Here
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-blue"></div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
