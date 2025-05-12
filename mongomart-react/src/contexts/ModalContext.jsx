import React, { createContext, useState, useContext, useCallback } from 'react';

const ModalContext = createContext();

export const useModals = () => useContext(ModalContext);

export const ModalProvider = ({ children }) => {
  const [modalState, setModalState] = useState({
    loginModalOpen: false,
    signupModalOpen: false,
    itemDetailModalOpen: false,
    itemDetailModalData: null, // To pass item data to the detail modal
  });

  const openModal = useCallback((modalName, data = null) => {
    setModalState(prev => ({ ...prev, [`${modalName}Open`]: true, [`${modalName}Data`]: data }));
  }, []);

  const closeModal = useCallback((modalName) => {
    setModalState(prev => ({ ...prev, [`${modalName}Open`]: false, [`${modalName}Data`]: null }));
  }, []);
  
  const closeAllModals = useCallback(() => {
    setModalState({
        loginModalOpen: false,
        signupModalOpen: false,
        itemDetailModalOpen: false,
        itemDetailModalData: null,
    });
  }, []);

  return (
    <ModalContext.Provider value={{ ...modalState, openModal, closeModal, closeAllModals }}>
      {children}
    </ModalContext.Provider>
  );
};