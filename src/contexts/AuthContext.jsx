import React, { createContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { logLogin, logSignUp } from '../firebase/analytics';

// Create the context
export const AuthContext = createContext();

/**
 * Auth Provider component for managing authentication state
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Set up auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          // Check if user is the hardcoded admin
          if (user.email === 'admin@soundtik.com') {
            // This user is always an admin
            setUserProfile({
              displayName: 'Admin User',
              email: user.email,
              role: 'admin'
            });
            setIsAdmin(true);
          } else {
            // Get regular user profile from Firestore
            const docRef = doc(db, 'users', user.uid);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
              const userData = docSnap.data();
              setUserProfile(userData);
              setIsAdmin(userData.role === 'admin');
            } else {
              console.log('No user profile found in Firestore');
              setUserProfile(null);
              setIsAdmin(false);
            }
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setUserProfile(null);
          setIsAdmin(false);
          setAuthError('Failed to fetch user profile');
        }
      } else {
        // User is signed out
        setUserProfile(null);
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    // Clean up the listener on unmount
    return unsubscribe;
  }, []);

  // Register function
  const register = async (email, password, displayName) => {
    try {
      setAuthError(null);
      const { registerUser } = await import('../firebase/auth');
      const user = await registerUser(email, password, displayName);
      logSignUp('email');
      return user;
    } catch (error) {
      setAuthError(error.message);
      throw error;
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      setAuthError(null);
      const { loginUser } = await import('../firebase/auth');
      const result = await loginUser(email, password);
      logLogin('email');
      return result;
    } catch (error) {
      setAuthError(error.message);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setAuthError(null);
      const { logoutUser } = await import('../firebase/auth');
      await logoutUser();
    } catch (error) {
      setAuthError(error.message);
      throw error;
    }
  };

  // Reset password function
  const resetPassword = async (email) => {
    try {
      setAuthError(null);
      const { resetPassword: resetUserPassword } = await import('../firebase/auth');
      await resetUserPassword(email);
    } catch (error) {
      setAuthError(error.message);
      throw error;
    }
  };

  // Update profile function
  const updateProfile = async (userId, profileData) => {
    try {
      setAuthError(null);
      const { updateUserProfile } = await import('../firebase/auth');
      await updateUserProfile(userId, profileData);
      // Update local state
      setUserProfile(prev => ({ ...prev, ...profileData }));
    } catch (error) {
      setAuthError(error.message);
      throw error;
    }
  };

  // Clear error
  const clearError = () => {
    setAuthError(null);
  };

  // Context value
  const value = {
    currentUser,
    userProfile,
    isAdmin,
    loading,
    authError,
    register,
    login,
    logout,
    resetPassword,
    updateProfile,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading ? children : <div>Loading...</div>}
    </AuthContext.Provider>
  );
};

export default AuthContext;