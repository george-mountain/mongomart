import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useNotification } from './NotificationContext';
import { loginUser as apiLoginUser } from '../services/api'; 

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setTokenState] = useState(localStorage.getItem('accessToken'));
  const [currentUser, setCurrentUser] = useState(null); 
  const { showNotification } = useNotification();

  const setToken = useCallback((newToken) => {
    if (newToken) {
      localStorage.setItem('accessToken', newToken);
      setTokenState(newToken);
      try {
        // Basic payload decoding (not for verification, just for info if needed)
        const payload = JSON.parse(atob(newToken.split('.')[1]));
        setCurrentUser({ email: payload.sub }); // Assuming 'sub' is email
      } catch (e) {
        console.error("Error decoding token:", e);
        setCurrentUser(null);
      }
    } else {
      localStorage.removeItem('accessToken');
      setTokenState(null);
      setCurrentUser(null);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const data = await apiLoginUser(email, password); 
      setToken(data.access_token);
      showNotification('Login successful!', 'success');
      return true;
    } catch (error) {
      showNotification(error.message || 'Login failed. Please check your credentials.', 'error');
      return false;
    }
  };

  const logout = useCallback(() => {
    setToken(null);
    showNotification('Logged out successfully.', 'success');
  }, [setToken, showNotification]);


  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    if (storedToken) {
      setToken(storedToken); 
    }
  }, [setToken]);


  const value = {
    token,
    currentUser,
    login,
    logout,
    setToken, 
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};