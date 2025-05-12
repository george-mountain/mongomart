import React, { createContext, useState, useCallback, useContext } from 'react';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState({ message: '', type: '', show: false });

  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type, show: true });
    setTimeout(() => {
      setNotification({ message: '', type: '', show: false });
    }, 3000);
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {notification.show && (
        <div
          id="notification-area"
          className={`notification ${notification.type} ${notification.show ? 'show' : ''}`}
        >
          {notification.message}
        </div>
      )}
    </NotificationContext.Provider>
  );
};