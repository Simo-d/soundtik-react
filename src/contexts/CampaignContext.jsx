import React, { createContext, useState, useEffect, useCallback } from 'react';
import { getUserCampaigns, getCampaign, getCampaignMetrics, getCampaignVideos } from '../firebase/firestore';
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
      
      // Refresh campaign metrics
      const metrics = await getCampaignMetrics(activeCampaign.id);
      setCampaignMetrics(metrics);
      
      // Refresh campaign videos
      const videos = await getCampaignVideos(activeCampaign.id);
      setCampaignVideos(videos);
      
      setError(null);
    } catch (err) {
      console.error('Error refreshing active campaign:', err);
      setError('Failed to refresh campaign data');
    } finally {
      setActiveCampaignLoading(false);
    }
  }, [activeCampaign]);

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