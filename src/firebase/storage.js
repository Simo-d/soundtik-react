/**
 * This file usually handles Firebase Storage operations
 * Since we're not using Firebase Storage, we'll adapt it to work with external URLs
 */

/**
 * "Upload" a file (mock function that just returns a URL)
 * @param {File} file - The file to "upload"
 * @param {string} path - Unused parameter
 * @param {Function} progressCallback - Optional callback for mock upload progress
 * @returns {Promise<string>} - Mock URL for the "uploaded" file
 */
export const uploadFile = (file, path, progressCallback = null) => {
  return new Promise((resolve) => {
    // Simulate upload progress
    if (progressCallback) {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        progressCallback(progress);
        if (progress >= 100) {
          clearInterval(interval);
        }
      }, 300);
    }

    // Instead of uploading, generate a mock URL or use a placeholder
    setTimeout(() => {
      // For images we'll use a placeholder service
      if (file.type.startsWith('image/')) {
        resolve(`https://via.placeholder.com/300x300?text=${encodeURIComponent(file.name)}`);
      } 
      // For audio we'll use a mock audio URL
      else if (file.type.startsWith('audio/')) {
        resolve('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
      }
      // For other file types
      else {
        resolve(`https://example.com/mock-file/${encodeURIComponent(file.name)}`);
      }
    }, 3000); // Simulate 3 second upload time
  });
};

/**
 * Upload an audio file (mock)
 * @param {File} file - The audio file to "upload"
 * @param {string} userId - User ID for path organization
 * @param {Function} progressCallback - Optional callback for upload progress
 * @returns {Promise<string>} - Mock URL for the "uploaded" audio file
 */
export const uploadAudio = (file, userId, progressCallback = null) => {
  // Generate a mock filename
  const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
  const path = `audio/${userId}/${filename}`;
  return uploadFile(file, path, progressCallback);
};

/**
 * Upload an image file (mock)
 * @param {File} file - The image file to "upload"
 * @param {string} userId - User ID for path organization
 * @param {Function} progressCallback - Optional callback for upload progress
 * @returns {Promise<string>} - Mock URL for the "uploaded" image file
 */
export const uploadImage = (file, userId, progressCallback = null) => {
  // Generate a mock filename
  const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
  const path = `images/${userId}/${filename}`;
  return uploadFile(file, path, progressCallback);
};

/**
 * Delete a file (mock)
 * @param {string} downloadURL - The download URL of the file to delete
 * @returns {Promise<void>}
 */
export const deleteFile = async () => {
  // This is a mock function, so we just return after a short delay
  return new Promise(resolve => setTimeout(resolve, 500));
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