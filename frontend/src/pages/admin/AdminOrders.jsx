import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Eye, Edit, X, RefreshCw, Truck } from 'lucide-react';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal detail states
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalOrderStatus, setModalOrderStatus] = useState('');
  const [modalPaymentStatus, setModalPaymentStatus] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/orders');
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const openDetailsModal = (ord) => {
    setSelectedOrder(ord);
    setModalOrderStatus(ord.orderStatus);
    setModalPaymentStatus(ord.paymentStatus);
  };

  const handleUpdateStatusSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      setUpdateLoading(true);
      const { data } = await api.put(`/api/orders/${selectedOrder._id}/status`, {
        status: modalOrderStatus,
        paymentStatus: modalPaymentStatus
      });
      
      setSelectedOrder(null);
      fetchOrders();
      alert('Order status updated successfully.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdateLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'text-yellow-700 bg-yellow-50 border-yellow-250';
      case 'Processing': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'Shipped': return 'text-indigo-700 bg-indigo-50 border-indigo-200';
      case 'Delivered': return 'text-green-700 bg-green-50 border-green-205';
      case 'Cancelled': return 'text-red-700 bg-red-50 border-red-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* DETAILS VIEW & EDIT STATUS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="bg-white w-full max-w-2xl rounded-xl overflow-hidden shadow-2xl border border-brand-creamText/20 animate-scale-up text-gray-700">
            
            {/* Header */}
            <div className="bg-brand-blue px-6 py-4 flex items-center justify-between border-b border-brand-creamText/25 text-white">
              <div className="flex flex-col">
                <span className="font-serif font-bold text-sm text-brand-creamText">Order Administration</span>
                <span className="text-[10px] text-brand-cream/80 font-mono">ID: {selectedOrder._id}</span>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-brand-creamText hover:text-white p-1">
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleUpdateStatusSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
              
              {/* Status Update Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-brand-cream/20 p-4 border border-brand-creamText/15 rounded-lg">
                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Order Status</label>
                  <select
                    value={modalOrderStatus}
                    onChange={(e) => setModalOrderStatus(e.target.value)}
                    className="w-full text-xs bg-white border border-brand-creamText/15 rounded-lg p-2 focus:outline-none focus:border-brand-creamText"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Payment Status</label>
                  <select
                    value={modalPaymentStatus}
                    onChange={(e) => setModalPaymentStatus(e.target.value)}
                    className="w-full text-xs bg-white border border-brand-creamText/15 rounded-lg p-2 focus:outline-none focus:border-brand-creamText"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>
              </div>

              {/* Customer details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase block mb-0.5">Patron details</span>
                  <p className="font-semibold text-brand-blue-deep">{selectedOrder.user?.name}</p>
                  <p className="text-gray-500">{selectedOrder.user?.email}</p>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase block mb-0.5">Shipping Address</span>
                  <p>{selectedOrder.shippingAddress.street}</p>
                  <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.postalCode}</p>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <span className="font-serif font-bold text-xs text-brand-blue-deep block border-b pb-1.5">Products Purchased</span>
                <div className="space-y-2">
                  {selectedOrder.products.map((item) => (
                    <div key={item._id} className="flex justify-between items-center text-xs">
                      <span>{item.product?.name || 'Deleted Product'} <span className="text-gray-400">x{item.quantity}</span></span>
                      <span className="font-semibold text-gray-700">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Summary */}
              <div className="border-t border-brand-cream-dark pt-3 flex justify-between items-center text-xs">
                <span className="text-gray-500">Gross Total</span>
                <span className="font-serif font-bold text-base text-brand-blue-deep">₹{selectedOrder.totalAmount.toLocaleString('en-IN')}</span>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-brand-cream-dark">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 border border-gray-255 text-gray-500 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateLoading}
                  className="bg-brand-blue text-white text-xs font-bold px-6 py-2 rounded-lg border border-brand-creamText/25 flex items-center gap-1.5"
                >
                  <RefreshCw size={12} className={updateLoading ? 'animate-spin' : ''} />
                  <span>Update Order</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ORDERS LIST TABLE */}
      {loading ? (
        <div className="h-96 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-blue"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white border border-brand-creamText/15 rounded-xl p-16 text-center shadow-luxury">
          <p className="font-serif italic text-brand-blue-deep text-lg">No orders placed yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-brand-creamText/15 shadow-luxury overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-brand-cream/50 text-gray-500 uppercase font-bold border-b border-brand-creamText/10">
                <tr>
                  <th className="px-6 py-3">Order ID</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Net Total</th>
                  <th className="px-6 py-3">Payment</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-600 font-medium">
                {orders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-brand-cream/15">
                    <td className="px-6 py-4 font-mono text-brand-blue-deep">{ord._id}</td>
                    <td className="px-6 py-4">
                      <div>
                        <span className="block font-semibold text-gray-800">{ord.user?.name || 'Guest'}</span>
                        <span className="text-[10px] text-gray-400 block">{ord.user?.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{new Date(ord.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-semibold text-gray-800">₹{ord.totalAmount.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2 py-0.5 border rounded text-[10px] font-bold uppercase tracking-wider ${
                        ord.paymentStatus === 'Paid' ? 'text-green-700 bg-green-50 border-green-200' : 'text-yellow-700 bg-yellow-50 border-yellow-200'
                      }`}>
                        {ord.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2 py-0.5 border rounded text-[10px] font-bold uppercase tracking-wider ${getStatusColor(ord.orderStatus)}`}>
                        {ord.orderStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openDetailsModal(ord)}
                        className="bg-brand-cream hover:bg-brand-creamText/15 text-brand-blue-deep text-xs font-bold py-1.5 px-3 rounded-lg border border-brand-creamText/20 flex items-center gap-1 inline-flex"
                      >
                        <Edit size={12} />
                        <span>Manage</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-gray-100">
            {orders.map((ord) => (
              <div key={ord._id} className="p-4 space-y-3 hover:bg-brand-cream/5 text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] text-gray-400 font-mono block">ORDER ID: {ord._id}</span>
                    <span className="block font-semibold text-gray-800 truncate mt-0.5">{ord.user?.name || 'Guest'}</span>
                    <span className="text-[10px] text-gray-400 block truncate font-sans">{ord.user?.email}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`inline-block px-2 py-0.5 border rounded text-[9px] font-bold uppercase tracking-wider ${
                      ord.paymentStatus === 'Paid' ? 'text-green-700 bg-green-50 border-green-200' : 'text-yellow-700 bg-yellow-50 border-yellow-200'
                    }`}>
                      Payment: {ord.paymentStatus}
                    </span>
                    <span className={`inline-block px-2 py-0.5 border rounded text-[9px] font-bold uppercase tracking-wider ${getStatusColor(ord.orderStatus)}`}>
                      {ord.orderStatus}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div className="space-y-0.5 text-gray-500 font-sans text-[11px]">
                    <p>Date: <span className="font-medium text-gray-700">{new Date(ord.createdAt).toLocaleDateString()}</span></p>
                    <p>Net Total: <span className="font-semibold text-gray-800">₹{ord.totalAmount.toLocaleString('en-IN')}</span></p>
                  </div>

                  <div>
                    <button
                      onClick={() => openDetailsModal(ord)}
                      className="bg-brand-cream hover:bg-brand-creamText/15 text-brand-blue-deep text-[11px] font-bold py-1.5 px-3 rounded-lg border border-brand-creamText/20 flex items-center gap-1 inline-flex transition-colors"
                    >
                      <Edit size={12} />
                      <span>Manage</span>
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
};

export default AdminOrders;
