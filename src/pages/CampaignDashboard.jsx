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
              <div className="flex justify-between items-center flex-wrap gap-4">
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
            
            {/* Campaign Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-6">
                <PerformanceMetrics metrics={campaignMetrics} />
                <MetricChart dailyMetrics={campaignMetrics?.dailyMetrics || []} />
                <VideosList videos={campaignVideos} />
              </div>
              
              {/* Right Column */}
              <div className="space-y-6">
                <CampaignStatus campaign={activeCampaign} />
                <EngagementStats metrics={campaignMetrics} />
                <AudienceInsights metrics={campaignMetrics} />
              </div>
            </div>
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