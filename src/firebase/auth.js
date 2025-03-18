import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    updateProfile,
    sendEmailVerification,
    onAuthStateChanged
  } from 'firebase/auth';
  import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
  import { auth, db } from './config';
  
  /**
   * Register a new user with email and password
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @param {string} displayName - User's display name
   * @returns {Promise<Object>} - Firebase user object
   */
  export const registerUser = async (email, password, displayName) => {
    try {
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update profile with displayName
      await updateProfile(user, { displayName });
      
      // Send email verification
      await sendEmailVerification(user);
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        displayName,
        email,
        artistName: displayName,
        profileImage: '',
        createdAt: serverTimestamp(),
        role: 'artist',
        emailVerified: false
      });
      
      return user;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  };
  
  /**
   * Sign in existing user with email and password
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Promise<Object>} - Firebase user credential
   */
  export const loginUser = async (email, password) => {
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  };
  
  /**
   * Sign out the current user
   * @returns {Promise<void>}
   */
  export const logoutUser = async () => {
    try {
      return await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };
  
  /**
   * Send password reset email
   * @param {string} email - User's email address
   * @returns {Promise<void>}
   */
  export const resetPassword = async (email) => {
    try {
      return await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Error sending password reset:', error);
      throw error;
    }
  };
  
  /**
   * Get user profile data from Firestore
   * @param {string} userId - User's ID
   * @returns {Promise<Object|null>} - User profile data or null if not found
   */
  export const getUserProfile = async (userId) => {
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        console.log('No user profile found');
        return null;
      }
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  };
  
  /**
   * Update user profile in Firestore
   * @param {string} userId - User's ID
   * @param {Object} profileData - Data to update
   * @returns {Promise<void>}
   */
  export const updateUserProfile = async (userId, profileData) => {
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, profileData, { merge: true });
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };
  
  /**
   * Set up auth state observer
   * @param {Function} callback - Callback function to handle auth state changes
   * @returns {Function} - Unsubscribe function
   */
  export const observeAuthState = (callback) => {
    return onAuthStateChanged(auth, callback);
  };