import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { getUserCampaigns } from '../firebase/firestore';

/**
 * Custom hook to fetch and manage user campaigns
 * @returns {Object} campaigns, loading state, and refresh function
 */
export const useCampaign = () => {
  const { currentUser } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetch campaigns for the current user
   */
  const fetchCampaigns = useCallback(async () => {
    if (!currentUser?.uid) {
      console.log('Cannot fetch campaigns: No current user');
      setCampaigns([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching campaigns for user:', currentUser.uid);
      const userCampaigns = await getUserCampaigns(currentUser.uid);
      
      // Log all campaign IDs for debugging
      console.log('Campaigns loaded:', userCampaigns.length, 'campaigns');
      if (userCampaigns.length > 0) {
        console.log('Campaign IDs:', userCampaigns.map(c => c.id).join(', '));
      }
      
      setCampaigns(userCampaigns);
    } catch (err) {
      console.error('Error fetching campaigns in hook:', err);
      setError(err.message || 'Failed to load campaigns');
      
      // Don't clear campaigns on error to prevent UI flashing
      // If we already had campaigns, keep showing them
      if (campaigns.length === 0) {
        setCampaigns([]);
      }
    } finally {
      setLoading(false);
    }
  }, [currentUser, campaigns.length]);

  // Initial load and reload on user change
  useEffect(() => {
    fetchCampaigns();
    
    // Set up polling for updates every 60 seconds (optional)
    const intervalId = setInterval(() => {
      fetchCampaigns();
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, [fetchCampaigns, currentUser?.uid]);

  // Public method to manually refresh campaigns
  const refreshCampaigns = useCallback(() => {
    console.log('Manual campaign refresh requested');
    fetchCampaigns();
  }, [fetchCampaigns]);

  return { 
    campaigns, 
    loading, 
    error, 
    refreshCampaigns,
    // Additional helper for debugging
    _debugInfo: {
      userLoggedIn: !!currentUser,
      userId: currentUser?.uid,
      campaignsCount: campaigns.length
    }
  };
};

export default useCampaign;