import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { ShieldAlert, ShieldCheck, UserMinus, UserCheck } from 'lucide-react';

const AdminCustomers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/users');
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleBlock = async (user) => {
    const action = user.isBlocked ? 'unblock' : 'block';
    if (window.confirm(`Are you sure you want to ${action} user "${user.name}"?`)) {
      try {
        const { data } = await api.put(`/api/users/${user._id}/block`);
        alert(data.message);
        fetchUsers();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to toggle user status');
      }
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* HEADER INFO */}
      <div className="pb-4 border-b border-brand-creamText/20 text-xs text-gray-500">
        Monitor registered customer accounts, view total order counts, and block/unblock access privileges.
      </div>

      {/* USER LIST TABLE */}
      {loading ? (
        <div className="h-96 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-blue"></div>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white border border-brand-creamText/15 rounded-xl p-16 text-center shadow-luxury">
          <p className="font-serif italic text-brand-blue-deep text-lg">No customer registry records found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-brand-creamText/15 shadow-luxury overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-brand-cream/50 text-gray-500 uppercase font-bold border-b border-brand-creamText/10">
                <tr>
                  <th className="px-6 py-3">Customer Name</th>
                  <th className="px-6 py-3">Email Address</th>
                  <th className="px-6 py-3">Phone</th>
                  <th className="px-6 py-3">Orders Placed</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-600 font-medium">
                {users.map((item) => (
                  <tr key={item._id} className="hover:bg-brand-cream/15">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2.5">
                        <div className="h-8 w-8 bg-brand-blue/10 text-brand-blue rounded-full flex items-center justify-center font-bold font-serif border border-brand-creamText/20">
                          {item.name[0].toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-800">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{item.email}</td>
                    <td className="px-6 py-4">{item.phone}</td>
                    <td className="px-6 py-4 font-semibold text-brand-blue-deep">{item.orderCount || 0} purchases</td>
                    <td className="px-6 py-4 capitalize">{item.role}</td>
                    <td className="px-6 py-4">
                      {item.isBlocked ? (
                        <span className="text-red-700 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Blocked</span>
                      ) : (
                        <span className="text-green-700 bg-green-50 border border-green-200 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Active</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {item.role === 'admin' ? (
                        <span className="text-gray-400 text-[10px] italic">Admin Protected</span>
                      ) : (
                        <button
                          onClick={() => handleToggleBlock(item)}
                          className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase flex items-center gap-1 inline-flex transition-colors ${
                            item.isBlocked
                              ? 'border-green-250 bg-green-50 text-green-700 hover:bg-green-100'
                              : 'border-red-250 bg-red-50 text-red-700 hover:bg-red-100'
                          }`}
                        >
                          {item.isBlocked ? <UserCheck size={11} /> : <UserMinus size={11} />}
                          <span>{item.isBlocked ? 'Unblock' : 'Block'}</span>
                        </button>
                      )}
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

export default AdminCustomers;
