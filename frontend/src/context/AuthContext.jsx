import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/api/users/login', { email, password });
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const register = async (name, email, password, phone) => {
    try {
      const { data } = await api.post('/api/users/register', { name, email, password, phone });
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
  };

  const updateProfile = async (profileData) => {
    try {
      const { data } = await api.put('/api/users/profile', profileData);
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update profile'
      };
    }
  };

  const addAddress = async (addressData) => {
    try {
      const { data } = await api.post('/api/users/addresses', addressData);
      const updatedUser = { ...user, addresses: data };
      setUser(updatedUser);
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      return { success: true, addresses: data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to add address'
      };
    }
  };

  const updateAddress = async (id, addressData) => {
    try {
      const { data } = await api.put(`/api/users/addresses/${id}`, addressData);
      const updatedUser = { ...user, addresses: data };
      setUser(updatedUser);
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      return { success: true, addresses: data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update address'
      };
    }
  };

  const deleteAddress = async (id) => {
    try {
      const { data } = await api.delete(`/api/users/addresses/${id}`);
      const updatedUser = { ...user, addresses: data };
      setUser(updatedUser);
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      return { success: true, addresses: data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete address'
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        addAddress,
        updateAddress,
        deleteAddress
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
