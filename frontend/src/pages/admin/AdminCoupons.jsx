import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Trash2, Power, PowerOff, X } from 'lucide-react';

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState('');

  // Form Fields
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/coupons');
      setCoupons(data);
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

  const handleToggleCoupon = async (id) => {
    try {
      await api.put(`/api/coupons/${id}/toggle`);
      fetchCoupons();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle coupon status');
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this coupon?')) {
      try {
        await api.delete(`/api/coupons/${id}`);
        fetchCoupons();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete coupon');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!code || !discountValue || !expiryDate) {
      setFormError('Please fill in all coupon details.');
      return;
    }

    try {
      await api.post('/api/coupons', {
        code: code.toUpperCase(),
        discountType,
        discountValue: Number(discountValue),
        expiryDate
      });
      setIsModalOpen(false);
      fetchCoupons();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create coupon');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* HEADER BAR */}
      <div className="flex items-center justify-between pb-4 border-b border-brand-creamText/20">
        <span className="text-sm text-gray-500 font-medium">Manage promotional codes, discounts percentage value and expiration timers.</span>
        <button
          onClick={openAddModal}
          className="bg-brand-blue hover:bg-brand-blue-deep text-white text-xs font-bold py-2 px-4 rounded-lg border border-brand-creamText/25 flex items-center gap-1.5 transition-colors"
        >
          <Plus size={16} />
          <span>Create Coupon</span>
        </button>
      </div>

      {/* CREATE COUPON MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="bg-white w-full max-w-sm rounded-xl overflow-hidden shadow-2xl border border-brand-creamText/20 animate-scale-up">
            
            <div className="bg-brand-blue px-6 py-4 flex items-center justify-between border-b border-brand-creamText/25 text-white">
              <span className="font-serif font-bold text-sm text-brand-creamText">Create Coupon Code</span>
              <button onClick={() => setIsModalOpen(false)} className="text-brand-creamText hover:text-white p-1">
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
                  className="w-full text-xs bg-brand-cream/35 border border-brand-creamText/15 rounded-lg p-2.5 focus:outline-none focus:border-brand-creamText text-gray-800 font-bold uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Discount Type *</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    className="w-full text-xs bg-brand-cream/35 border border-brand-creamText/15 rounded-lg p-2.5 focus:outline-none focus:border-brand-creamText text-gray-800"
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
                    className="w-full text-xs bg-brand-cream/35 border border-brand-creamText/15 rounded-lg p-2.5 focus:outline-none focus:border-brand-creamText text-gray-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Expiry Date *</label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full text-xs bg-brand-cream/35 border border-brand-creamText/15 rounded-lg p-2.5 focus:outline-none focus:border-brand-creamText text-gray-800"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-brand-cream-dark">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-255 text-gray-500 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-brand-blue text-white text-xs font-bold px-5 py-2 rounded-lg border border-brand-creamText/25"
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
        <div className="bg-white border border-brand-creamText/15 rounded-xl p-16 text-center shadow-luxury">
          <p className="font-serif italic text-brand-blue-deep text-lg mb-2">No promotional coupons found.</p>
          <button
            onClick={openAddModal}
            className="bg-brand-blue text-white text-xs font-semibold px-6 py-2.5 rounded-full border border-brand-creamText/20"
          >
            Create Your First Coupon
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-brand-creamText/15 shadow-luxury overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-brand-cream/50 text-gray-500 uppercase font-bold border-b border-brand-creamText/10">
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
        </div>
      )}

    </div>
  );
};

export default AdminCoupons;
