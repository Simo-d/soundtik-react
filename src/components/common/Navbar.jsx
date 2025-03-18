import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from './Button';

/**
 * Application navigation bar
 */
const Navbar = () => {
  const { currentUser, logout, isAdmin } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Handle user logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and primary nav */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-2xl font-bold text-primary">
                SoundTik
              </Link>
            </div>
            
            {/* Desktop navigation */}
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <div className="flex space-x-4">
                <Link 
                  to="/" 
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary"
                >
                  Home
                </Link>
                
                {currentUser && (
                  <>
                    <Link 
                      to="/create-campaign" 
                      className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary"
                    >
                      Create Campaign
                    </Link>
                    
                    <Link 
                      to="/account" 
                      className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary"
                    >
                      My Account
                    </Link>
                    
                    {isAdmin && (
                      <Link 
                        to="/admin" 
                        className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary"
                      >
                        Admin Panel
                      </Link>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Right side buttons */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {currentUser ? (
              <Button 
                variant="outline" 
                size="small" 
                onClick={handleLogout}
              >
                Logout
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Link to="/login">
                  <Button variant="outline" size="small">
                    Log in
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="small">
                    Sign up
                  </Button>
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary hover:bg-gray-100 focus:outline-none"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={`sm:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
        <div className="pt-2 pb-3 space-y-1">
          <Link 
            to="/" 
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50"
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          
          {currentUser && (
            <>
              <Link 
                to="/create-campaign" 
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                Create Campaign
              </Link>
              
              <Link 
                to="/account" 
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                My Account
              </Link>
              
              {isAdmin && (
                <Link 
                  to="/admin" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin Panel
                </Link>
              )}
            </>
          )}
          
          {currentUser ? (
            <button
              className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50"
              onClick={() => {
                handleLogout();
                setIsMenuOpen(false);
              }}
            >
              Logout
            </button>
          ) : (
            <>
              <Link 
                to="/login" 
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                Log in
              </Link>
              <Link 
                to="/register" 
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;