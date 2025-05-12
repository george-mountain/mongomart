import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoginModal from './components/modals/LoginModal';
import SignupModal from './components/modals/SignupModal';
import ItemDetailModal from './components/modals/ItemDetailModal';
import AllItemsPage from './pages/AllItemsPage';
import MyItemsPage from './pages/MyItemsPage';
import AddItemPage from './pages/AddItemPage';

import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ModalProvider, useModals } from './contexts/ModalContext'; 


const AppContent = () => {
  const [currentView, setCurrentView] = useState('all-items'); 
  const { closeAllModals } = useModals(); 

  const handleNavLinkClick = (view) => {
    setCurrentView(view);
    closeAllModals(); // Close any open modals when navigating
  };
  
  const refreshMyItems = () => {
   
    if (currentView === 'my-items') {
        
        // This function is more for itemDetailModal's onItemDeleted prop.
    }
  };


  let pageContent;
  switch (currentView) {
    case 'my-items':
      pageContent = <MyItemsPage onNavigate={handleNavLinkClick} />;
      break;
    case 'add-item':
      pageContent = <AddItemPage onNavigate={handleNavLinkClick} />;
      break;
    case 'all-items':
    default:
      pageContent = <AllItemsPage />;
      break;
  }

  return (
    <>
      <Navbar onNavLinkClick={handleNavLinkClick} activeView={currentView} />
      <main id="main-content" className="container mx-auto p-4 md:p-8 flex-grow">
        {pageContent}
      </main>
      <LoginModal />
      <SignupModal />
      <ItemDetailModal onItemDeleted={refreshMyItems} />
    </>
  );
}


function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <ModalProvider>
          <div className="flex flex-col min-h-screen">
            <AppContent />
            <Footer />
          </div>
        </ModalProvider>
      </AuthProvider>
    </NotificationProvider>
  );
}

export default App;