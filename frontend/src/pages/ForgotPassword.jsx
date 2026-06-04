import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Mail, KeyRound, Sparkles, CheckCircle, ArrowLeft, ShieldAlert } from 'lucide-react';

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1 = Enter Email, 2 = Verify OTP & Reset Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Request Reset OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email) {
      setErrorMsg('Please enter your registered email address.');
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.post('/api/users/forgot-password', { email });
      const msg = data.otp 
        ? `${data.message} [DEV BYPASS OTP: ${data.otp}]`
        : (data.message || 'OTP has been successfully sent to your email.');
      setSuccessMsg(msg);
      setStep(2);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to send OTP. Please check your email and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP and Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!otp || !newPassword || !confirmPassword) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    if (otp.length !== 6 || isNaN(Number(otp))) {
      setErrorMsg('OTP must be a 6-digit number.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.post('/api/users/reset-password', { email, otp, newPassword });
      setSuccessMsg(data.message || 'Password reset successful!');
      
      // Clear inputs
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to reset password. The OTP may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-brand-cream min-h-screen py-20 flex items-center justify-center font-sans">
      <div className="w-full max-w-md bg-white border border-brand-creamText/25 rounded-2xl shadow-luxury overflow-hidden animate-scale-up">
        
        {/* Banner header */}
        <div className="bg-brand-blue text-white p-8 text-center relative border-b border-brand-creamText/30">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:12px_12px]"></div>
          
          <div className="inline-flex items-center space-x-1 bg-brand-creamText/10 border border-brand-creamText/20 px-2 py-0.5 rounded-full text-brand-creamText text-[9px] tracking-widest uppercase mb-2">
            <Sparkles size={10} />
            <span>Premium Handloom Store</span>
          </div>

          <h2 className="font-serif font-bold text-2xl tracking-wide text-brand-creamText">RAJU SILKS & SAREES</h2>
          <p className="text-[10px] text-brand-cream/80 tracking-widest uppercase font-sans mt-0.5">Password Recovery Assistant</p>
        </div>

        {/* Form Body */}
        <div className="p-8 space-y-6">
          {errorMsg && (
            <p className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 p-2.5 rounded-lg flex items-center gap-1.5">
              <ShieldAlert size={14} className="shrink-0" />
              <span>{errorMsg}</span>
            </p>
          )}
          {successMsg && (
            <p className="text-xs font-semibold text-green-800 bg-green-50 border border-green-200 p-2.5 rounded-lg flex items-center gap-1.5 animate-pulse">
              <CheckCircle size={14} className="shrink-0" />
              <span>{successMsg}</span>
            </p>
          )}

          {step === 1 ? (
            /* STEP 1: ENTER EMAIL FORM */
            <form onSubmit={handleRequestOTP} className="space-y-4">
              <p className="text-xs text-gray-500 leading-relaxed">
                Provide your registered email address. We will generate and send a 6-digit One-Time Password (OTP) to reset your password.
              </p>

              <div>
                <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                    <Mail size={14} />
                  </span>
                  <input
                    type="email"
                    placeholder="e.g. customer@rajusilks.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs bg-brand-cream/35 border border-brand-creamText/15 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-brand-creamText text-gray-800"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-blue hover:bg-brand-blue-deep text-white font-sans font-semibold tracking-wider text-xs py-3 rounded-lg flex items-center justify-center space-x-1.5 shadow-md border border-brand-creamText/20 disabled:opacity-50 transition-colors"
              >
                <span>{loading ? 'SENDING OTP...' : 'REQUEST OTP'}</span>
              </button>
            </form>
          ) : (
            /* STEP 2: VERIFY OTP & RESET PASSWORD FORM */
            <form onSubmit={handleResetPassword} className="space-y-4">
              <p className="text-xs text-gray-500 leading-relaxed">
                An OTP has been dispatched to <strong>{email}</strong>. Enter it below along with your new password credentials.
              </p>

              <div>
                <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">One-Time Password (OTP) *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                    <KeyRound size={14} />
                  </span>
                  <input
                    type="text"
                    maxLength="6"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full text-xs bg-brand-cream/35 border border-brand-creamText/15 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-brand-creamText text-gray-800 tracking-[0.2em] font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">New Password *</label>
                <input
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full text-xs bg-brand-cream/35 border border-brand-creamText/15 rounded-lg p-3 focus:outline-none focus:border-brand-creamText text-gray-800"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Confirm New Password *</label>
                <input
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full text-xs bg-brand-cream/35 border border-brand-creamText/15 rounded-lg p-3 focus:outline-none focus:border-brand-creamText text-gray-800"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-blue hover:bg-brand-blue-deep text-white font-sans font-semibold tracking-wider text-xs py-3 rounded-lg flex items-center justify-center space-x-1.5 shadow-md border border-brand-creamText/20 disabled:opacity-50 transition-colors"
              >
                <span>{loading ? 'RESETTING PASSWORD...' : 'RESET PASSWORD'}</span>
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-[10px] text-brand-blue hover:underline font-semibold flex items-center gap-1 mx-auto"
                >
                  <ArrowLeft size={12} />
                  <span>Change Email</span>
                </button>
              </div>
            </form>
          )}

          {/* Return to login link */}
          <div className="border-t border-brand-cream-dark pt-4 text-center">
            <Link to="/login" className="text-xs text-brand-blue hover:underline font-semibold flex items-center justify-center gap-1.5">
              <ArrowLeft size={14} />
              <span>Back to Login</span>
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;
