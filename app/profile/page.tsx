'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { User as UserIcon, Key, MapPin, Plus, Trash2, Edit } from 'lucide-react';

interface Address {
  _id: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  addresses?: Address[];
}

export default function ProfilePage() {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Address edit state
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addingAddress, setAddingAddress] = useState(false);
  const [addressSuccess, setAddressSuccess] = useState('');
  const [addressError, setAddressError] = useState('');
  const [pageLoading, setPageLoading] = useState(true);

  // Address form fields
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('India');
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?redirect=/profile');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (status !== 'authenticated') return;
      try {
        setPageLoading(true);
        const res = await fetch('/api/users/profile');
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
          setName(data.name || '');
          setPhone(data.phone || '');
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
      } finally {
        setPageLoading(false);
      }
    };
    fetchProfile();
  }, [status]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');

    if (password && password !== confirmPassword) {
      setProfileError('Passwords do not match.');
      return;
    }

    try {
      setProfileLoading(true);
      const updateData: any = { name, phone };
      if (password) {
        updateData.password = password;
      }

      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      setProfile(data);
      setProfileSuccess('Profile details updated successfully!');
      setPassword('');
      setConfirmPassword('');

      // Refresh next-auth session
      await updateSession({ name: name });
    } catch (err: any) {
      setProfileError(err.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const startEditAddress = (addr: Address) => {
    setEditingAddressId(addr._id);
    setStreet(addr.street);
    setCity(addr.city);
    setState(addr.state);
    setPostalCode(addr.postalCode);
    setCountry(addr.country);
    setIsDefault(addr.isDefault);
    setAddingAddress(true);
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressSuccess('');
    setAddressError('');

    if (!street || !city || !state || !postalCode || !country) {
      setAddressError('Please provide all address details.');
      return;
    }

    const addrData = { street, city, state, postalCode, country, isDefault };

    try {
      let res;
      if (editingAddressId) {
        res = await fetch(`/api/users/addresses/${editingAddressId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(addrData)
        });
      } else {
        res = await fetch('/api/users/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(addrData)
        });
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to save address');
      }

      if (profile) {
        setProfile({ ...profile, addresses: data });
      }
      setAddressSuccess(`Address successfully ${editingAddressId ? 'updated' : 'added'}!`);
      cancelAddressForm();
    } catch (err: any) {
      setAddressError(err.message || 'Failed to save address.');
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        setAddressSuccess('');
        setAddressError('');
        const res = await fetch(`/api/users/addresses/${id}`, {
          method: 'DELETE'
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Failed to delete address');
        }

        if (profile) {
          setProfile({ ...profile, addresses: data });
        }
        setAddressSuccess('Address removed successfully!');
      } catch (err: any) {
        setAddressError(err.message || 'Failed to delete address.');
      }
    }
  };

  const cancelAddressForm = () => {
    setAddingAddress(false);
    setEditingAddressId(null);
    setStreet('');
    setCity('');
    setState('');
    setPostalCode('');
    setCountry('India');
    setIsDefault(false);
  };

  if (pageLoading || status === 'loading') {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-blue"></div>
      </div>
    );
  }

  return (
    <div className="bg-brand-cream min-h-screen py-12 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <h1 className="font-serif font-bold text-2xl sm:text-3xl text-brand-blue-deep tracking-wider mb-8">
          Manage Profile & Addresses
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Panel: Profile settings */}
          <div className="bg-white rounded-xl border border-brand-cream-text/15 p-6 shadow-luxury h-fit">
            <span className="font-serif font-bold text-base text-brand-blue-deep block border-b border-brand-cream-dark pb-3 mb-4 flex items-center gap-1.5">
              <UserIcon size={18} className="text-brand-cream-text" />
              Account Settings
            </span>

            {profileSuccess && <p className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 p-2.5 rounded-lg mb-4">{profileSuccess}</p>}
            {profileError && <p className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 p-2.5 rounded-lg mb-4">{profileError}</p>}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs bg-brand-cream/35 border border-brand-cream-text/15 rounded-lg p-2.5 focus:outline-none focus:border-brand-cream-text text-gray-800 font-semibold"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Email Address</label>
                <input
                  type="email"
                  value={profile?.email}
                  disabled
                  className="w-full text-xs bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-gray-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs bg-brand-cream/35 border border-brand-cream-text/15 rounded-lg p-2.5 focus:outline-none focus:border-brand-cream-text text-gray-800"
                />
              </div>

              <div className="pt-2 border-t border-brand-cream-dark">
                <span className="text-xs text-gray-400 font-bold flex items-center gap-1 mb-3">
                  <Key size={14} className="text-brand-cream-text" />
                  Change Password (optional)
                </span>
                
                <div className="space-y-3">
                  <input
                    type="password"
                    placeholder="New Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-xs bg-brand-cream/35 border border-brand-cream-text/15 rounded-lg p-2.5 focus:outline-none focus:border-brand-cream-text text-gray-800"
                  />
                  <input
                    type="password"
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full text-xs bg-brand-cream/35 border border-brand-cream-text/15 rounded-lg p-2.5 focus:outline-none focus:border-brand-cream-text text-gray-800"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={profileLoading}
                className="w-full bg-brand-blue hover:bg-brand-blue-deep text-white font-sans text-xs font-bold py-2.5 rounded-lg border border-brand-cream-text/25 transition-colors disabled:opacity-50"
              >
                {profileLoading ? 'SAVING...' : 'UPDATE PROFILE'}
              </button>
            </form>
          </div>

          {/* Right Panel: Address Book details */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-brand-cream-text/15 p-6 shadow-luxury">
            <div className="flex items-center justify-between pb-3 border-b border-brand-cream-dark mb-4">
              <span className="font-serif font-bold text-base text-brand-blue-deep flex items-center gap-1.5">
                <MapPin size={18} className="text-brand-cream-text" />
                Address Book
              </span>
              {!addingAddress && (
                <button
                  onClick={() => setAddingAddress(true)}
                  className="text-xs font-sans font-bold text-brand-blue hover:text-brand-cream-text flex items-center gap-1 uppercase transition-colors"
                >
                  <Plus size={14} />
                  Add Address
                </button>
              )}
            </div>

            {addressSuccess && <p className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 p-2.5 rounded-lg mb-4">{addressSuccess}</p>}
            {addressError && <p className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 p-2.5 rounded-lg mb-4">{addressError}</p>}

            {addingAddress ? (
              /* Address Edit/Add Form */
              <form onSubmit={handleAddressSubmit} className="space-y-4 bg-brand-cream/20 p-4 border border-brand-cream-text/10 rounded-lg">
                <h3 className="text-xs font-bold text-brand-blue-deep uppercase tracking-widest">{editingAddressId ? 'Edit Address' : 'New Address'}</h3>
                
                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Street Address</label>
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="e.g. 12 Weaver St"
                    className="w-full text-xs bg-white border border-brand-cream-text/15 rounded-lg p-2.5 focus:outline-none focus:border-brand-cream-text text-gray-800"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Kanchipuram"
                      className="w-full text-xs bg-white border border-brand-cream-text/15 rounded-lg p-2.5 focus:outline-none focus:border-brand-cream-text text-gray-800"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">State</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="e.g. Tamil Nadu"
                      className="w-full text-xs bg-white border border-brand-cream-text/15 rounded-lg p-2.5 focus:outline-none focus:border-brand-cream-text text-gray-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Postal Code (PIN)</label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="e.g. 631501"
                      className="w-full text-xs bg-white border border-brand-cream-text/15 rounded-lg p-2.5 focus:outline-none focus:border-brand-cream-text text-gray-800"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Country</label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full text-xs bg-white border border-brand-cream-text/15 rounded-lg p-2.5 focus:outline-none focus:border-brand-cream-text text-gray-800"
                    />
                  </div>
                </div>

                <label className="flex items-center space-x-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="h-4 w-4 rounded border-brand-cream-text/30 text-brand-blue focus:ring-brand-blue"
                  />
                  <span className="text-xs text-gray-700 select-none">Set as Default Delivery Address</span>
                </label>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={cancelAddressForm}
                    className="px-4 py-2 border border-gray-300 text-gray-500 text-xs font-semibold rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-brand-blue text-white text-xs font-bold px-5 py-2 rounded-lg border border-brand-cream-text/25"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            ) : (
              /* Address List mapping */
              profile?.addresses && profile.addresses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.addresses.map((addr) => (
                    <div 
                      key={addr._id} 
                      className={`p-4 border rounded-xl flex flex-col justify-between ${
                        addr.isDefault 
                          ? 'border-brand-cream-text bg-brand-cream/35' 
                          : 'border-brand-cream-text/15'
                      }`}
                    >
                      <div className="text-xs font-sans text-gray-600 space-y-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-brand-blue-deep">{profile.name}</span>
                          {addr.isDefault && (
                            <span className="text-[9px] bg-brand-cream-text/15 text-brand-blue-deep border border-brand-cream-text/25 px-1.5 py-0.5 rounded font-bold uppercase">Default</span>
                          )}
                        </div>
                        <p>{addr.street}</p>
                        <p>{addr.city}, {addr.state} - {addr.postalCode}</p>
                        <p>{addr.country}</p>
                      </div>

                      <div className="flex justify-end gap-2 border-t border-brand-cream-dark mt-4 pt-3">
                        <button
                          onClick={() => startEditAddress(addr)}
                          className="text-gray-500 hover:text-brand-cream-text p-1"
                          title="Edit Address"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(addr._id)}
                          className="text-gray-500 hover:text-red-700 p-1"
                          title="Delete Address"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 border border-dashed border-brand-cream-text/20 rounded-lg">
                  <p className="text-xs text-gray-500 font-sans mb-3">No addresses found. Add an address to facilitate shopping checkouts.</p>
                  <button
                    onClick={() => setAddingAddress(true)}
                    className="bg-brand-blue text-white text-xs font-bold px-5 py-2 rounded-full border border-brand-cream-text/25"
                  >
                    Add Shipping Address
                  </button>
                </div>
              )
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
