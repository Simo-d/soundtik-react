import React, { useState } from 'react';
import { useFormContext } from '../../contexts/FormContext';
import { useStorage } from '../../hooks/useStorage';
import { logFormStepComplete } from '../../firebase/analytics';
import Input from '../common/Input';
import FileUpload from '../common/FileUpload';
import Button from '../common/Button';

/**
 * Artist details form component - second step of campaign creation
 */
const ArtistDetailsForm = ({ onNext, onBack }) => {
  const { formData, updateFormData, updateNestedFormData, errors, validateStep } = useFormContext();
  const { uploadImageFile, uploadFile, progress, loading } = useStorage();
  
  // Local state for form handling
  const [localErrors, setLocalErrors] = useState({});
  
  // Handle text input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    updateFormData('artistDetails', { [name]: value });
    
    // Clear local error when user types
    if (localErrors[name]) {
      setLocalErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle social links change
  const handleSocialLinkChange = (e) => {
    const { name, value } = e.target;
    updateNestedFormData('artistDetails', 'socialLinks', { [name]: value });
    
    // Clear local error when user types
    if (localErrors[`socialLinks.${name}`]) {
      setLocalErrors(prev => ({ ...prev, [`socialLinks.${name}`]: '' }));
    }
  };

  // Handle press kit upload
  const handlePressKitUpload = async (files) => {
    if (!files || files.length === 0) return;
    
    try {
      const file = files[0];
      // For press kit, we'll accept PDF, DOC, DOCX formats
      const pressKitUrl = await uploadFile(file, `pressKits/${file.name}`);
      
      if (pressKitUrl) {
        updateFormData('artistDetails', { pressKit: pressKitUrl });
        
        // Clear local error
        if (localErrors.pressKit) {
          setLocalErrors(prev => ({ ...prev, pressKit: '' }));
        }
      }
    } catch (error) {
      console.error('Press kit upload error:', error);
      setLocalErrors(prev => ({ 
        ...prev, 
        pressKit: 'Failed to upload press kit. Please try again.' 
      }));
    }
  };

  // Validate URL format
  const validateUrl = (url) => {
    if (!url) return true; // Empty URLs are allowed
    
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields and URL formats
    const newErrors = {};
    
    if (!formData.artistDetails.name.trim()) {
      newErrors.name = 'Artist name is required';
    }
    
    // Validate social links formats
    const { socialLinks } = formData.artistDetails;
    
    if (socialLinks.instagram && !validateUrl(socialLinks.instagram)) {
      newErrors['socialLinks.instagram'] = 'Please enter a valid URL';
    }
    
    if (socialLinks.tiktok && !validateUrl(socialLinks.tiktok)) {
      newErrors['socialLinks.tiktok'] = 'Please enter a valid URL';
    }
    
    if (socialLinks.spotify && !validateUrl(socialLinks.spotify)) {
      newErrors['socialLinks.spotify'] = 'Please enter a valid URL';
    }
    
    if (socialLinks.youtube && !validateUrl(socialLinks.youtube)) {
      newErrors['socialLinks.youtube'] = 'Please enter a valid URL';
    }
    
    // Update local errors
    setLocalErrors(newErrors);
    
    // If no errors, proceed to next step
    if (Object.keys(newErrors).length === 0) {
      logFormStepComplete('campaign_creation', 1, 'artistDetails');
      onNext();
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Artist Details</h2>
      
      <form onSubmit={handleSubmit}>
        {/* Artist Name */}
        <Input
          type="text"
          id="name"
          name="name"
          label="Artist Name"
          value={formData.artistDetails.name}
          onChange={handleChange}
          error={localErrors.name || errors.name}
          required
          className="mb-4"
        />
        
        {/* Artist Bio */}
        <div className="mb-4">
          <label 
            htmlFor="bio" 
            className="block mb-1 font-medium"
          >
            Artist Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={4}
            value={formData.artistDetails.bio}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Tell us about yourself as an artist"
          />
        </div>
        
        {/* Social Media Links */}
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">Social Media Links</h3>
          
          <Input
            type="text"
            id="instagram"
            name="instagram"
            label="Instagram"
            value={formData.artistDetails.socialLinks.instagram}
            onChange={handleSocialLinkChange}
            error={localErrors['socialLinks.instagram']}
            placeholder="https://instagram.com/yourusername"
            className="mb-3"
          />
          
          <Input
            type="text"
            id="tiktok"
            name="tiktok"
            label="TikTok"
            value={formData.artistDetails.socialLinks.tiktok}
            onChange={handleSocialLinkChange}
            error={localErrors['socialLinks.tiktok']}
            placeholder="https://tiktok.com/@yourusername"
            className="mb-3"
          />
          
          <Input
            type="text"
            id="spotify"
            name="spotify"
            label="Spotify"
            value={formData.artistDetails.socialLinks.spotify}
            onChange={handleSocialLinkChange}
            error={localErrors['socialLinks.spotify']}
            placeholder="https://open.spotify.com/artist/yourid"
            className="mb-3"
          />
          
          <Input
            type="text"
            id="youtube"
            name="youtube"
            label="YouTube"
            value={formData.artistDetails.socialLinks.youtube}
            onChange={handleSocialLinkChange}
            error={localErrors['socialLinks.youtube']}
            placeholder="https://youtube.com/c/yourchannel"
            className="mb-3"
          />
        </div>
        
        {/* Press Kit Upload */}
        <FileUpload
          accept=".pdf,.doc,.docx"
          id="pressKit"
          name="pressKit"
          label="Upload Press Kit (Optional)"
          onChange={handlePressKitUpload}
          error={localErrors.pressKit}
          className="mb-6"
          uploading={loading}
          progress={progress}
          maxSize={10} // 10MB max
          helperText="Upload your press kit in PDF, DOC, or DOCX format (10MB max)"
        />
        
        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
          >
            Back: Song Details
          </Button>
          
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
          >
            {loading ? 'Uploading...' : 'Next: Campaign Details'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ArtistDetailsForm;