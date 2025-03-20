import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { formatDistanceToNow } from 'date-fns';
import { useCampaign } from '../../hooks/useCampaign';
import Button from '../common/Button';
import { refreshVideoMetrics } from '../../firebase/functions';

/**
 * Videos list component - displays created TikTok videos in dashboard
 * @param {Object} props - Component props
 */
const VideosList = ({ videos = [], isAdmin = false }) => {
  const { activeCampaignLoading } = useCampaign();
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [refreshingVideo, setRefreshingVideo] = useState(null);
  
  // Format date for display
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return formatDistanceToNow(date, { addSuffix: true });
  };
  
  // Format numbers with commas
  const formatNumber = (num) => {
    return num?.toLocaleString() || '0';
  };
  
  // Open video details modal
  const openVideoDetails = (video) => {
    setSelectedVideo(video);
  };
  
  // Close video details modal
  const closeVideoDetails = () => {
    setSelectedVideo(null);
  };
  
  // Handle refreshing video metrics
  const handleRefreshMetrics = async (videoId, tiktokId) => {
    if (!videoId || !tiktokId) return;
    
    try {
      setRefreshingVideo(videoId);
      await refreshVideoMetrics(videoId, tiktokId);
      
      // In a real application, we would fetch the updated metrics here
      // For now, we'll just simulate a delay and show a success message
      setTimeout(() => {
        setRefreshingVideo(null);
      }, 2000);
    } catch (error) {
      console.error('Error refreshing metrics:', error);
      setRefreshingVideo(null);
    }
  };
  
  // Calculate engagement rate
  const calculateEngagementRate = (video) => {
    if (!video?.metrics?.views || video.metrics.views === 0) return 0;
    
    const { views, likes = 0, comments = 0, shares = 0 } = video.metrics;
    const totalEngagements = likes + comments + shares;
    return ((totalEngagements / views) * 100).toFixed(2);
  };
  
  // Render video details modal
  const renderVideoModal = () => {
    if (!selectedVideo) return null;
    
    const engagementRate = calculateEngagementRate(selectedVideo);
    
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          {/* Background overlay */}
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={closeVideoDetails}></div>
          
          {/* Modal panel */}
          <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 flex justify-between items-center" id="modal-title">
                    <span>Video Details</span>
                    {selectedVideo.creatorUsername && (
                      <span className="text-sm font-normal text-gray-500">
                        by @{selectedVideo.creatorUsername}
                      </span>
                    )}
                  </h3>
                  
                  <div className="mt-4">
                    <div className="flex mb-4">
                      {selectedVideo.thumbnail ? (
                        <img 
                          src={selectedVideo.thumbnail} 
                          alt="Video thumbnail" 
                          className="w-32 h-56 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-32 h-56 bg-gray-200 rounded-lg flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      
                      <div className="ml-4 flex-1">
                        <h4 className="font-medium mb-2">Performance</h4>
                        <div className="grid grid-cols-2 gap-y-2">
                          <div>
                            <p className="text-xs text-gray-500">Views</p>
                            <p className="font-medium">{formatNumber(selectedVideo.metrics?.views)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Likes</p>
                            <p className="font-medium">{formatNumber(selectedVideo.metrics?.likes)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Comments</p>
                            <p className="font-medium">{formatNumber(selectedVideo.metrics?.comments)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Shares</p>
                            <p className="font-medium">{formatNumber(selectedVideo.metrics?.shares)}</p>
                          </div>
                        </div>
                        
                        <div className="mt-2">
                          <p className="text-xs text-gray-500">Engagement Rate</p>
                          <p className="font-medium">
                            {engagementRate}%
                            <span className={`ml-2 text-xs ${parseFloat(engagementRate) > 5 ? 'text-green-600' : parseFloat(engagementRate) > 2 ? 'text-yellow-600' : 'text-red-600'}`}>
                              {parseFloat(engagementRate) > 5 ? '(Great)' : parseFloat(engagementRate) > 2 ? '(Good)' : '(Low)'}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="font-medium">Caption</h4>
                      <p className="text-gray-700 break-words">{selectedVideo.caption || 'No caption available'}</p>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm text-gray-500">Created</h4>
                        {isAdmin && (
                          <button
                            onClick={() => handleRefreshMetrics(selectedVideo.id, selectedVideo.tiktokId)}
                            className="text-primary text-sm flex items-center"
                            disabled={refreshingVideo === selectedVideo.id}
                          >
                            {refreshingVideo === selectedVideo.id ? (
                              <>
                                <span className="inline-block h-3 w-3 mr-1 rounded-full border-2 border-primary border-t-transparent animate-spin"></span>
                                Refreshing...
                              </>
                            ) : (
                              <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Refresh Metrics
                              </>
                            )}
                          </button>
                        )}
                      </div>
                      <p className="font-medium">{formatDate(selectedVideo.createdAt)}</p>
                    </div>
                    
                    {selectedVideo.url && (
                      <div className="mt-4">
                        <a 
                          href={selectedVideo.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          View on TikTok
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <Button
                type="button"
                variant="outline"
                onClick={closeVideoDetails}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Campaign Videos</h3>
        <p className="text-sm text-gray-500">
          {videos.length} video{videos.length !== 1 ? 's' : ''} total
        </p>
      </div>
      
      {activeCampaignLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : videos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {videos.map((video) => (
            <div key={video.id} className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
              <div className="flex h-full">
                {/* Thumbnail */}
                <div 
                  className="w-1/3 bg-gray-200 cursor-pointer"
                  onClick={() => openVideoDetails(video)}
                >
                  {video.thumbnail ? (
                    <img 
                      src={video.thumbnail} 
                      alt="Video thumbnail" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                
                {/* Video Info */}
                <div className="w-2/3 p-3 flex flex-col">
                  <div className="mb-2">
                    <p className="text-xs text-gray-500 truncate">
                      {video.creatorUsername ? `@${video.creatorUsername}` : 'TikTok Creator'}
                    </p>
                    <p className="font-medium text-sm line-clamp-2">
                      {video.caption ? 
                        (video.caption.length > 50 ? `${video.caption.substring(0, 50)}...` : video.caption) : 
                        'No caption'}
                    </p>
                  </div>
                  
                  <div className="flex text-xs text-gray-500 space-x-2 mb-auto">
                    <span>{formatDate(video.createdAt)}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-1 mt-2 text-xs">
                    <div>
                      <p className="text-gray-500">Views</p>
                      <p className="font-medium">{formatNumber(video.metrics?.views || 0)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Likes</p>
                      <p className="font-medium">{formatNumber(video.metrics?.likes || 0)}</p>
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="small"
                      onClick={() => openVideoDetails(video)}
                      className="w-full text-xs py-1"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-600">
            No videos have been created for this campaign yet.
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Videos will appear here once they're created and published on TikTok.
          </p>
        </div>
      )}
      
      {renderVideoModal()}
    </div>
  );
};

VideosList.propTypes = {
  videos: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    campaignId: PropTypes.string.isRequired,
    tiktokId: PropTypes.string,
    url: PropTypes.string,
    thumbnail: PropTypes.string,
    caption: PropTypes.string,
    creatorUsername: PropTypes.string,
    createdAt: PropTypes.any,
    metrics: PropTypes.shape({
      views: PropTypes.number,
      likes: PropTypes.number,
      comments: PropTypes.number,
      shares: PropTypes.number
    }),
    status: PropTypes.string
  })),
  isAdmin: PropTypes.bool
};

export default VideosList;