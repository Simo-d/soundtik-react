import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { logPageView } from '../../firebase/analytics';
import Input from '../common/Input';
import Button from '../common/Button';

/**
 * Password reset request page component
 */
const PasswordReset = () => {
  const { resetPassword, authError, clearError } = useAuth();
  
  // Form state
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Track page view
  useEffect(() => {
    logPageView('Password Reset');
  }, []);

  // Handle email input change
  const handleChange = (e) => {
    setEmail(e.target.value);
    setError('');
    
    // Clear auth error when user starts typing
    if (authError) {
      clearError();
    }
  };

  // Validate form
  const validateForm = () => {
    if (!email) {
      setError('Email is required');
      return false;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email is invalid');
      return false;
    }
    
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      await resetPassword(email);
      setSubmitted(true);
    } catch (error) {
      console.error('Password reset error:', error);
      // Error is handled by auth context and displayed via authError
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="max-w-md w-full m-auto p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-primary">SoundTik</h1>
          <h2 className="text-2xl font-bold text-gray-800 mt-6 mb-2">Reset your password</h2>
          <p className="text-gray-600">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-md">
          {submitted ? (
            <div className="text-center">
              <div className="mb-4 p-4 bg-green-50 text-success rounded border border-green-200">
                Password reset email sent! Check your inbox for further instructions.
              </div>
              
              <p className="mt-4 text-gray-600">
                Return to{' '}
                <Link to="/login" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          ) : (
            <>
              {authError && (
                <div className="mb-4 p-3 bg-red-50 text-error rounded border border-red-200">
                  {authError}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  label="Email Address"
                  value={email}
                  onChange={handleChange}
                  error={error}
                  required
                  autoComplete="email"
                  className="mb-6"
                />
                
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                </Button>
                
                <div className="mt-4 text-center">
                  <Link to="/login" className="text-primary hover:underline text-sm">
                    Back to Sign in
                  </Link>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PasswordReset;