import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCampaign } from '../hooks/useCampaign';
import { useStorage } from '../hooks/useStorage';
import { logPageView } from '../firebase/analytics';
import Navbar from '../components/common/Navbar';
import Input from '../components/common/Input';
import FileUpload from '../components/common/FileUpload';
import Button from '../components/common/Button';
import CampaignSummary from '../components/campaign/CampaignSummary';

/**
 * Account Settings page - allows user to manage profile and view campaigns
 */
const AccountSettings = () => {
  const { currentUser, userProfile, updateProfile, logout } = useAuth();
  const { campaigns, loading, refreshCampaigns } = useCampaign();
  const { uploadImageFile, progress, loading: uploading } = useStorage();
  const navigate = useNavigate();
  
  // Local state
  const [formData, setFormData] = useState({
    displayName: '',
    artistName: '',
    email: '',
    bio: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  
  // Debug logging
  useEffect(() => {
    console.log('AccountSettings rendered with:', {
      userLoggedIn: !!currentUser,
      userId: currentUser?.uid,
      campaignsLoading: loading,
      campaignsCount: campaigns?.length
    });
    
    if (campaigns?.length > 0) {
      console.log('First campaign:', {
        id: campaigns[0].id,
        status: campaigns[0].status,
        title: campaigns[0].songDetails?.title
      });
    }
  }, [currentUser, campaigns, loading]);
  
  // Track page view
  useEffect(() => {
    logPageView('Account Settings');
  }, []);
  
  // Load user profile data
  useEffect(() => {
    if (userProfile) {
      setFormData({
        displayName: userProfile.displayName || '',
        artistName: userProfile.artistName || '',
        email: currentUser?.email || '',
        bio: userProfile.bio || ''
      });
    }
  }, [userProfile, currentUser]);
  
  // Load campaigns
  useEffect(() => {
    if (currentUser) {
      console.log('Triggering campaign refresh');
      refreshCampaigns();
    }
  }, [currentUser, refreshCampaigns]);
  
  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field error
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  // Handle profile image upload
  const handleImageUpload = async (files) => {
    if (!files || files.length === 0) return;
    
    try {
      const file = files[0];
      const profileImageUrl = await uploadImageFile(file);
      
      if (profileImageUrl) {
        // Update profile with new image URL
        await updateProfile(currentUser.uid, { profileImage: profileImageUrl });
        setUpdateSuccess(true);
        setTimeout(() => setUpdateSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Profile image upload error:', error);
      setErrors(prev => ({ 
        ...prev, 
        profileImage: 'Failed to upload profile image. Please try again.' 
      }));
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle profile update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Update profile in Firestore
      await updateProfile(currentUser.uid, {
        displayName: formData.displayName,
        artistName: formData.artistName,
        bio: formData.bio
      });
      
      setIsEditing(false);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (error) {
      console.error('Profile update error:', error);
      setErrors(prev => ({
        ...prev,
        general: 'Failed to update profile. Please try again.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  // View campaign details
  const handleViewCampaign = (campaignId) => {
    console.log('Navigating to campaign details:', campaignId);
    navigate(`/campaign/${campaignId}`);
  };
  
  // Force campaigns refresh
  const handleRefreshCampaigns = () => {
    console.log('Manual refresh triggered');
    refreshCampaigns();
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Account Settings</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Profile Settings */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">Profile Settings</h2>
                
                {updateSuccess && (
                  <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md">
                    Profile updated successfully!
                  </div>
                )}
                
                {errors.general && (
                  <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
                    {errors.general}
                  </div>
                )}
                
                {/* Profile Image */}
                <div className="mb-6 text-center">
                  <div className="inline-block relative mb-3">
                    {userProfile?.profileImage ? (
                      <img 
                        src={userProfile.profileImage} 
                        alt="Profile" 
                        className="w-24 h-24 rounded-full object-cover border-2 border-primary"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-2xl font-bold border-2 border-primary">
                        {userProfile?.displayName ? userProfile.displayName.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                  </div>
                  
                  <FileUpload
                    accept="image/*"
                    id="profileImage"
                    name="profileImage"
                    label=""
                    onChange={handleImageUpload}
                    error={errors.profileImage}
                    buttonText="Change Photo"
                    uploading={uploading}
                    progress={progress}
                    maxSize={5} // 5MB max
                  />
                </div>
                
                {isEditing ? (
                  <form onSubmit={handleUpdateProfile}>
                    <Input
                      type="text"
                      id="displayName"
                      name="displayName"
                      label="Name"
                      value={formData.displayName}
                      onChange={handleChange}
                      error={errors.displayName}
                      required
                      className="mb-4"
                    />
                    
                    <Input
                      type="text"
                      id="artistName"
                      name="artistName"
                      label="Artist Name"
                      value={formData.artistName}
                      onChange={handleChange}
                      className="mb-4"
                    />
                    
                    <Input
                      type="email"
                      id="email"
                      name="email"
                      label="Email"
                      value={formData.email}
                      disabled
                      className="mb-4"
                    />
                    
                    <div className="mb-4">
                      <label 
                        htmlFor="bio" 
                        className="block mb-1 font-medium"
                      >
                        Bio
                      </label>
                      <textarea
                        id="bio"
                        name="bio"
                        rows={4}
                        value={formData.bio}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Tell us about yourself"
                      />
                    </div>
                    
                    <div className="flex justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                      
                      <Button
                        type="submit"
                        variant="primary"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div>
                    <div className="mb-4">
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium">{formData.displayName}</p>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm text-gray-500">Artist Name</p>
                      <p className="font-medium">{formData.artistName || 'Not set'}</p>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{formData.email}</p>
                    </div>
                    
                    {formData.bio && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-500">Bio</p>
                        <p>{formData.bio}</p>
                      </div>
                    )}
                    
                    <Button
                      type="button"
                      variant="primary"
                      onClick={() => setIsEditing(true)}
                      className="w-full"
                    >
                      Edit Profile
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4">Account Actions</h2>
                
                <div className="space-y-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate('/reset-password')}
                  >
                    Reset Password
                  </Button>
                  
                  <Button
                    type="button"
                    variant="danger"
                    className="w-full"
                    onClick={handleLogout}
                  >
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Right Column - Campaigns */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Your Campaigns</h2>
                  
                  <div className="flex gap-2">
                    {/* Added refresh button for debugging */}
                    {process.env.NODE_ENV === 'development' && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleRefreshCampaigns}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                      </Button>
                    )}
                    
                    <Button
                      type="button"
                      variant="primary"
                      onClick={() => navigate('/create-campaign')}
                    >
                      New Campaign
                    </Button>
                  </div>
                </div>
                
                {loading ? (
                  <div className="py-10 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="mt-2 text-gray-500">Loading your campaigns...</p>
                  </div>
                ) : campaigns && campaigns.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    {campaigns.map(campaign => {
                      // Log each campaign for debugging
                      console.log('Rendering campaign:', campaign.id, campaign);
                      
                      return (
                        <CampaignSummary 
                          key={campaign.id} 
                          campaign={campaign}
                          onViewDetails={handleViewCampaign}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-10 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <p className="text-gray-600 mb-4">You don't have any campaigns yet.</p>
                    <Button
                      type="button"
                      variant="primary"
                      onClick={() => navigate('/create-campaign')}
                    >
                      Create Your First Campaign
                    </Button>
                  </div>
                )}
                
                {/* Add campaign count for debugging */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-4 text-xs text-gray-500 border-t pt-2">
                    {loading ? 'Loading campaigns...' : 
                      campaigns ? 
                        `${campaigns.length} campaign(s) found` : 
                        'No campaigns array'
                    }
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-white py-6 border-t mt-8">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} SoundTik. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default AccountSettings;