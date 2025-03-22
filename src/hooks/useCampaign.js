import { useContext } from 'react';
import { CampaignContext } from '../contexts/CampaignContext';

/**
 * Custom hook to access campaign context
 * @returns {Object} Campaign context values and methods
 * @property {Array} campaigns - List of user's campaigns
 * @property {boolean} loading - Whether campaigns are loading
 * @property {string|null} error - Error message
 * @property {Object|null} activeCampaign - Currently active campaign
 * @property {Object|null} campaignMetrics - Metrics for active campaign
 * @property {Array} campaignVideos - Videos for active campaign
 * @property {boolean} activeCampaignLoading - Whether active campaign is loading
 * @property {Function} refreshCampaigns - Refresh user's campaigns
 * @property {Function} loadCampaignDetails - Load details for a campaign
 * @property {Function} refreshActiveCampaign - Refresh active campaign data
 * @property {Function} clearActiveCampaign - Clear active campaign
 * @property {Function} setError - Set error message
 */
export const useCampaign = () => {
  const campaign = useContext(CampaignContext);
  
  if (!campaign) {
    throw new Error('useCampaign must be used within a CampaignProvider');
  }
  
  return campaign;
};