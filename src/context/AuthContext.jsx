import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deviceId, setDeviceId] = useState(null);

  useEffect(() => {
    const setFp = async () => {
      const fp = await FingerprintJS.load();
      const { visitorId } = await fp.get();
      setDeviceId(visitorId);
    };
    setFp();
  }, []);

  // Set default axios header
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          // Fetch user profile from backend
          const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/auth/profile`);
          setUser(res.data);
        } catch (error) {
          console.error("Auth check failed:", error);
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Idle Timeout Logic (24 hours)
  useEffect(() => {
    let idleTimer;
    const IDLE_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

    const resetTimer = () => {
      if (idleTimer) clearTimeout(idleTimer);
      if (user) {
        idleTimer = setTimeout(() => {
          console.log('User idle for 24 hours. Logging out...');
          logout();
        }, IDLE_TIMEOUT);
      }
    };

    // Events to track activity
    const events = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchmove', 'click'];

    // Attach listeners
    if (user) {
      resetTimer(); // Start timer on mount/login
      events.forEach(event => window.addEventListener(event, resetTimer));
    }

    return () => {
      if (idleTimer) clearTimeout(idleTimer);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [user]);

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login`, {
        email,
        password,
        device_id: deviceId
      });
      localStorage.setItem('token', res.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      setUser(res.data.user);
      return { success: true };
    } catch (error) {
      console.error("Login failed:", error);
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const register = async (name, email, password, company) => {
    try {
      const payload = { name, email, password, company, device_id: deviceId };
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/register`, payload);
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      return { success: true, user };
    } catch (error) {
      console.error("Registration failed:", error);
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  const updateProfile = async (userData) => {
    try {
      const res = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/auth/profile`, userData);
      setUser(prev => ({ ...prev, ...res.data }));
      return { success: true, user: res.data };
    } catch (error) {
      console.error("Profile update failed:", error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update profile'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    window.location.href = '/login';
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;