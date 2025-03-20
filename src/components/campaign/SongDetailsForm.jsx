import React, { useState } from 'react';
import { useFormContext } from '../../contexts/FormContext';
import { logFormStepComplete } from '../../firebase/analytics';
import Input from '../common/Input';
import Button from '../common/Button';

/**
 * Song details form component - first step of campaign creation
 */
const SongDetailsForm = ({ onNext }) => {
  const { formData, updateFormData, errors, validateStep } = useFormContext();
  
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

  // Validate URL format
  const validateUrl = (url) => {
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
    
    // Validate required fields
    const newErrors = {};
    
    if (!formData.songDetails.title.trim()) {
      newErrors.title = 'Song title is required';
    }
    
    if (!formData.songDetails.genre.trim()) {
      newErrors.genre = 'Genre is required';
    }
    
    if (!formData.songDetails.audioUrl.trim()) {
      newErrors.audioUrl = 'Audio link is required';
    } else if (!validateUrl(formData.songDetails.audioUrl)) {
      newErrors.audioUrl = 'Please enter a valid URL';
    }
    
    // Update local errors
    setLocalErrors(newErrors);
    
    // If no errors, proceed to next step
    if (Object.keys(newErrors).length === 0) {
      logFormStepComplete('campaign_creation', 0, 'songDetails');
      onNext();
    }
  };

  // Audio preview component
  const AudioPreview = () => {
    if (!formData.songDetails.audioUrl || !validateUrl(formData.songDetails.audioUrl)) {
      return null;
    }

    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium mb-2">Audio Preview</h3>
        <audio 
          controls 
          src={formData.songDetails.audioUrl}
          className="w-full"
        >
          Your browser does not support the audio element.
        </audio>
      </div>
    );
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
        
        {/* Audio Link */}
        <Input
          type="url"
          id="audioUrl"
          name="audioUrl"
          label="Audio Link"
          value={formData.songDetails.audioUrl}
          onChange={handleChange}
          error={localErrors.audioUrl || errors.audioUrl}
          required
          placeholder="https://music-platform.com/your-song"
          helperText="Link to your song on Spotify, SoundCloud, YouTube, or other platform"
          className="mb-4"
        />
        
        {/* Audio Preview */}
        <AudioPreview />
        
        {/* Cover Art Link */}
        <Input
          type="url"
          id="coverArtUrl"
          name="coverArtUrl"
          label="Cover Art Link (Optional)"
          value={formData.songDetails.coverArtUrl}
          onChange={handleChange}
          placeholder="https://images.com/your-cover-art.jpg"
          helperText="Link to your song's cover art"
          className="mb-4"
        />
        
        {/* Lyrics */}
        <div className="mb-6">
          <label 
            htmlFor="lyrics" 
            className="block mb-1 font-medium"
          >
            Lyrics (Optional)
          </label>
          <textarea
            id="lyrics"
            name="lyrics"
            rows={5}
            value={formData.songDetails.lyrics}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Enter your song lyrics"
          />
        </div>
        
        {/* Navigation Buttons */}
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
          >
            Next: Artist Details
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SongDetailsForm;