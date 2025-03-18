import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './config';

/**
 * Upload a file to Firebase Storage with progress tracking
 * @param {File} file - The file to upload
 * @param {string} path - Storage path including filename
 * @param {Function} progressCallback - Optional callback for upload progress
 * @returns {Promise<string>} - Download URL of the uploaded file
 */
export const uploadFile = (file, path, progressCallback = null) => {
  return new Promise((resolve, reject) => {
    // Create storage reference
    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    // Listen for state changes, errors, and completion
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        // Get upload progress
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
        
        if (progressCallback) {
          progressCallback(progress);
        }
      },
      (error) => {
        // Handle errors
        console.error('Upload error:', error);
        reject(error);
      },
      async () => {
        // Upload completed successfully
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        } catch (err) {
          reject(err);
        }
      }
    );
  });
};

/**
 * Upload an audio file
 * @param {File} file - The audio file to upload
 * @param {string} userId - User ID for path organization
 * @param {Function} progressCallback - Optional callback for upload progress
 * @returns {Promise<string>} - Download URL of the uploaded audio file
 */
export const uploadAudio = (file, userId, progressCallback = null) => {
  // Generate unique filename to avoid collisions
  const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
  const path = `audio/${userId}/${filename}`;
  return uploadFile(file, path, progressCallback);
};

/**
 * Upload an image file
 * @param {File} file - The image file to upload
 * @param {string} userId - User ID for path organization
 * @param {Function} progressCallback - Optional callback for upload progress
 * @returns {Promise<string>} - Download URL of the uploaded image file
 */
export const uploadImage = (file, userId, progressCallback = null) => {
  // Generate unique filename to avoid collisions
  const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
  const path = `images/${userId}/${filename}`;
  return uploadFile(file, path, progressCallback);
};

/**
 * Delete a file from Firebase Storage
 * @param {string} downloadURL - The download URL of the file to delete
 * @returns {Promise<void>}
 */
export const deleteFile = async (downloadURL) => {
  try {
    // Extract the path from the URL
    const url = new URL(downloadURL);
    const path = decodeURIComponent(url.pathname.split('/o/')[1]).split('?')[0];
    
    // Create reference and delete the file
    const fileRef = ref(storage, path);
    await deleteObject(fileRef);
    console.log('File deleted successfully');
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

/**
 * Get the file extension from a file object
 * @param {File} file - The file object
 * @returns {string} - The file extension
 */
export const getFileExtension = (file) => {
  return file.name.split('.').pop().toLowerCase();
};

/**
 * Validate file type
 * @param {File} file - The file to validate
 * @param {Array<string>} allowedTypes - Array of allowed MIME types
 * @returns {boolean} - Whether the file type is allowed
 */
export const validateFileType = (file, allowedTypes) => {
  return allowedTypes.includes(file.type);
};

/**
 * Validate file size
 * @param {File} file - The file to validate
 * @param {number} maxSizeInMB - Maximum allowed size in MB
 * @returns {boolean} - Whether the file size is valid
 */
export const validateFileSize = (file, maxSizeInMB) => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
};