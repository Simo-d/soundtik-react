import React, { useState, useEffect } from 'react';
import { useFormContext } from '../../contexts/FormContext';
import Button from '../common/Button';

/**
 * Creator targeting component - allows selection of content creator types
 * Part of the campaign creation process after budget selection
 */
const CreatorTargeting = ({ onBack, onNext }) => {
  const { formData, updateFormData } = useFormContext();
  
  // Get or initialize targeting data
  const initialTargeting = formData.campaignDetails.creatorTargeting || {
    creatorTypes: [],
    audienceAge: [],
    preferredStyles: []
  };
  
  // Local state
  const [targeting, setTargeting] = useState(initialTargeting);
  
  // Creator type options
  const creatorTypeOptions = [
    { id: 'dance', label: 'Dance Creators', icon: '💃' },
    { id: 'music', label: 'Music Performers', icon: '🎸' },
    { id: 'comedy', label: 'Comedy', icon: '😂' },
    { id: 'lifestyle', label: 'Lifestyle', icon: '✨' },
    { id: 'fashion', label: 'Fashion', icon: '👗' },
    { id: 'gaming', label: 'Gaming', icon: '🎮' },
    { id: 'beauty', label: 'Beauty', icon: '💄' },
    { id: 'fitness', label: 'Fitness', icon: '💪' }
  ];
  
  // Age range options
  const ageRangeOptions = [
    { id: 'teens', label: '13-17' },
    { id: 'young_adults', label: '18-24' },
    { id: 'adults', label: '25-34' },
    { id: 'older_adults', label: '35+' }
  ];
  
  // Video style options
  const styleOptions = [
    { id: 'trending', label: 'Trending Challenges', icon: '📈' },
    { id: 'lipSync', label: 'Lip Syncing', icon: '🎤' },
    { id: 'tutorial', label: 'Tutorials', icon: '📝' },
    { id: 'storytelling', label: 'Storytelling', icon: '📖' },
    { id: 'behindScenes', label: 'Behind the Scenes', icon: '🎬' },
    { id: 'reviews', label: 'Reviews/Reactions', icon: '👀' }
  ];
  
  // Update form context when targeting changes
  useEffect(() => {
    updateFormData('campaignDetails', { creatorTargeting: targeting });
  }, [targeting, updateFormData]);
  
  // Toggle creator type selection
  const toggleCreatorType = (typeId) => {
    setTargeting(prev => {
      const types = prev.creatorTypes.includes(typeId)
        ? prev.creatorTypes.filter(id => id !== typeId)
        : [...prev.creatorTypes, typeId];
        
      return { ...prev, creatorTypes: types };
    });
  };
  
  // Toggle age range selection
  const toggleAgeRange = (ageId) => {
    setTargeting(prev => {
      const ages = prev.audienceAge.includes(ageId)
        ? prev.audienceAge.filter(id => id !== ageId)
        : [...prev.audienceAge, ageId];
        
      return { ...prev, audienceAge: ages };
    });
  };
  
  // Toggle style selection
  const toggleStyle = (styleId) => {
    setTargeting(prev => {
      const styles = prev.preferredStyles.includes(styleId)
        ? prev.preferredStyles.filter(id => id !== styleId)
        : [...prev.preferredStyles, styleId];
        
      return { ...prev, preferredStyles: styles };
    });
  };
  
  // Handle continue
  const handleContinue = () => {
    // At least one creator type should be selected
    if (targeting.creatorTypes.length === 0) {
      alert('Please select at least one creator type');
      return;
    }
    
    onNext();
  };
  
  return (
    <div className="max-w-2xl mx-auto">
      <h3 className="text-xl font-bold mb-4">Target Your Audience</h3>
      <p className="text-gray-600 mb-6">
        Select the types of content creators and audience demographics you'd like to target.
        Our network will match your music with the most suitable creators.
      </p>
      
      {/* Creator Types Selection */}
      <div className="mb-8">
        <h4 className="font-medium mb-3">Content Creator Types</h4>
        <p className="text-sm text-gray-500 mb-3">Select the types of creators you'd like to feature your music (select at least one)</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {creatorTypeOptions.map(type => (
            <button
              key={type.id}
              type="button"
              onClick={() => toggleCreatorType(type.id)}
              className={`
                p-3 rounded-lg border text-left transition-all
                ${targeting.creatorTypes.includes(type.id)
                  ? 'bg-primary-light bg-opacity-10 border-primary'
                  : 'bg-white border-gray-200 hover:border-primary-light'}
              `}
            >
              <span className="text-2xl mr-2">{type.icon}</span>
              <span className={targeting.creatorTypes.includes(type.id) ? 'font-medium' : ''}>
                {type.label}
              </span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Audience Age Selection */}
      <div className="mb-8">
        <h4 className="font-medium mb-3">Target Audience Age</h4>
        <p className="text-sm text-gray-500 mb-3">Select preferred audience age ranges (optional)</p>
        
        <div className="flex flex-wrap gap-2">
          {ageRangeOptions.map(age => (
            <button
              key={age.id}
              type="button"
              onClick={() => toggleAgeRange(age.id)}
              className={`
                px-4 py-2 rounded-full border transition-all
                ${targeting.audienceAge.includes(age.id)
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-primary'}
              `}
            >
              {age.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Video Style Selection */}
      <div className="mb-8">
        <h4 className="font-medium mb-3">Video Styles</h4>
        <p className="text-sm text-gray-500 mb-3">Select preferred video styles (optional)</p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {styleOptions.map(style => (
            <button
              key={style.id}
              type="button"
              onClick={() => toggleStyle(style.id)}
              className={`
                p-3 rounded-lg border text-left transition-all
                ${targeting.preferredStyles.includes(style.id)
                  ? 'bg-primary-light bg-opacity-10 border-primary'
                  : 'bg-white border-gray-200 hover:border-primary-light'}
              `}
            >
              <span className="text-xl mr-2">{style.icon}</span>
              <span className={targeting.preferredStyles.includes(style.id) ? 'font-medium' : ''}>
                {style.label}
              </span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Additional Notes */}
      <div className="mb-8">
        <h4 className="font-medium mb-3">Additional Notes (Optional)</h4>
        <textarea
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          rows="3"
          placeholder="Any specific requests or information for the content creators?"
          value={targeting.notes || ''}
          onChange={(e) => setTargeting(prev => ({ ...prev, notes: e.target.value }))}
        ></textarea>
      </div>
      
      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
        >
          Back to Budget
        </Button>
        
        <Button
          type="button"
          variant="primary"
          onClick={handleContinue}
        >
          Continue to Payment
        </Button>
      </div>
    </div>
  );
};

export default CreatorTargeting;