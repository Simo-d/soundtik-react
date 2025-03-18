import { useState, useCallback } from 'react';
import { uploadAudio, uploadImage, deleteFile, validateFileType, validateFileSize } from '../firebase/storage';
import { useAuth } from './useAuth';

/**
 * Custom hook for Firebase Storage operations
 * @returns {Object} Storage methods and state
 */
export const useStorage = () => {
  const { currentUser } = useAuth();
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  /**
   * Upload an audio file to Firebase Storage
   * @param {File} file - The audio file to upload
   * @returns {Promise<string|null>} - Download URL or null on error
   */
  const uploadAudioFile = useCallback(async (file) => {
    if (!currentUser) {
      setError('User not authenticated');
      return null;
    }

    // Validate file type
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/x-m4a'];
    if (!validateFileType(file, allowedTypes)) {
      setError('Invalid file type. Please upload MP3, WAV, or M4A files.');
      return null;
    }

    // Validate file size (10MB max)
    if (!validateFileSize(file, 10)) {
      setError('File too large. Maximum size is 10MB.');
      return null;
    }

    setLoading(true);
    setProgress(0);
    setError(null);
    
    try {
      const downloadURL = await uploadAudio(
        file, 
        currentUser.uid,
        (progress) => setProgress(progress)
      );
      
      setUrl(downloadURL);
      return downloadURL;
    } catch (err) {
      console.error('Error uploading audio:', err);
      setError('Failed to upload audio file');
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  /**
   * Upload an image file to Firebase Storage
   * @param {File} file - The image file to upload
   * @returns {Promise<string|null>} - Download URL or null on error
   */
  const uploadImageFile = useCallback(async (file) => {
    if (!currentUser) {
      setError('User not authenticated');
      return null;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validateFileType(file, allowedTypes)) {
      setError('Invalid file type. Please upload JPG, PNG, GIF, or WEBP files.');
      return null;
    }

    // Validate file size (5MB max)
    if (!validateFileSize(file, 5)) {
      setError('File too large. Maximum size is 5MB.');
      return null;
    }

    setLoading(true);
    setProgress(0);
    setError(null);
    
    try {
      const downloadURL = await uploadImage(
        file, 
        currentUser.uid,
        (progress) => setProgress(progress)
      );
      
      setUrl(downloadURL);
      return downloadURL;
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Failed to upload image file');
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  /**
   * Delete a file from Firebase Storage
   * @param {string} fileUrl - URL of the file to delete
   * @returns {Promise<boolean>} - Whether deletion was successful
   */
  const deleteStorageFile = useCallback(async (fileUrl) => {
    if (!fileUrl) {
      setError('No file URL provided');
      return false;
    }

    try {
      setLoading(true);
      await deleteFile(fileUrl);
      setUrl(null);
      return true;
    } catch (err) {
      console.error('Error deleting file:', err);
      setError('Failed to delete file');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Reset the hook's state
   */
  const resetState = useCallback(() => {
    setProgress(0);
    setError(null);
    setUrl(null);
    setLoading(false);
  }, []);

  return {
    progress,
    error,
    url,
    loading,
    uploadAudioFile,
    uploadImageFile,
    deleteStorageFile,
    resetState
  };
};

export default useStorage;