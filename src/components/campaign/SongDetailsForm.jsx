import React, { useState } from 'react';
import { useFormContext } from '../../contexts/FormContext';
import { useStorage } from '../../hooks/useStorage';
import { logFormStepComplete } from '../../firebase/analytics';
import Input from '../common/Input';
import FileUpload from '../common/FileUpload';
import AudioPlayer from '../common/AudioPlayer';
import Button from '../common/Button';

/**
 * Song details form component - first step of campaign creation
 */
const SongDetailsForm = ({ onNext }) => {
  const { formData, updateFormData, errors, validateStep } = useFormContext();
  const { uploadAudioFile, uploadImageFile, progress, loading } = useStorage();
  
  // Local state for form handling
  const [localErrors, setLocalErrors] = useState({});
  
  // Handle text input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    updateFormData('songDetails', { [name]: value });
    
    // Clear local error when user types
    if (localErrors[name]) {
      setLocalErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle date input change
  const handleDateChange = (e) => {
    const { value } = e.target;
    updateFormData('songDetails', { releaseDate: value ? new Date(value) : null });
    
    // Clear local error
    if (localErrors.releaseDate) {
      setLocalErrors(prev => ({ ...prev, releaseDate: '' }));
    }
  };

  // Handle audio file upload
  const handleAudioUpload = async (files) => {
    if (!files || files.length === 0) return;
    
    try {
      const file = files[0];
      const audioUrl = await uploadAudioFile(file);
      
      if (audioUrl) {
        updateFormData('songDetails', { audioUrl });
        
        // Clear local error
        if (localErrors.audioUrl) {
          setLocalErrors(prev => ({ ...prev, audioUrl: '' }));
        }
      }
    } catch (error) {
      console.error('Audio upload error:', error);
      setLocalErrors(prev => ({ 
        ...prev, 
        audioUrl: 'Failed to upload audio file. Please try again.' 
      }));
    }
  };

  // Handle cover art upload
  const handleCoverArtUpload = async (files) => {
    if (!files || files.length === 0) return;
    
    try {
      const file = files[0];
      const coverArtUrl = await uploadImageFile(file);
      
      if (coverArtUrl) {
        updateFormData('songDetails', { coverArtUrl });
        
        // Clear local error
        if (localErrors.coverArtUrl) {
          setLocalErrors(prev => ({ ...prev, coverArtUrl: '' }));
        }
      }
    } catch (error) {
      console.error('Cover art upload error:', error);
      setLocalErrors(prev => ({ 
        ...prev, 
        coverArtUrl: 'Failed to upload cover art. Please try again.' 
      }));
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    const newErrors = {};
    
    if (!formData.songDetails.title.trim()) {
      newErrors.title = 'Song title is required';
    }
    
    if (!formData.songDetails.genre.trim()) {
      newErrors.genre = 'Genre is required';
    }
    
    if (!formData.songDetails.audioUrl) {
      newErrors.audioUrl = 'Audio file is required';
    }
    
    // Update local errors
    setLocalErrors(newErrors);
    
    // If no errors, proceed to next step
    if (Object.keys(newErrors).length === 0) {
      logFormStepComplete('campaign_creation', 0, 'songDetails');
      onNext();
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Song Details</h2>
      
      <form onSubmit={handleSubmit}>
        {/* Song Title */}
        <Input
          type="text"
          id="title"
          name="title"
          label="Song Title"
          value={formData.songDetails.title}
          onChange={handleChange}
          error={localErrors.title || errors.title}
          required
          className="mb-4"
        />
        
        {/* Genre */}
        <Input
          type="text"
          id="genre"
          name="genre"
          label="Genre"
          value={formData.songDetails.genre}
          onChange={handleChange}
          error={localErrors.genre || errors.genre}
          required
          className="mb-4"
        />
        
        {/* Mood */}
        <Input
          type="text"
          id="mood"
          name="mood"
          label="Mood"
          value={formData.songDetails.mood}
          onChange={handleChange}
          helperText="Describe the vibe of your song (e.g., Energetic, Chill, Emotional)"
          className="mb-4"
        />
        
        {/* Release Date */}
        <Input
          type="date"
          id="releaseDate"
          name="releaseDate"
          label="Release Date"
          value={formData.songDetails.releaseDate ? new Date(formData.songDetails.releaseDate).toISOString().split('T')[0] : ''}
          onChange={handleDateChange}
          error={localErrors.releaseDate}
          className="mb-4"
        />
        
        {/* Audio Upload */}
        <FileUpload
          accept="audio/*"
          id="audioFile"
          name="audioFile"
          label="Upload Audio File"
          onChange={handleAudioUpload}
          error={localErrors.audioUrl || errors.audioUrl}
          required
          className="mb-4"
          previewType="audio"
          previewUrl={formData.songDetails.audioUrl}
          uploading={loading}
          progress={progress}
          maxSize={10} // 10MB max
          helperText="Upload your song in MP3, WAV, or M4A format (10MB max)"
        />
        
        {/* Audio Preview */}
        {formData.songDetails.audioUrl && (
          <div className="mb-4">
            <AudioPlayer
              src={formData.songDetails.audioUrl}
              title={formData.songDetails.title || 'Your Song'}
              showThumbnail={!!formData.songDetails.coverArtUrl}
              thumbnail={formData.songDetails.coverArtUrl}
            />
          </div>
        )}
        
        {/* Cover Art Upload */}
        <FileUpload
          accept="image/*"
          id="coverArt"
          name="coverArt"
          label="Upload Cover Art"
          onChange={handleCoverArtUpload}
          error={localErrors.coverArtUrl}
          className="mb-4"
          previewType="image"
          previewUrl={formData.songDetails.coverArtUrl}
          uploading={loading}
          progress={progress}
          maxSize={5} // 5MB max
          helperText="Upload your cover art in JPG, PNG, or WEBP format (5MB max)"
        />
        
        {/* Lyrics */}
        <div className="mb-6">
          <label 
            htmlFor="lyrics" 
            className="block mb-1 font-medium"
          >
            Lyrics
          </label>
          <textarea
            id="lyrics"
            name="lyrics"
            rows={5}
            value={formData.songDetails.lyrics}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Enter your song lyrics (optional)"
          />
        </div>
        
        {/* Navigation Buttons */}
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
          >
            {loading ? 'Uploading...' : 'Next: Artist Details'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SongDetailsForm;