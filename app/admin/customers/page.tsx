'use client';

import React, { useState, useEffect } from 'react';
import { UserMinus, UserCheck } from 'lucide-react';

interface UserItem {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  isBlocked: boolean;
  orderCount?: number;
}

export default function AdminCustomersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data || []);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleBlock = async (user: UserItem) => {
    const action = user.isBlocked ? 'unblock' : 'block';
    if (window.confirm(`Are you sure you want to ${action} user "${user.name}"?`)) {
      try {
        const res = await fetch(`/api/users/${user._id}/block`, {
          method: 'PUT',
        });
        const data = await res.json();
        if (res.ok) {
          alert(data.message);
          fetchUsers();
        } else {
          alert(data.message || 'Failed to toggle user status');
        }
      } catch (err) {
        alert('Failed to toggle user status');
      }
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* HEADER INFO */}
      <div className="pb-4 border-b border-brand-cream-text/20 text-xs text-gray-500">
        Monitor registered customer accounts, view total order counts, and block/unblock access privileges.
      </div>

      {/* USER LIST TABLE */}
      {loading ? (
        <div className="h-96 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-blue"></div>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white border border-brand-cream-text/15 rounded-xl p-16 text-center shadow-luxury">
          <p className="font-serif italic text-brand-blue-deep text-lg">No customer registry records found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-brand-cream-text/15 shadow-luxury overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-brand-cream/50 text-gray-500 uppercase font-bold border-b border-brand-cream-text/10">
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
                        <div className="h-8 w-8 bg-brand-blue/10 text-brand-blue rounded-full flex items-center justify-center font-bold font-serif border border-brand-cream-text/20">
                          {item.name ? item.name[0].toUpperCase() : '?'}
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
                              ? 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
                              : 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
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

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-gray-100">
            {users.map((item) => (
              <div key={item._id} className="p-4 space-y-3 hover:bg-brand-cream/5 text-xs">
                <div className="flex items-center space-x-2.5">
                  <div className="h-8 w-8 bg-brand-blue/10 text-brand-blue rounded-full flex items-center justify-center font-bold font-serif border border-brand-cream-text/20 shrink-0">
                    {item.name ? item.name[0].toUpperCase() : '?'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-semibold text-gray-800 block truncate">{item.name}</span>
                    <span className="text-[10px] text-gray-400 block truncate font-sans">{item.email}</span>
                  </div>
                  <div>
                    {item.isBlocked ? (
                      <span className="text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">Blocked</span>
                    ) : (
                      <span className="text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">Active</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div className="space-y-0.5 text-gray-500 font-sans text-[11px]">
                    <p>Phone: <span className="font-medium text-gray-700">{item.phone}</span></p>
                    <p>Orders: <span className="font-semibold text-brand-blue-deep">{item.orderCount || 0} purchases</span></p>
                    <p className="capitalize">Role: <span className="font-medium text-gray-700">{item.role}</span></p>
                  </div>

                  <div>
                    {item.role === 'admin' ? (
                      <span className="text-gray-400 text-[10px] italic">Admin Protected</span>
                    ) : (
                      <button
                        onClick={() => handleToggleBlock(item)}
                        className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase flex items-center gap-1 transition-colors ${
                          item.isBlocked
                            ? 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
                            : 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                        }`}
                      >
                        {item.isBlocked ? <UserCheck size={11} /> : <UserMinus size={11} />}
                        <span>{item.isBlocked ? 'Unblock' : 'Block'}</span>
                      </button>
                    )}
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
