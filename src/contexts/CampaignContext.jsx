import React, { createContext, useState, useEffect, useCallback } from 'react';
import { 
  getUserCampaigns, 
  getCampaign, 
  getCampaignMetrics, 
  getCampaignVideos, 
  updateCampaignMetricsFromVideos,
  submitCampaign 
} from '../firebase/firestore';
import { useAuth } from '../hooks/useAuth';

// Create the context
export const CampaignContext = createContext();

/**
 * Campaign Provider component for managing campaign state
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export const CampaignProvider = ({ children }) => {
  const { currentUser } = useAuth();
  
  // State for user's campaigns
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for active campaign
  const [activeCampaign, setActiveCampaign] = useState(null);
  const [campaignMetrics, setCampaignMetrics] = useState(null);
  const [campaignVideos, setCampaignVideos] = useState([]);
  const [activeCampaignLoading, setActiveCampaignLoading] = useState(false);

  // Fetch user's campaigns when user changes
  useEffect(() => {
    const fetchCampaigns = async () => {
      if (!currentUser) {
        setCampaigns([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const userCampaigns = await getUserCampaigns(currentUser.uid);
        setCampaigns(userCampaigns);
        setError(null);
      } catch (err) {
        console.error('Error fetching campaigns:', err);
        setError('Failed to load campaigns');
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, [currentUser]);

  /**
   * Refresh user campaigns data
   */
  const refreshCampaigns = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const userCampaigns = await getUserCampaigns(currentUser.uid);
      setCampaigns(userCampaigns);
      setError(null);
    } catch (err) {
      console.error('Error refreshing campaigns:', err);
      setError('Failed to refresh campaigns');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  /**
   * Set active campaign by ID and load its data
   * @param {string} campaignId - Campaign ID to set as active
   */
  const loadCampaignDetails = useCallback(async (campaignId) => {
    try {
      setActiveCampaignLoading(true);
      
      // Fetch campaign details
      const campaignData = await getCampaign(campaignId);
      setActiveCampaign(campaignData);
      
      // Fetch campaign metrics
      const metrics = await getCampaignMetrics(campaignId);
      setCampaignMetrics(metrics);
      
      // Fetch campaign videos
      const videos = await getCampaignVideos(campaignId);
      setCampaignVideos(videos);
      
      // Update campaign metrics based on the actual videos
      if (videos.length > 0) {
        await updateCampaignMetricsFromVideos(campaignId);
        
        // Refetch metrics to get the updated values
        const updatedMetrics = await getCampaignMetrics(campaignId);
        setCampaignMetrics(updatedMetrics);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error loading campaign details:', err);
      setError('Failed to load campaign details');
    } finally {
      setActiveCampaignLoading(false);
    }
  }, []);

  /**
   * Refresh active campaign data
   */
  const refreshActiveCampaign = useCallback(async () => {
    if (!activeCampaign) return;
    
    try {
      setActiveCampaignLoading(true);
      
      // Refresh campaign details
      const campaignData = await getCampaign(activeCampaign.id);
      setActiveCampaign(campaignData);
      
      // Refresh campaign videos
      const videos = await getCampaignVideos(activeCampaign.id);
      setCampaignVideos(videos);
      
      // Update campaign metrics based on the refreshed videos
      await updateCampaignMetricsFromVideos(activeCampaign.id);
      
      // Refresh campaign metrics
      const metrics = await getCampaignMetrics(activeCampaign.id);
      setCampaignMetrics(metrics);
      
      setError(null);
    } catch (err) {
      console.error('Error refreshing active campaign:', err);
      setError('Failed to refresh campaign data');
    } finally {
      setActiveCampaignLoading(false);
    }
  }, [activeCampaign]);

  /**
   * Submit a campaign for approval
   * @param {string} campaignId - Campaign ID to submit
   */
  const submitCampaignForApproval = useCallback(async (campaignId) => {
    try {
      await submitCampaign(campaignId);
      
      // Update local campaigns list
      setCampaigns(prevCampaigns => {
        return prevCampaigns.map(campaign => {
          if (campaign.id === campaignId) {
            return {
              ...campaign,
              status: 'pending',
              submittedAt: new Date()
            };
          }
          return campaign;
        });
      });
      
      // If this is the active campaign, update it too
      if (activeCampaign && activeCampaign.id === campaignId) {
        setActiveCampaign({
          ...activeCampaign,
          status: 'pending',
          submittedAt: new Date()
        });
      }
      
      return true;
    } catch (err) {
      console.error('Error submitting campaign:', err);
      setError('Failed to submit campaign for approval');
      return false;
    }
  }, [activeCampaign]);

  /**
   * Get a single campaign by ID
   * @param {string} campaignId - Campaign ID to get
   * @returns {Object|null} - Campaign data or null if not found
   */
  const getCampaignById = useCallback((campaignId) => {
    return campaigns.find(campaign => campaign.id === campaignId) || null;
  }, [campaigns]);

  /**
   * Clear active campaign
   */
  const clearActiveCampaign = useCallback(() => {
    setActiveCampaign(null);
    setCampaignMetrics(null);
    setCampaignVideos([]);
  }, []);

  // Context value
  const value = {
    campaigns,
    loading,
    error,
    activeCampaign,
    campaignMetrics,
    campaignVideos,
    activeCampaignLoading,
    refreshCampaigns,
    loadCampaignDetails,
    refreshActiveCampaign,
    submitCampaignForApproval,
    getCampaignById,
    clearActiveCampaign,
    setError,
  };

  return (
    <CampaignContext.Provider value={value}>
      {children}
    </CampaignContext.Provider>
  );
};

export default CampaignContext;