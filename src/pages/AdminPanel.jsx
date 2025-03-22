import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  getPendingCampaigns, 
  validateCampaign, 
  getCampaignVideos, 
  addVideoToCampaign
} from '../firebase/firestore';
import { fetchTikTokVideoDetails } from '../firebase/functions';
import { logPageView } from '../firebase/analytics';
import Navbar from '../components/common/Navbar';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import AudioPlayer from '../components/common/AudioPlayer';
import VideosList from '../components/dashboard/VideosList';

// Import Firebase functions needed for getActiveCampaigns
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs 
} from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Admin Panel - Allows admins to review and approve/reject campaigns
 * and add TikTok videos to approved campaigns
 */
const AdminPanel = () => {
  const { currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  // State for pending campaigns
  const [pendingCampaigns, setPendingCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for campaign review
  const [activeCampaign, setActiveCampaign] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // State for active campaigns (approved)
  const [activeCampaigns, setActiveCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [campaignVideos, setCampaignVideos] = useState([]);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'active', or 'drafts'
  
  // State for adding videos
  const [showAddVideoModal, setShowAddVideoModal] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoCaption, setVideoCaption] = useState('');
  const [addingVideo, setAddingVideo] = useState(false);
  const [videoError, setVideoError] = useState(null);
  
  // Track page view
  useEffect(() => {
    logPageView('Admin Panel');
  }, []);
  
  // Redirect if not admin
  useEffect(() => {
    if (currentUser && !isAdmin) {
      navigate('/');
    }
  }, [currentUser, isAdmin, navigate]);
  
  // Load pending campaigns
  useEffect(() => {
    const loadPendingCampaigns = async () => {
      try {
        setLoading(true);
        const campaigns = await getPendingCampaigns();
        setPendingCampaigns(campaigns);
        setError(null);
      } catch (err) {
        console.error('Error loading pending campaigns:', err);
        setError('Failed to load campaigns: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    
    const loadActiveCampaigns = async () => {
      try {
        setLoading(true);
        // Get campaigns with status 'active'
        const campaignsRef = await getActiveCampaigns();
        setActiveCampaigns(campaignsRef);
        setError(null);
      } catch (err) {
        console.error('Error loading active campaigns:', err);
        setError('Failed to load active campaigns: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
  
    const loadDraftCampaigns = async () => {
      try {
        setLoading(true);
        const campaigns = await getDraftCampaigns();
        setPendingCampaigns(campaigns); // Reusing the same state variable for simplicity
        setError(null);
      } catch (err) {
        console.error('Error loading draft campaigns:', err);
        setError('Failed to load draft campaigns: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (currentUser && isAdmin) {
      if (activeTab === 'pending') {
        loadPendingCampaigns();
      } else if (activeTab === 'drafts') {
        loadDraftCampaigns();
      } else if (activeTab === 'active') {
        loadActiveCampaigns();
      }
    }
  }, [currentUser, isAdmin, activeTab]);
  
  // Load active campaigns
  useEffect(() => {
    const loadActiveCampaigns = async () => {
      try {
        setLoading(true);
        
        // Get campaigns with status 'active'
        const campaignsRef = await getActiveCampaigns();
        setActiveCampaigns(campaignsRef);
        setError(null);
      } catch (err) {
        console.error('Error loading active campaigns:', err);
        setError('Failed to load active campaigns: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (currentUser && isAdmin && activeTab === 'active') {
      loadActiveCampaigns();
    }
  }, [currentUser, isAdmin, activeTab]);
  
  // Load campaign videos when a campaign is selected
  useEffect(() => {
    const loadCampaignVideos = async () => {
      if (!selectedCampaign) return;
      
      try {
        const videos = await getCampaignVideos(selectedCampaign.id);
        setCampaignVideos(videos);
      } catch (err) {
        console.error('Error loading campaign videos:', err);
        setError('Failed to load campaign videos: ' + err.message);
      }
    };
    
    if (selectedCampaign) {
      loadCampaignVideos();
    }
  }, [selectedCampaign]);
  
  // Set active campaign for review
  const handleReviewCampaign = (campaign) => {
    setActiveCampaign(campaign);
    setReviewNotes('');
    setSubmitSuccess(false);
  };
  
  // Select a campaign to manage videos
  const handleSelectCampaign = (campaign) => {
    setSelectedCampaign(campaign);
    setCampaignVideos([]);
  };
  
  // Handle review notes change
  const handleNotesChange = (e) => {
    setReviewNotes(e.target.value);
  };
  
  // Approve campaign
  const handleApproveCampaign = async () => {
    if (!activeCampaign) return;
    
    try {
      setIsSubmitting(true);
      await validateCampaign(activeCampaign.id, true, currentUser.uid, reviewNotes);
      
      // Update local state
      setPendingCampaigns(prevCampaigns => 
        prevCampaigns.filter(camp => camp.id !== activeCampaign.id)
      );
      
      setSubmitSuccess(true);
      setTimeout(() => {
        setActiveCampaign(null);
        setReviewNotes('');
        setSubmitSuccess(false);
      }, 2000);
    } catch (err) {
      console.error('Error approving campaign:', err);
      setError('Failed to approve campaign: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Add this function to get draft campaigns
  const getDraftCampaigns = async (limitCount = 20) => {
    try {
      const campaignsRef = collection(db, 'campaigns');
      const q = query(
        campaignsRef,
        where('status', '==', 'draft'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting draft campaigns:', error);
      throw error;
    }
  };
  
  // Reject campaign
  const handleRejectCampaign = async () => {
    if (!activeCampaign) return;
    
    // Require notes for rejection
    if (!reviewNotes.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }
    
    try {
      setIsSubmitting(true);
      await validateCampaign(activeCampaign.id, false, currentUser.uid, reviewNotes);
      
      // Update local state
      setPendingCampaigns(prevCampaigns => 
        prevCampaigns.filter(camp => camp.id !== activeCampaign.id)
      );
      
      setSubmitSuccess(true);
      setTimeout(() => {
        setActiveCampaign(null);
        setReviewNotes('');
        setSubmitSuccess(false);
      }, 2000);
    } catch (err) {
      console.error('Error rejecting campaign:', err);
      setError('Failed to reject campaign: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle showing add video modal
  const handleShowAddVideo = () => {
    setVideoUrl('');
    setVideoCaption('');
    setVideoError(null);
    setShowAddVideoModal(true);
  };
  
  // Handle video URL change
  const handleVideoUrlChange = (e) => {
    setVideoUrl(e.target.value);
    setVideoError(null);
  };
  
  // Handle video caption change
  const handleVideoCaptionChange = (e) => {
    setVideoCaption(e.target.value);
  };
  
  // Extract TikTok video ID from URL
  const extractTikTokId = (url) => {
    try {
      // Check for TikTok domain
      if (!url.includes('tiktok.com')) {
        return null;
      }
      
      // Try to extract video ID from various TikTok URL formats
      const patterns = [
        /tiktok\.com\/@[^/]+\/video\/(\d+)/i,
        /tiktok\.com\/t\/([^?/]+)/i,
        /vm\.tiktok\.com\/([^?/]+)/i
      ];
      
      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
          return match[1];
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error extracting TikTok ID:', error);
      return null;
    }
  };
  
  // Add TikTok video to campaign
  const handleAddVideo = async () => {
    if (!selectedCampaign) return;
    
    // Validate video URL
    const tiktokId = extractTikTokId(videoUrl);
    if (!tiktokId) {
      setVideoError('Invalid TikTok video URL. Please enter a valid TikTok video link.');
      return;
    }
    
    try {
      setAddingVideo(true);
      
      // Fetch video details from TikTok API
      const videoDetails = await fetchTikTokVideoDetails(tiktokId);
      
      // Add video to campaign
      const videoData = {
        campaignId: selectedCampaign.id,
        tiktokId,
        url: videoUrl,
        caption: videoCaption || videoDetails.caption || '',
        thumbnail: videoDetails.thumbnail || '',
        creatorUsername: videoDetails.username || '',
        metrics: {
          views: videoDetails.views || 0,
          likes: videoDetails.likes || 0,
          comments: videoDetails.comments || 0,
          shares: videoDetails.shares || 0
        },
        status: 'published',
        createdAt: new Date()
      };
      
      await addVideoToCampaign(videoData);
      
      // Update local state
      setCampaignVideos(prev => [videoData, ...prev]);
      
      // Close modal
      setShowAddVideoModal(false);
      
    } catch (err) {
      console.error('Error adding video:', err);
      setVideoError('Failed to add video. Please try again.');
    } finally {
      setAddingVideo(false);
    }
  };
  
  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /**
   * Get active campaigns
   * Function implemented directly in this component but should be moved to firestore.js
   * @param {number} limitCount - Maximum number of campaigns to return
   * @returns {Promise<Array>} Array of active campaign objects
   */
  const getActiveCampaigns = async (limitCount = 20) => {
    try {
      const campaignsRef = collection(db, 'campaigns');
      const q = query(
        campaignsRef,
        where('status', '==', 'active'),
        orderBy('startDate', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting active campaigns:', error);
      throw error;
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md flex justify-between items-center">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
            <button 
              onClick={() => setError(null)}
              className="text-red-700 hover:text-red-900"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
        
        {/* Tab navigation */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex">
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'drafts'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              onClick={() => setActiveTab('drafts')}
            >
              Draft Campaigns
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'pending'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              onClick={() => setActiveTab('pending')}
            >
              Pending Campaigns
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'active'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              onClick={() => setActiveTab('active')}
            >
              Active Campaigns
            </button>
          </div>
        </div>
        
        {/* Pending Campaigns Tab */}
        {(activeTab === 'pending' || activeTab === 'drafts') && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Pending Campaigns List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4">
                  {activeTab === 'drafts' 
                    ? 'Draft Campaigns' 
                    : activeTab === 'pending' 
                      ? 'Pending Campaigns' 
                      : 'Active Campaigns'}
                </h2>
                
                {loading ? (
                  <div className="py-10 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="mt-2 text-gray-500">Loading campaigns...</p>
                  </div>
                ) : pendingCampaigns.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {pendingCampaigns.map(campaign => (
                      <div 
                        key={campaign.id} 
                        className={`py-4 cursor-pointer ${
                          activeCampaign?.id === campaign.id ? 'bg-primary bg-opacity-10' : ''
                        }`}
                        onClick={() => handleReviewCampaign(campaign)}
                      >
                        <h3 className="font-medium">{campaign.songDetails?.title || 'Untitled Campaign'}</h3>
                        <p className="text-sm text-gray-500">{campaign.artistDetails?.name || 'Unknown Artist'}</p>
                        <p className="text-xs text-gray-400 mt-1">Submitted: {formatDate(campaign.submittedAt)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-10 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-600">No {activeTab === 'drafts' ? 'draft' : 'pending'} campaigns to review.</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Right Column - Campaign Review */}
            <div className="lg:col-span-2">
              {activeCampaign ? (
                <div className="bg-white rounded-lg shadow-md p-6">
                  {submitSuccess ? (
                    <div className="py-10 text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-success mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-xl font-medium text-success mb-2">Campaign Review Submitted</p>
                      <p className="text-gray-500">You'll be returned to the campaign list shortly.</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-start mb-6">
                        <h2 className="text-xl font-bold">Campaign Review</h2>
                        <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                          {activeTab === 'drafts' ? 'Draft' : 'Pending Approval'}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <h3 className="text-lg font-medium mb-4">Song Details</h3>
                          
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm text-gray-500">Title</p>
                              <p className="font-medium">{activeCampaign.songDetails?.title || 'Not provided'}</p>
                            </div>
                            
                            <div>
                              <p className="text-sm text-gray-500">Genre</p>
                              <p className="font-medium">{activeCampaign.songDetails?.genre || 'Not provided'}</p>
                            </div>
                            
                            <div>
                              <p className="text-sm text-gray-500">Mood</p>
                              <p className="font-medium">{activeCampaign.songDetails?.mood || 'Not provided'}</p>
                            </div>
                            
                            {activeCampaign.songDetails?.audioUrl && (
                              <div className="mt-4">
                                <AudioPlayer
                                  src={activeCampaign.songDetails.audioUrl}
                                  title={activeCampaign.songDetails.title || 'Song Preview'}
                                  showThumbnail={!!activeCampaign.songDetails?.coverArtUrl}
                                  thumbnail={activeCampaign.songDetails?.coverArtUrl}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-medium mb-4">Artist Details</h3>
                          
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm text-gray-500">Name</p>
                              <p className="font-medium">{activeCampaign.artistDetails?.name || 'Not provided'}</p>
                            </div>
                            
                            {activeCampaign.artistDetails?.bio && (
                              <div>
                                <p className="text-sm text-gray-500">Bio</p>
                                <p>{activeCampaign.artistDetails.bio}</p>
                              </div>
                            )}
                            
                            {Object.values(activeCampaign.artistDetails?.socialLinks || {}).some(link => link) && (
                              <div>
                                <p className="text-sm text-gray-500">Social Links</p>
                                <div className="space-y-1 mt-1">
                                  {activeCampaign.artistDetails?.socialLinks?.instagram && (
                                    <p className="text-sm">
                                      <span className="font-medium">Instagram:</span>{' '}
                                      <a 
                                        href={activeCampaign.artistDetails.socialLinks.instagram} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="text-primary hover:underline"
                                      >
                                        {activeCampaign.artistDetails.socialLinks.instagram}
                                      </a>
                                    </p>
                                  )}
                                  
                                  {activeCampaign.artistDetails?.socialLinks?.tiktok && (
                                    <p className="text-sm">
                                      <span className="font-medium">TikTok:</span>{' '}
                                      <a 
                                        href={activeCampaign.artistDetails.socialLinks.tiktok} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="text-primary hover:underline"
                                      >
                                        {activeCampaign.artistDetails.socialLinks.tiktok}
                                      </a>
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-6">
                        <h3 className="text-lg font-medium mb-4">Campaign Details</h3>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Budget</p>
                            <p className="font-medium">
                              ${activeCampaign.campaignDetails?.budget?.toLocaleString() || '0'}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-500">Duration</p>
                            <p className="font-medium">
                              {activeCampaign.campaignDetails?.duration || '0'} days
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-500">Estimated Videos</p>
                            <p className="font-medium">
                              {Math.floor(activeCampaign.campaignDetails?.budget / 100) + 
                                Math.floor((activeCampaign.campaignDetails?.budget / 1000) * 2) || '0'}
                            </p>
                          </div>
                        </div>
                        
                        {/* Show creator targeting if available */}
                        {activeCampaign.campaignDetails?.creatorTargeting && (
                          <div className="mt-4 border-t border-gray-200 pt-4">
                            <h4 className="font-medium mb-2">Creator Targeting</h4>
                            
                            {activeCampaign.campaignDetails.creatorTargeting.creatorTypes?.length > 0 && (
                              <div className="mb-3">
                                <p className="text-sm text-gray-500">Creator Types</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {activeCampaign.campaignDetails.creatorTargeting.creatorTypes.map(type => (
                                    <span key={type} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                                      {type}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {activeCampaign.campaignDetails.creatorTargeting.audienceAge?.length > 0 && (
                              <div className="mb-3">
                                <p className="text-sm text-gray-500">Target Age</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {activeCampaign.campaignDetails.creatorTargeting.audienceAge.map(age => (
                                    <span key={age} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                      {age}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="mb-6">
                        <Input
                          type="textarea"
                          id="reviewNotes"
                          name="reviewNotes"
                          label="Review Notes"
                          value={reviewNotes}
                          onChange={handleNotesChange}
                          placeholder="Add notes (required for rejection)"
                          rows={4}
                        />
                      </div>
                      
                      <div className="flex justify-between">
                        <Button
                          type="button"
                          variant="danger"
                          onClick={handleRejectCampaign}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? 'Submitting...' : 'Reject Campaign'}
                        </Button>
                        
                        <Button
                          type="button"
                          variant="success"
                          onClick={handleApproveCampaign}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? 'Submitting...' : 'Approve Campaign'}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-6 text-center py-16">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <h3 className="text-xl font-medium mb-2">No Campaign Selected</h3>
                  <p className="text-gray-500">
                    Select a {activeTab === 'drafts' ? 'draft' : 'pending'} campaign from the list to review it.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Active Campaigns Tab */}
        {activeTab === 'active' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Active Campaigns List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4">Active Campaigns</h2>
                
                {loading ? (
                  <div className="py-10 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="mt-2 text-gray-500">Loading campaigns...</p>
                  </div>
                ) : activeCampaigns.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {activeCampaigns.map(campaign => (
                      <div 
                        key={campaign.id} 
                        className={`py-4 cursor-pointer ${
                          selectedCampaign?.id === campaign.id ? 'bg-primary bg-opacity-10' : ''
                        }`}
                        onClick={() => handleSelectCampaign(campaign)}
                      >
                        <h3 className="font-medium">{campaign.songDetails?.title || 'Untitled Campaign'}</h3>
                        <p className="text-sm text-gray-500">{campaign.artistDetails?.name || 'Unknown Artist'}</p>
                        <div className="flex justify-between mt-2">
                          <p className="text-xs text-gray-400">Budget: ${campaign.campaignDetails?.budget}</p>
                          <p className="text-xs text-gray-400">Videos: {campaignVideos.length}/{Math.floor(campaign.campaignDetails?.budget / 100) + Math.floor((campaign.campaignDetails?.budget / 1000) * 2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-10 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-600">No active campaigns found.</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Right Column - Campaign Management */}
            <div className="lg:col-span-2">
              {selectedCampaign ? (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-xl font-bold">{selectedCampaign.songDetails?.title || 'Untitled Campaign'}</h2>
                      <p className="text-gray-600">{selectedCampaign.artistDetails?.name || 'Unknown Artist'}</p>
                    </div>
                    
                    <Button
                      type="button"
                      variant="primary"
                      onClick={handleShowAddVideo}
                    >
                      Add TikTok Video
                    </Button>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="text-lg font-medium mb-2">Campaign Videos</h3>
                    
                    {campaignVideos.length > 0 ? (
                      <VideosList videos={campaignVideos} isAdmin={true} />
                    ) : (
                      <div className="py-6 text-center bg-gray-50 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <p className="text-gray-600 mb-2">No videos added to this campaign yet.</p>
                        <p className="text-gray-500 text-sm">Click "Add TikTok Video" to add content creators' videos.</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-6 text-center py-16">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <h3 className="text-xl font-medium mb-2">No Campaign Selected</h3>
                  <p className="text-gray-500">
                    Select an active campaign from the list to manage its videos.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Add Video Modal */}
        {showAddVideoModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              {/* Background overlay */}
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowAddVideoModal(false)}></div>
              
              {/* Modal panel */}
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                        Add TikTok Video
                      </h3>
                      
                      <div className="mt-4">
                        <Input
                          type="url"
                          id="videoUrl"
                          name="videoUrl"
                          label="TikTok Video URL"
                          value={videoUrl}
                          onChange={handleVideoUrlChange}
                          placeholder="https://www.tiktok.com/@username/video/1234567890123456789"
                          error={videoError}
                          required
                          className="mb-4"
                        />
                        
                        <Input
                          type="text"
                          id="videoCaption"
                          name="videoCaption"
                          label="Caption (Optional)"
                          value={videoCaption}
                          onChange={handleVideoCaptionChange}
                          placeholder="Enter caption or leave blank to use original caption"
                          className="mb-4"
                        />
                        
                        <p className="text-sm text-gray-500 mb-2">
                          Note: We will automatically fetch video metrics and creator details from TikTok.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleAddVideo}
                    disabled={addingVideo || !videoUrl}
                    className="w-full sm:w-auto sm:ml-3"
                  >
                    {addingVideo ? 'Adding...' : 'Add Video'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddVideoModal(false)}
                    className="w-full mt-3 sm:mt-0 sm:w-auto"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <footer className="bg-white py-6 border-t mt-8">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} SoundTik. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default AdminPanel;