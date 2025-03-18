import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { logPageView } from '../firebase/analytics';
import RegisterForm from '../components/auth/Register';
import Navbar from '../components/common/Navbar';

/**
 * Registration page component
 */
const Register = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // Track page view
  useEffect(() => {
    logPageView('Register Page');
  }, []);
  
  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow">
        <RegisterForm />
      </main>
      
      <footer className="bg-white py-6 border-t">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} SoundTik. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Register;