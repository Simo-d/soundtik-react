import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getPendingCampaigns, validateCampaign } from '../firebase/firestore';
import { logPageView } from '../firebase/analytics';
import Navbar from '../components/common/Navbar';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import AudioPlayer from '../components/common/AudioPlayer';

/**
 * Admin Panel - Allows admins to review and approve/reject campaigns
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
      } catch (err) {
        console.error('Error loading pending campaigns:', err);
        setError('Failed to load campaigns');
      } finally {
        setLoading(false);
      }
    };
    
    if (currentUser && isAdmin) {
      loadPendingCampaigns();
    }
  }, [currentUser, isAdmin]);
  
  // Set active campaign for review
  const handleReviewCampaign = (campaign) => {
    setActiveCampaign(campaign);
    setReviewNotes('');
    setSubmitSuccess(false);
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
      setError('Failed to approve campaign');
    } finally {
      setIsSubmitting(false);
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
      setError('Failed to reject campaign');
    } finally {
      setIsSubmitting(false);
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
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Pending Campaigns List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Pending Campaigns</h2>
              
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
                  <p className="text-gray-600">No pending campaigns to review.</p>
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
                        Pending Approval
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
                                
                                {activeCampaign.artistDetails?.socialLinks?.spotify && (
                                  <p className="text-sm">
                                    <span className="font-medium">Spotify:</span>{' '}
                                    <a 
                                      href={activeCampaign.artistDetails.socialLinks.spotify} 
                                      target="_blank" 
                                      rel="noreferrer"
                                      className="text-primary hover:underline"
                                    >
                                      {activeCampaign.artistDetails.socialLinks.spotify}
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
                      </div>
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
                        multiline
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
                  Select a pending campaign from the list to review it.
                </p>
              </div>
            )}
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

export default AdminPanel;