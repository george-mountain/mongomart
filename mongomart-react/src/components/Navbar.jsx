import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useModals } from '../contexts/ModalContext';

const Navbar = ({ onNavLinkClick, activeView }) => {
  const { isAuthenticated, logout } = useAuth();
  const { openModal } = useModals();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (view) => {
    onNavLinkClick(view);
    setMobileMenuOpen(false); // Close mobile menu on navigation
  };

  const NavLink = ({ view, children }) => (
    <a
      href="#"
      onClick={(e) => { e.preventDefault(); handleNav(view); }}
      className={`nav-link px-3 py-2 rounded-md text-sm font-medium ${activeView === view ? 'active' : ''}`}
    >
      {children}
    </a>
  );
  
  const MobileNavLink = ({ view, children, action }) => (
     <a
        href="#"
        onClick={(e) => {
            e.preventDefault();
            if (action) action();
            else handleNav(view);
            setMobileMenuOpen(false);
        }}
        className="mobile-nav-link"
        >
        {children}
    </a>
  );


  return (
    <nav className="navbar p-4 sticky top-0 z-30 bg-white shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <a href="#" onClick={(e) => { e.preventDefault(); handleNav('all-items'); }} className="text-2xl font-bold text-indigo-600">
          MongoMart
        </a>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-gray-700 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
            aria-controls="mobile-menu"
            aria-expanded={mobileMenuOpen}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}></path>
            </svg>
          </button>
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex space-x-1 items-center">
          <NavLink view="all-items">All Items</NavLink>
          {isAuthenticated && <NavLink view="my-items">My Items</NavLink>}
          {isAuthenticated && <NavLink view="add-item">Add Item</NavLink>}
          {!isAuthenticated && (
            <a href="#" onClick={(e) => { e.preventDefault(); openModal('loginModal'); }} className="nav-link px-3 py-2 rounded-md text-sm font-medium">Login</a>
          )}
          {!isAuthenticated && (
            <a href="#" onClick={(e) => { e.preventDefault(); openModal('signupModal'); }} className="nav-link px-3 py-2 rounded-md text-sm font-medium">Sign Up</a>
          )}
          {isAuthenticated && (
            <a href="#" onClick={(e) => { e.preventDefault(); logout(); handleNav('all-items'); }} className="nav-link px-3 py-2 rounded-md text-sm font-medium">Logout</a>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:hidden bg-white shadow-md rounded-b-lg mt-2`} id="mobile-menu">
          <MobileNavLink view="all-items">All Items</MobileNavLink>
          {isAuthenticated && <MobileNavLink view="my-items">My Items</MobileNavLink>}
          {isAuthenticated && <MobileNavLink view="add-item">Add Item</MobileNavLink>}
          {!isAuthenticated && <MobileNavLink action={() => openModal('loginModal')}>Login</MobileNavLink>}
          {!isAuthenticated && <MobileNavLink action={() => openModal('signupModal')}>Sign Up</MobileNavLink>}
          {isAuthenticated && <MobileNavLink action={() => { logout(); handleNav('all-items'); }}>Logout</MobileNavLink>}
      </div>
    </nav>
  );
};

export default Navbar;