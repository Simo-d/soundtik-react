import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

/**
 * Custom hook to access auth context
 * @returns {Object} Auth context values and methods
 * @property {Object|null} currentUser - Current Firebase user object
 * @property {Object|null} userProfile - User profile data from Firestore
 * @property {boolean} isAdmin - Whether the current user is an admin
 * @property {boolean} loading - Whether auth state is loading
 * @property {string|null} authError - Authentication error message
 * @property {Function} register - Register a new user
 * @property {Function} login - Log in an existing user
 * @property {Function} logout - Log out the current user
 * @property {Function} resetPassword - Send password reset email
 * @property {Function} updateProfile - Update user profile data
 * @property {Function} clearError - Clear auth error
 */
export const useAuth = () => {
  const auth = useContext(AuthContext);
  
  if (!auth) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return auth;
};

export default useAuth;