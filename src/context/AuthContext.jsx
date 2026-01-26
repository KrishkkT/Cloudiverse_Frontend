import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
    const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login`, { email, password });
    const { token, user } = res.data;
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(user);
    return user;
  };

  const register = async (name, email, password, company) => {
    const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/register`, { name, email, password, company });
    const { token, user } = res.data;
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(user);
    return user;
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