import React from 'react';
import PropTypes from 'prop-types';
import { useCampaign } from '../../hooks/useCampaign';

/**
 * Engagement statistics component - displays engagement rates and comparisons to benchmarks
 * @param {Object} props - Component props
 */
const EngagementStats = ({ metrics }) => {
  const { activeCampaignLoading, activeCampaign } = useCampaign();
  
  // Calculate engagement metrics with safe handling for null/undefined values
  const calculateEngagementRate = () => {
    if (!metrics?.summary) return 0;
    
    const { views, likes, comments, shares } = metrics.summary;
    if (!views || views === 0) return 0;
    
    // Engagement rate = (likes + comments + shares) / views * 100
    const total = (likes || 0) + (comments || 0) + (shares || 0);
    const rate = (total / views) * 100;
    return parseFloat(rate) || 0; // Ensure it's a number
  };
  
  // Format percentage value, ensuring it's a number
  const formatPercentage = (value, precision = 2) => {
    const numValue = parseFloat(value);
    return isNaN(numValue) ? '0.00%' : `${numValue.toFixed(precision)}%`;
  };
  
  // Get engagement rate compared to industry average
  const getEngagementComparison = () => {
    const rate = calculateEngagementRate();
    
    // TikTok industry average engagement rates by category
    const industryAverages = {
      dance: 5.3,
      music: 4.8,
      comedy: 5.7,
      lifestyle: 4.2,
      fashion: 3.9,
      beauty: 4.1,
      fitness: 4.5,
      gaming: 4.3,
      default: 4.7 // Overall TikTok average
    };
    
    // Get the primary creator type from targeting if available
    const primaryType = activeCampaign?.campaignDetails?.creatorTargeting?.creatorTypes?.[0] || 'default';
    
    // Get the relevant industry average
    const industryAverage = industryAverages[primaryType] || industryAverages.default;
    
    const difference = rate - industryAverage;
    const percentDifference = (difference / industryAverage) * 100;
    
    return {
      rate,
      industryAverage,
      difference,
      percentDifference: isNaN(percentDifference) ? 0 : percentDifference,
      isAboveAverage: difference > 0,
      category: primaryType !== 'default' ? primaryType : 'all categories'
    };
  };
  
  // Get color class based on comparison
  const getComparisonColorClass = (isAboveAverage) => {
    return isAboveAverage ? 'text-success' : 'text-error';
  };
  
  // Engagement comparison data
  const comparison = getEngagementComparison();
  
  // Engagement breakdown
  const getEngagementBreakdown = () => {
    if (!metrics?.summary) {
      return {
        likeRate: 0,
        commentRate: 0,
        shareRate: 0
      };
    }
    
    const { views, likes = 0, comments = 0, shares = 0 } = metrics.summary;
    if (!views || views === 0) {
      return {
        likeRate: 0,
        commentRate: 0,
        shareRate: 0
      };
    }
    
    return {
      likeRate: ((likes / views) * 100).toFixed(2),
      commentRate: ((comments / views) * 100).toFixed(2),
      shareRate: ((shares / views) * 100).toFixed(2)
    };
  };
  
  // Get shareability score (higher share rate indicates better shareability)
  const getShareabilityScore = () => {
    const breakdown = getEngagementBreakdown();
    const shareRate = parseFloat(breakdown.shareRate);
    
    // TikTok shareability benchmarks
    if (shareRate >= 2.0) return { score: 'Excellent', color: 'text-green-600' };
    if (shareRate >= 1.0) return { score: 'Good', color: 'text-green-500' };
    if (shareRate >= 0.5) return { score: 'Average', color: 'text-yellow-500' };
    if (shareRate >= 0.2) return { score: 'Below Average', color: 'text-orange-500' };
    return { score: 'Poor', color: 'text-red-500' };
  };
  
  // Get audience resonance score (based on comment rate - comments show deeper engagement)
  const getResonanceScore = () => {
    const breakdown = getEngagementBreakdown();
    const commentRate = parseFloat(breakdown.commentRate);
    
    // Comment rate benchmarks
    if (commentRate >= 1.5) return { score: 'Excellent', color: 'text-green-600' };
    if (commentRate >= 0.8) return { score: 'Good', color: 'text-green-500' };
    if (commentRate >= 0.4) return { score: 'Average', color: 'text-yellow-500' };
    if (commentRate >= 0.2) return { score: 'Below Average', color: 'text-orange-500' };
    return { score: 'Poor', color: 'text-red-500' };
  };
  
  // Get like-to-view ratio quality
  const getLikeRatioQuality = () => {
    const breakdown = getEngagementBreakdown();
    const likeRate = parseFloat(breakdown.likeRate);
    
    // Like rate benchmarks
    if (likeRate >= 10) return { score: 'Excellent', color: 'text-green-600' };
    if (likeRate >= 7) return { score: 'Good', color: 'text-green-500' };
    if (likeRate >= 4) return { score: 'Average', color: 'text-yellow-500' };
    if (likeRate >= 2) return { score: 'Below Average', color: 'text-orange-500' };
    return { score: 'Poor', color: 'text-red-500' };
  };
  
  const breakdown = getEngagementBreakdown();
  const shareabilityScore = getShareabilityScore();
  const resonanceScore = getResonanceScore();
  const likeRatioQuality = getLikeRatioQuality();
  
  return (
    <div className="bg-white rounded-lg shadow-md p-5">
      <h3 className="text-lg font-bold mb-4">Engagement Analysis</h3>
      
      {activeCampaignLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : metrics?.summary ? (
        <div className="space-y-6">
          {/* Overall Engagement Rate */}
          <div className="text-center py-4">
            <h4 className="text-base font-medium mb-1">Overall Engagement Rate</h4>
            <p className="text-3xl font-bold text-primary">{formatPercentage(comparison.rate)}</p>
            
            <div className={`flex items-center justify-center mt-2 ${getComparisonColorClass(comparison.isAboveAverage)}`}>
              {comparison.isAboveAverage ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
              <span className="text-sm font-medium">
                {formatPercentage(Math.abs(comparison.percentDifference), 1)} {comparison.isAboveAverage ? 'above' : 'below'} average for {comparison.category}
              </span>
            </div>
          </div>
          
          {/* Engagement Breakdown */}
          <div className="mb-4">
            <h4 className="text-base font-medium mb-3">Engagement Breakdown</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <p className="text-sm font-medium">Like Rate</p>
                <p className="text-lg font-bold">{breakdown.likeRate}%</p>
                <p className={`text-xs ${likeRatioQuality.color}`}>{likeRatioQuality.score}</p>
              </div>
              
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 text-purple-600 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-sm font-medium">Comment Rate</p>
                <p className="text-lg font-bold">{breakdown.commentRate}%</p>
                <p className={`text-xs ${resonanceScore.color}`}>{resonanceScore.score}</p>
              </div>
              
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-600 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </div>
                <p className="text-sm font-medium">Share Rate</p>
                <p className="text-lg font-bold">{breakdown.shareRate}%</p>
                <p className={`text-xs ${shareabilityScore.color}`}>{shareabilityScore.score}</p>
              </div>
            </div>
          </div>
          
          {/* Industry Benchmark Comparison */}
          <div className="mb-4">
            <h4 className="text-base font-medium mb-2">TikTok Industry Comparison</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between mb-1">
                <span className="text-sm">Your campaign</span>
                <span className="text-sm font-medium">{formatPercentage(comparison.rate)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                <div 
                  className="bg-primary h-2 rounded-full"
                  style={{ width: `${Math.min(100, comparison.rate * 10)}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between mb-1">
                <span className="text-sm">{comparison.category} average</span>
                <span className="text-sm font-medium">{formatPercentage(comparison.industryAverage)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gray-500 h-2 rounded-full"
                  style={{ width: `${Math.min(100, comparison.industryAverage * 10)}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          {/* Engagement Performance Analysis */}
          <div className="mb-4">
            <h4 className="text-base font-medium mb-2">Performance Analysis</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="text-sm font-medium mb-2">Content Resonance</h5>
                <div className="flex items-center">
                  <div className="w-2/5">
                    <div className={`text-center p-2 rounded ${resonanceScore.color.replace('text-', 'bg-').replace('-600', '-100').replace('-500', '-100')}`}>
                      <span className={`text-lg font-bold ${resonanceScore.color}`}>{resonanceScore.score}</span>
                    </div>
                  </div>
                  <div className="w-3/5 pl-4">
                    <p className="text-xs text-gray-600">
                      Based on comment rate. Comments indicate deeper engagement and interest in the content.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="text-sm font-medium mb-2">Content Shareability</h5>
                <div className="flex items-center">
                  <div className="w-2/5">
                    <div className={`text-center p-2 rounded ${shareabilityScore.color.replace('text-', 'bg-').replace('-600', '-100').replace('-500', '-100')}`}>
                      <span className={`text-lg font-bold ${shareabilityScore.color}`}>{shareabilityScore.score}</span>
                    </div>
                  </div>
                  <div className="w-3/5 pl-4">
                    <p className="text-xs text-gray-600">
                      Based on share rate. Shares expand your reach by exposing your content to new audiences.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Tips */}
          <div className="mt-4 p-4 bg-blue-50 rounded-md text-sm text-blue-700">
            <p className="font-medium mb-1">TikTok Engagement Tips:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Higher engagement rates indicate stronger audience interest and better content resonance.</li>
              <li>TikTok engagement rates are typically higher than other platforms, with 5-6% considered average.</li>
              <li>Share rates above 1% are particularly valuable for expanding your music's reach.</li>
              <li>Content trends change rapidly on TikTok—constantly refreshing content is key to maintaining engagement.</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-gray-600 mb-2">
            No engagement data is available yet.
          </p>
          <p className="text-sm text-gray-500">
            Engagement statistics will appear here once TikTok videos featuring your music begin generating interactions.
          </p>
        </div>
      )}
    </div>
  );
};

EngagementStats.propTypes = {
  metrics: PropTypes.shape({
    summary: PropTypes.shape({
      views: PropTypes.number,
      likes: PropTypes.number,
      comments: PropTypes.number,
      shares: PropTypes.number,
      engagement: PropTypes.number
    })
  })
};

export default EngagementStats;