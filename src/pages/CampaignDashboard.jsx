import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCampaign } from '../hooks/useCampaign';
import { useAuth } from '../hooks/useAuth';
import { logPageView } from '../firebase/analytics';
import Navbar from '../components/common/Navbar';
import Button from '../components/common/Button';
import PerformanceMetrics from '../components/dashboard/PerformanceMetrics';
import VideosList from '../components/dashboard/VideosList';
import MetricChart from '../components/dashboard/MetricChart';
import AudienceInsights from '../components/dashboard/AudienceInsights';
import EngagementStats from '../components/dashboard/EngagementStats';
import CampaignStatus from '../components/campaign/CampaignStatus';
import AudioPlayer from '../components/common/AudioPlayer';

/**
 * Campaign Dashboard Page - Displays campaign details and performance metrics
 */
const CampaignDashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { 
    activeCampaign,
    campaignMetrics,
    campaignVideos,
    activeCampaignLoading,
    loadCampaignDetails,
    refreshActiveCampaign,
    error,
    setError
  } = useCampaign();
  
  // UI state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('metrics'); // 'metrics', 'videos', 'details'
  
  // Load campaign details on mount
  useEffect(() => {
    if (id && currentUser) {
      loadCampaignDetails(id);
    }
    
    logPageView('Campaign Dashboard');
  }, [id, currentUser, loadCampaignDetails]);
  
  // Refresh campaign data
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshActiveCampaign();
    setIsRefreshing(false);
  };
  
  // Check if user owns the campaign
  const isOwner = activeCampaign?.userId === currentUser?.uid;
  
  // Calculate metrics for video progress
  const calculateCompletionMetrics = () => {
    if (!activeCampaign?.campaignDetails?.budget) return { total: 0, completed: 0, percentage: 0 };
    
    const budget = activeCampaign.campaignDetails.budget;
    // Formula: 1 video per $100, with slight scaling for larger budgets
    const totalVideos = Math.floor(budget / 100) + Math.floor((budget / 1000) * 2);
    const completedVideos = campaignVideos?.length || 0;
    const percentage = Math.min(100, Math.round((completedVideos / totalVideos) * 100));
    
    return { total: totalVideos, completed: completedVideos, percentage };
  };
  
  const completionMetrics = calculateCompletionMetrics();
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Get campaign progress status
  const getCampaignProgressStatus = () => {
    if (!activeCampaign) return 'inactive';
    
    switch (activeCampaign.status) {
      case 'active':
        return 'in-progress';
      case 'completed':
        return 'completed';
      case 'rejected':
        return 'rejected';
      case 'pending':
        return 'pending';
      default:
        return 'draft';
    }
  };
  
  // If campaign not found or not owned by the user
  if (!activeCampaignLoading && (!activeCampaign || !isOwner)) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="max-w-xl mx-auto bg-white rounded-lg shadow-md p-6 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h1 className="text-2xl font-bold mb-4">Campaign Not Found</h1>
            <p className="text-gray-600 mb-6">
              The campaign you're looking for doesn't exist or you don't have access to it.
            </p>
            <Button
              variant="primary"
              onClick={() => navigate('/create-campaign')}
            >
              Create a New Campaign
            </Button>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {activeCampaignLoading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Campaign Header */}
            <div className="mb-8">
              <div className="flex justify-between items-center flex-wrap gap-4 mb-4">
                <div>
                  <h1 className="text-3xl font-bold">
                    {activeCampaign?.songDetails?.title || 'Campaign Dashboard'}
                  </h1>
                  <p className="text-gray-600">
                    {activeCampaign?.artistDetails?.name || 'Artist'}
                  </p>
                </div>
                
                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="flex items-center"
                  >
                    {isRefreshing ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-b-2 border-primary rounded-full mr-2"></div>
                        Refreshing...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh Data
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              {/* Campaign summary stats boxes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow p-4">
                  <p className="text-sm text-gray-500 mb-1">Budget</p>
                  <p className="text-2xl font-bold">{formatCurrency(activeCampaign?.campaignDetails?.budget || 0)}</p>
                </div>
                
                <div className="bg-white rounded-lg shadow p-4">
                  <p className="text-sm text-gray-500 mb-1">Total Views</p>
                  <p className="text-2xl font-bold">{(campaignMetrics?.summary?.views || 0).toLocaleString()}</p>
                </div>
                
                <div className="bg-white rounded-lg shadow p-4">
                  <p className="text-sm text-gray-500 mb-1">TikTok Videos</p>
                  <div className="flex items-end justify-between">
                    <p className="text-2xl font-bold">{completionMetrics.completed}/{completionMetrics.total}</p>
                    <p className="text-sm text-gray-500">{completionMetrics.percentage}% of planned videos</p>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${completionMetrics.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Error Alert */}
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
            
            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex space-x-8">
                <button
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'metrics'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('metrics')}
                >
                  Performance Metrics
                </button>
                <button
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'videos'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('videos')}
                >
                  TikTok Videos
                </button>
                <button
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'details'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('details')}
                >
                  Campaign Details
                </button>
              </nav>
            </div>
            
            {/* Metrics Tab Content */}
            {activeTab === 'metrics' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                  <PerformanceMetrics metrics={campaignMetrics} />
                  <MetricChart dailyMetrics={campaignMetrics?.dailyMetrics || []} />
                </div>
                
                {/* Right Column */}
                <div className="space-y-6">
                  <CampaignStatus campaign={activeCampaign} />
                  <EngagementStats metrics={campaignMetrics} />
                  <AudienceInsights metrics={campaignMetrics} />
                </div>
              </div>
            )}
            
            {/* Videos Tab Content */}
            {activeTab === 'videos' && (
              <div>
                <VideosList videos={campaignVideos} />
              </div>
            )}
            
            {/* Details Tab Content */}
            {activeTab === 'details' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Campaign Info */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-bold mb-4">Campaign Details</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <h3 className="text-lg font-medium mb-3">Song Details</h3>
                        
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
                                artist={activeCampaign.artistDetails?.name}
                                showThumbnail={!!activeCampaign.songDetails?.coverArtUrl}
                                thumbnail={activeCampaign.songDetails?.coverArtUrl}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-3">Artist Details</h3>
                        
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
                        </div>
                        
                        {/* Social Links */}
                        {Object.values(activeCampaign.artistDetails?.socialLinks || {}).some(link => link) && (
                          <div className="mt-4">
                            <p className="text-sm text-gray-500 mb-2">Social Links</p>
                            <div className="space-y-2">
                              {activeCampaign.artistDetails?.socialLinks?.instagram && (
                                <a 
                                  href={activeCampaign.artistDetails.socialLinks.instagram}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center text-primary hover:underline"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                  </svg>
                                  Instagram
                                </a>
                              )}
                              
                              {activeCampaign.artistDetails?.socialLinks?.tiktok && (
                                <a 
                                  href={activeCampaign.artistDetails.socialLinks.tiktok}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center text-primary hover:underline"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                                  </svg>
                                  TikTok
                                </a>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h3 className="text-lg font-medium mb-3">Campaign Settings</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Budget</p>
                          <p className="font-medium">{formatCurrency(activeCampaign.campaignDetails?.budget || 0)}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500">Duration</p>
                          <p className="font-medium">{activeCampaign.campaignDetails?.duration || 0} days</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Right Column - Status */}
                <div>
                  <CampaignStatus campaign={activeCampaign} />
                </div>
              </div>
            )}
          </>
        )}
      </main>
      
      <footer className="bg-white py-6 border-t">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} SoundTik. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default CampaignDashboard;