import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { formatDistanceToNow } from 'date-fns';
import { useCampaign } from '../../hooks/useCampaign';
import Button from '../common/Button';

/**
 * Videos list component - displays created TikTok videos in dashboard
 * @param {Object} props - Component props
 */
const VideosList = ({ videos = [] }) => {
  const { activeCampaignLoading } = useCampaign();
  const [selectedVideo, setSelectedVideo] = useState(null);
  
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
  
  // Render video details modal
  const renderVideoModal = () => {
    if (!selectedVideo) return null;
    
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
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    Video Details
                  </h3>
                  
                  <div className="mt-4">
                    {selectedVideo.thumbnail && (
                      <img 
                        src={selectedVideo.thumbnail} 
                        alt="Video thumbnail" 
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                    )}
                    
                    <div className="mb-4">
                      <h4 className="font-medium">Caption</h4>
                      <p className="text-gray-700">{selectedVideo.caption || 'No caption available'}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="text-sm text-gray-500">Views</h4>
                        <p className="font-medium">{formatNumber(selectedVideo.metrics?.views)}</p>
                      </div>
                      <div>
                        <h4 className="text-sm text-gray-500">Likes</h4>
                        <p className="font-medium">{formatNumber(selectedVideo.metrics?.likes)}</p>
                      </div>
                      <div>
                        <h4 className="text-sm text-gray-500">Comments</h4>
                        <p className="font-medium">{formatNumber(selectedVideo.metrics?.comments)}</p>
                      </div>
                      <div>
                        <h4 className="text-sm text-gray-500">Shares</h4>
                        <p className="font-medium">{formatNumber(selectedVideo.metrics?.shares)}</p>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="text-sm text-gray-500">Created</h4>
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
      <h3 className="text-lg font-bold mb-4">Campaign Videos</h3>
      
      {activeCampaignLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : videos.length > 0 ? (
        <div className="divide-y divide-gray-200">
          {videos.map((video) => (
            <div key={video.id} className="py-4 first:pt-0 last:pb-0">
              <div className="flex items-start">
                {video.thumbnail ? (
                  <img 
                    src={video.thumbnail} 
                    alt="Video thumbnail" 
                    className="w-24 h-24 object-cover rounded-md mr-4"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gray-200 rounded-md mr-4 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium text-gray-800 mb-1">
                        {video.caption ? (
                          video.caption.length > 60 ? 
                            `${video.caption.substring(0, 60)}...` : 
                            video.caption
                        ) : 'No caption'}
                      </p>
                      <p className="text-sm text-gray-500">
                        Created {formatDate(video.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium flex items-center justify-end">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {formatNumber(video.metrics?.views || 0)}
                      </p>
                      <p className="text-sm font-medium flex items-center justify-end mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        {formatNumber(video.metrics?.likes || 0)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="small"
                      onClick={() => openVideoDetails(video)}
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
    createdAt: PropTypes.any,
    metrics: PropTypes.shape({
      views: PropTypes.number,
      likes: PropTypes.number,
      comments: PropTypes.number,
      shares: PropTypes.number
    }),
    status: PropTypes.string
  }))
};

export default VideosList;