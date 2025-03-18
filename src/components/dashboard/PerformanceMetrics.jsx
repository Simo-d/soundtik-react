import React from 'react';
import PropTypes from 'prop-types';
import { useCampaign } from '../../hooks/useCampaign';

/**
 * Performance metrics component - displays campaign metrics in dashboard
 * @param {Object} props - Component props
 */
const PerformanceMetrics = ({ metrics }) => {
  const { activeCampaignLoading } = useCampaign();
  
  // Placeholder metrics for new campaigns or when metrics are loading
  const placeholderMetrics = {
    views: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    follows: 0,
    engagement: 0
  };
  
  // Use provided metrics or placeholders
  const campaignMetrics = metrics?.summary || placeholderMetrics;
  
  // Calculate percentage for engagement
  const engagementPercentage = campaignMetrics.engagement ? 
    campaignMetrics.engagement.toFixed(2) + '%' : 
    '0%';
    
  // Format numbers with commas
  const formatNumber = (num) => {
    return num?.toLocaleString() || '0';
  };
  
  // Define metrics cards
  const metricCards = [
    {
      title: 'Views',
      value: formatNumber(campaignMetrics.views),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )
    },
    {
      title: 'Likes',
      value: formatNumber(campaignMetrics.likes),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    },
    {
      title: 'Comments',
      value: formatNumber(campaignMetrics.comments),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      )
    },
    {
      title: 'Shares',
      value: formatNumber(campaignMetrics.shares),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      )
    },
    {
      title: 'New Followers',
      value: formatNumber(campaignMetrics.follows),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      )
    },
    {
      title: 'Engagement Rate',
      value: engagementPercentage,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    }
  ];
  
  return (
    <div className="bg-white rounded-lg shadow-md p-5">
      <h3 className="text-lg font-bold mb-4">Performance Metrics</h3>
      
      {activeCampaignLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {metricCards.map((card, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0 mr-3 text-primary">
                  {card.icon}
                </div>
                <div>
                  <p className="text-sm text-gray-500">{card.title}</p>
                  <p className="text-xl font-bold">{card.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {!activeCampaignLoading && !metrics?.summary && (
        <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded text-sm">
          <p>Metrics will appear here once your campaign is active and starts generating engagement.</p>
        </div>
      )}
    </div>
  );
};

PerformanceMetrics.propTypes = {
  metrics: PropTypes.shape({
    summary: PropTypes.shape({
      views: PropTypes.number,
      likes: PropTypes.number,
      comments: PropTypes.number,
      shares: PropTypes.number,
      follows: PropTypes.number,
      engagement: PropTypes.number
    })
  })
};

export default PerformanceMetrics;