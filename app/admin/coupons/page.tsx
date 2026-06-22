'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Power, PowerOff, X } from 'lucide-react';

interface Coupon {
  _id: string;
  code: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  discountPercentage?: number;
  expiryDate: string;
  active: boolean;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState('');

  // Form Fields
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'flat'>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/coupons');
      if (res.ok) {
        const data = await res.json();
        setCoupons(data || []);
      }
    } catch (err) {
      console.error('Error fetching coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const openAddModal = () => {
    setCode('');
    setDiscountType('percentage');
    setDiscountValue('');
    setExpiryDate('');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleToggleCoupon = async (id: string) => {
    try {
      const res = await fetch(`/api/coupons/${id}`, {
        method: 'PUT'
      });
      if (res.ok) {
        fetchCoupons();
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to toggle coupon status');
      }
    } catch (err) {
      alert('Failed to toggle coupon status');
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (window.confirm('Are you sure you want to permanently delete this coupon?')) {
      try {
        const res = await fetch(`/api/coupons/${id}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          fetchCoupons();
        } else {
          const data = await res.json();
          alert(data.message || 'Failed to delete coupon');
        }
      } catch (err) {
        alert('Failed to delete coupon');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!code || !discountValue || !expiryDate) {
      setFormError('Please fill in all coupon details.');
      return;
    }

    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.toUpperCase(),
          discountType,
          discountValue: Number(discountValue),
          expiryDate
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to create coupon');
      }

      setIsModalOpen(false);
      fetchCoupons();
    } catch (err: any) {
      setFormError(err.message || 'Failed to create coupon');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-brand-cream-text/20 gap-4">
        <span className="text-sm text-gray-500 font-medium">Manage promotional codes, discounts percentage value and expiration timers.</span>
        <button
          onClick={openAddModal}
          className="bg-brand-blue hover:bg-brand-blue-deep text-white text-xs font-bold py-2 px-4 rounded-lg border border-brand-cream-text/25 flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Create Coupon</span>
        </button>
      </div>

      {/* CREATE COUPON MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="bg-white w-full max-w-sm rounded-xl overflow-hidden shadow-2xl border border-brand-cream-text/20 animate-scale-up text-gray-700">
            
            <div className="bg-brand-blue px-6 py-4 flex items-center justify-between border-b border-brand-cream-text/25 text-white">
              <span className="font-serif font-bold text-sm text-brand-cream-text">Create Coupon Code</span>
              <button onClick={() => setIsModalOpen(false)} className="text-brand-cream-text hover:text-white p-1">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && <p className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 p-2.5 rounded-lg">{formError}</p>}

              <div>
                <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Coupon Code *</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. FESTIVE25"
                  className="w-full text-xs bg-brand-cream/35 border border-brand-cream-text/15 rounded-lg p-2.5 focus:outline-none focus:border-brand-cream-text text-gray-800 font-bold uppercase"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Discount Type *</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'flat')}
                    className="w-full text-xs bg-brand-cream/35 border border-brand-cream-text/15 rounded-lg p-2.5 focus:outline-none focus:border-brand-cream-text text-gray-800"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">
                    {discountType === 'percentage' ? 'Percentage (%) *' : 'Flat Amount (₹) *'}
                  </label>
                  <input
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder={discountType === 'percentage' ? 'e.g. 25' : 'e.g. 500'}
                    className="w-full text-xs bg-brand-cream/35 border border-brand-cream-text/15 rounded-lg p-2.5 focus:outline-none focus:border-brand-cream-text text-gray-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Expiry Date *</label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full text-xs bg-brand-cream/35 border border-brand-cream-text/15 rounded-lg p-2.5 focus:outline-none focus:border-brand-cream-text text-gray-800"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-brand-cream-dark">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-500 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-brand-blue text-white text-xs font-bold px-5 py-2 rounded-lg border border-brand-cream-text/25"
                >
                  Save Coupon
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* LIST TABLE */}
      {loading ? (
        <div className="h-96 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-blue"></div>
        </div>
      ) : coupons.length === 0 ? (
        <div className="bg-white border border-brand-cream-text/15 rounded-xl p-16 text-center shadow-luxury">
          <p className="font-serif italic text-brand-blue-deep text-lg mb-2">No promotional coupons found.</p>
          <button
            onClick={openAddModal}
            className="bg-brand-blue text-white text-xs font-semibold px-6 py-2.5 rounded-full border border-brand-cream-text/20"
          >
            Create Your First Coupon
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-brand-cream-text/15 shadow-luxury overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-brand-cream/50 text-gray-500 uppercase font-bold border-b border-brand-cream-text/10">
                <tr>
                  <th className="px-6 py-3">Code</th>
                  <th className="px-6 py-3">Discount</th>
                  <th className="px-6 py-3">Expiry Date</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-600 font-medium">
                {coupons.map((coupon) => (
                  <tr key={coupon._id} className="hover:bg-brand-cream/15">
                    <td className="px-6 py-4 font-mono font-bold text-brand-blue-deep text-sm">{coupon.code}</td>
                    <td className="px-6 py-4 font-semibold text-gray-800">
                      {coupon.discountType === 'flat' ? `₹${coupon.discountValue}` : `${coupon.discountValue || coupon.discountPercentage}%`}
                    </td>
                    <td className="px-6 py-4">{new Date(coupon.expiryDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      {coupon.active && new Date(coupon.expiryDate) > new Date() ? (
                        <span className="text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Active</span>
                      ) : (
                        <span className="text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Disabled / Expired</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-3.5">
                        <button
                          onClick={() => handleToggleCoupon(coupon._id)}
                          className={`p-1 ${coupon.active ? 'text-green-600 hover:text-red-600' : 'text-gray-400 hover:text-green-600'}`}
                          title={coupon.active ? 'Disable Coupon' : 'Activate Coupon'}
                        >
                          {coupon.active ? <Power size={16} /> : <PowerOff size={16} />}
                        </button>
                        <button
                          onClick={() => handleDeleteCoupon(coupon._id)}
                          className="text-gray-400 hover:text-red-700 p-1"
                          title="Delete Coupon"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-gray-100">
            {coupons.map((coupon) => (
              <div key={coupon._id} className="p-4 space-y-3 hover:bg-brand-cream/5">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono font-bold text-brand-blue-deep text-sm block">
                      {coupon.code}
                    </span>
                    <span className="text-[10px] text-gray-400 block mt-1 font-sans">
                      Expires: {new Date(coupon.expiryDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    {coupon.active && new Date(coupon.expiryDate) > new Date() ? (
                      <span className="text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">Active</span>
                    ) : (
                      <span className="text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">Expired / Disabled</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                  <div className="font-semibold text-gray-800">
                    Discount: {coupon.discountType === 'flat' ? `₹${coupon.discountValue} Off` : `${coupon.discountValue || coupon.discountPercentage}% Off`}
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleCoupon(coupon._id)}
                      className={`flex items-center gap-1 border px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                        coupon.active 
                          ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100' 
                          : 'border-green-200 bg-green-50 text-green-600 hover:bg-green-100'
                      }`}
                      title={coupon.active ? 'Disable Coupon' : 'Activate Coupon'}
                    >
                      {coupon.active ? <PowerOff size={12} /> : <Power size={12} />}
                      <span>{coupon.active ? 'Disable' : 'Enable'}</span>
                    </button>
                    <button
                      onClick={() => handleDeleteCoupon(coupon._id)}
                      className="text-red-600 hover:text-red-800 flex items-center gap-1 border border-red-200 px-2.5 py-1 rounded bg-red-50"
                      title="Delete Coupon"
                    >
                      <Trash2 size={12} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
