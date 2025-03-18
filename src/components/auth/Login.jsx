import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { logPageView } from '../../firebase/analytics';
import Input from '../common/Input';
import Button from '../common/Button';

/**
 * Login page component
 */
const Login = () => {
  const { login, authError, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Track page view
  React.useEffect(() => {
    logPageView('Login');
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
    
    // Validate email
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password is required';
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
      await login(formData.email, formData.password);
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login error:', error);
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
          <h2 className="text-2xl font-bold text-gray-800 mt-6 mb-2">Sign in to your account</h2>
          <p className="text-gray-600">
            Or{' '}
            <Link to="/register" className="text-primary hover:underline">
              create a new account
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
              autoComplete="current-password"
              className="mb-6"
            />
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <input
                  id="remember_me"
                  name="remember_me"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              
              <div className="text-sm">
                <Link to="/reset-password" className="text-primary hover:underline">
                  Forgot your password?
                </Link>
              </div>
            </div>
            
            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;