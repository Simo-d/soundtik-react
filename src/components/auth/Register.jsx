import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { logPageView, logSignUp } from '../../firebase/analytics';
import Input from '../common/Input';
import Button from '../common/Button';

/**
 * Registration page component
 */
const Register = () => {
  const { register, authError, clearError } = useAuth();
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Track page view
  useEffect(() => {
    logPageView('Register');
  }, []);

  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear auth error when user starts typing
    if (authError) {
      clearError();
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    // Validate display name
    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Name is required';
    }
    
    // Validate email
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    // Validate confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
      await register(formData.email, formData.password, formData.displayName);
      logSignUp('email');
      navigate('/');
    } catch (error) {
      console.error('Registration error:', error);
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
          <h2 className="text-2xl font-bold text-gray-800 mt-6 mb-2">Create your account</h2>
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-md">
          {authError && (
            <div className="mb-4 p-3 bg-red-50 text-error rounded border border-red-200">
              {authError}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <Input
              type="text"
              id="displayName"
              name="displayName"
              label="Your Name"
              value={formData.displayName}
              onChange={handleChange}
              error={errors.displayName}
              required
              autoComplete="name"
              className="mb-4"
            />
            
            <Input
              type="email"
              id="email"
              name="email"
              label="Email Address"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              required
              autoComplete="email"
              className="mb-4"
            />
            
            <Input
              type="password"
              id="password"
              name="password"
              label="Password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              required
              autoComplete="new-password"
              className="mb-4"
            />
            
            <Input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              label="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              required
              autoComplete="new-password"
              className="mb-6"
            />
            
            <div className="mb-6">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    required
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="terms" className="text-gray-700">
                    I agree to the{' '}
                    <a href="/terms" className="text-primary hover:underline">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="/privacy" className="text-primary hover:underline">
                      Privacy Policy
                    </a>
                  </label>
                </div>
              </div>
            </div>
            
            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;