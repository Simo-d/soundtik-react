import React from 'react';
import PropTypes from 'prop-types';
import { formatDistanceToNow, format, differenceInDays } from 'date-fns';
import { useCampaign } from '../../hooks/useCampaign';

/**
 * Campaign status component - displays timeline of campaign events
 * @param {Object} props - Component props
 */
const CampaignStatus = ({ campaign }) => {
  const { campaignVideos } = useCampaign();
  
  // Early return if no campaign data
  if (!campaign) {
    return null;
  }

  // Helper function to safely convert any date format to a JavaScript Date object
  const safelyGetDate = (dateValue) => {
    if (!dateValue) return null;
    
    try {
      // Case 1: Firebase Timestamp with toDate method
      if (dateValue.toDate && typeof dateValue.toDate === 'function') {
        return dateValue.toDate();
      }
      
      // Case 2: JavaScript Date object
      if (dateValue instanceof Date) {
        return dateValue;
      }
      
      // Case 3: String or number timestamp
      const parsedDate = new Date(dateValue);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate;
      }
      
      // If we can't parse it, log and return null
      console.warn('Unable to parse date:', dateValue);
      return null;
    } catch (error) {
      console.error('Error parsing date:', error, dateValue);
      return null;
    }
  };

  // Format date for display
  const formatDate = (timestamp) => {
    if (!timestamp) return null;
    
    const date = safelyGetDate(timestamp);
    if (!date) return null;
    
    return {
      relative: formatDistanceToNow(date, { addSuffix: true }),
      exact: format(date, 'PPP') // e.g., April 29, 2021
    };
  };

  // Get status name
  const getStatusName = (status) => {
    switch (status) {
      case 'draft': return 'Draft Created';
      case 'pending': return 'Awaiting Approval';
      case 'active': return 'Campaign Active';
      case 'completed': return 'Campaign Completed';
      case 'rejected': return 'Campaign Rejected';
      default: return 'Unknown Status';
    }
  };

  // Get step color based on current campaign status
  const getStepColor = (stepName) => {
    const statusOrder = ['draft', 'pending', 'active', 'completed'];
    const currentIndex = statusOrder.indexOf(campaign.status);
    const stepIndex = statusOrder.indexOf(stepName);
    
    if (campaign.status === 'rejected') {
      return stepName === 'rejected' ? 'text-error' : 'text-gray-400';
    }
    
    if (stepIndex <= currentIndex) {
      return 'text-primary';
    }
    
    return 'text-gray-400';
  };

  // Get dates for timeline
  const createdDate = formatDate(campaign.createdAt);
  const submittedDate = formatDate(campaign.submittedAt);
  const validatedDate = formatDate(campaign.validatedAt);
  const startDate = formatDate(campaign.startDate);
  const endDate = formatDate(campaign.endDate);
  
  // Calculate video creation progress
  const calculateVideoProgress = () => {
    // Calculate total expected videos based on budget
    const budget = campaign.campaignDetails?.budget || 0;
    const totalVideos = Math.floor(budget / 100) + Math.floor((budget / 1000) * 2);
    const createdVideos = campaignVideos?.length || 0;
    const percentage = Math.min(100, Math.round((createdVideos / totalVideos) * 100));
    
    return {
      total: totalVideos,
      created: createdVideos,
      percentage
    };
  };
  
  // Calculate days remaining
  const calculateDaysRemaining = () => {
    if (!campaign.startDate || campaign.status !== 'active') {
      return null;
    }
    
    const start = safelyGetDate(campaign.startDate);
    if (!start) return null;
    
    let end;
    if (campaign.endDate) {
      end = safelyGetDate(campaign.endDate);
      if (!end) return null;
    } else {
      const campaignDuration = campaign.campaignDetails?.duration || 30; // Default to 30 if undefined
      end = new Date(start.getTime() + (campaignDuration * 86400000));
    }
    
    const now = new Date();
    
    // If campaign already ended
    if (now > end) {
      return 0;
    }
    
    return differenceInDays(end, now);
  };
  
  const videoProgress = calculateVideoProgress();
  const daysRemaining = calculateDaysRemaining();

  return (
    <div className="bg-white rounded-lg shadow-md p-5">
      <h3 className="text-lg font-bold mb-4">Campaign Status</h3>
      
      {/* Status Banner */}
      <div className={`p-4 mb-6 rounded-md ${
        campaign.status === 'active' ? 'bg-green-50 text-green-800' :
        campaign.status === 'pending' ? 'bg-yellow-50 text-yellow-800' :
        campaign.status === 'completed' ? 'bg-blue-50 text-blue-800' :
        campaign.status === 'rejected' ? 'bg-red-50 text-red-800' :
        'bg-gray-50 text-gray-800'
      }`}>
        <div className="flex items-center">
          <div className={`rounded-full h-3 w-3 mr-2 ${
            campaign.status === 'active' ? 'bg-green-500' :
            campaign.status === 'pending' ? 'bg-yellow-500' :
            campaign.status === 'completed' ? 'bg-blue-500' :
            campaign.status === 'rejected' ? 'bg-red-500' :
            'bg-gray-500'
          }`}></div>
          <h4 className="font-bold">{getStatusName(campaign.status)}</h4>
        </div>
        
        {campaign.status === 'active' && (
          <div className="mt-1">
            {daysRemaining !== null ? (
              <p>
                {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining
              </p>
            ) : (
              <p>Campaign active</p>
            )}
          </div>
        )}
        
        {campaign.status === 'pending' && (
          <p className="mt-1">
            Your campaign is being reviewed by our team. This typically takes 1-2 business days.
          </p>
        )}
        
        {campaign.status === 'rejected' && campaign.adminNotes && (
          <p className="mt-1">Reason: {campaign.adminNotes}</p>
        )}
      </div>
      
      {/* Video Creation Progress */}
      {(campaign.status === 'active' || campaign.status === 'completed') && (
        <div className="mb-6">
          <h4 className="text-base font-medium mb-2">TikTok Video Creation</h4>
          <div className="flex justify-between text-sm mb-1">
            <span>Videos Created</span>
            <span className="font-medium">{videoProgress.created}/{videoProgress.total}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
            <div 
              className="bg-primary h-2.5 rounded-full"
              style={{ width: `${videoProgress.percentage}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500">
            {videoProgress.percentage}% complete • Budget of ${campaign.campaignDetails?.budget} creates approximately {videoProgress.total} videos
          </p>
        </div>
      )}
      
      <div className="relative pb-8">
        {/* Timeline line */}
        <div className="absolute left-5 top-0 h-full w-0.5 bg-gray-200"></div>
        
        {/* Created */}
        <div className="relative flex items-start mb-6">
          <div className={`absolute left-5 mt-1.5 -ml-2.5 h-5 w-5 rounded-full border-2 border-white ${
            campaign.status !== 'draft' ? 'bg-primary' : 'bg-primary'
          }`}></div>
          <div className="ml-10">
            <h4 className="text-base font-medium">Campaign Created</h4>
            {createdDate && (
              <>
                <p className="text-sm text-gray-500">{createdDate.relative}</p>
                <p className="text-xs text-gray-400">{createdDate.exact}</p>
              </>
            )}
          </div>
        </div>
        
        {/* Submitted */}
        <div className="relative flex items-start mb-6">
          <div className={`absolute left-5 mt-1.5 -ml-2.5 h-5 w-5 rounded-full border-2 border-white ${
            campaign.status !== 'draft' ? 'bg-primary' : 'bg-gray-300'
          }`}></div>
          <div className="ml-10">
            <h4 className={`text-base font-medium ${
              campaign.status !== 'draft' ? 'text-gray-800' : 'text-gray-500'
            }`}>Submitted for Review</h4>
            {submittedDate ? (
              <>
                <p className="text-sm text-gray-500">{submittedDate.relative}</p>
                <p className="text-xs text-gray-400">{submittedDate.exact}</p>
              </>
            ) : (
              campaign.status === 'draft' && (
                <p className="text-sm text-gray-500">Pending submission</p>
              )
            )}
          </div>
        </div>
        
        {/* Validated/Rejected */}
        <div className="relative flex items-start mb-6">
          <div className={`absolute left-5 mt-1.5 -ml-2.5 h-5 w-5 rounded-full border-2 border-white ${
            campaign.status === 'active' || campaign.status === 'completed' ? 'bg-primary' : 
            campaign.status === 'rejected' ? 'bg-error' : 'bg-gray-300'
          }`}></div>
          <div className="ml-10">
            <h4 className={`text-base font-medium ${
              campaign.status === 'active' || campaign.status === 'completed' ? 'text-gray-800' : 
              campaign.status === 'rejected' ? 'text-error' : 'text-gray-500'
            }`}>
              {campaign.status === 'rejected' ? 'Campaign Rejected' : 'Campaign Approved'}
            </h4>
            {validatedDate ? (
              <>
                <p className="text-sm text-gray-500">{validatedDate.relative}</p>
                <p className="text-xs text-gray-400">{validatedDate.exact}</p>
                {campaign.status === 'rejected' && campaign.adminNotes && (
                  <p className="mt-1 text-sm text-error">{campaign.adminNotes}</p>
                )}
              </>
            ) : (
              campaign.status === 'pending' && (
                <p className="text-sm text-gray-500">Awaiting review (1-2 business days)</p>
              )
            )}
          </div>
        </div>
        
        {/* Creator Onboarding */}
        <div className="relative flex items-start mb-6">
          <div className={`absolute left-5 mt-1.5 -ml-2.5 h-5 w-5 rounded-full border-2 border-white ${
            campaign.status === 'active' || campaign.status === 'completed' ? 'bg-primary' : 'bg-gray-300'
          }`}></div>
          <div className="ml-10">
            <h4 className={`text-base font-medium ${
              campaign.status === 'active' || campaign.status === 'completed' ? 'text-gray-800' : 'text-gray-500'
            }`}>Creator Onboarding</h4>
            {campaign.status === 'active' || campaign.status === 'completed' ? (
              <p className="text-sm text-gray-500">Content creators briefed on your song</p>
            ) : (
              <p className="text-sm text-gray-500">Pending campaign activation</p>
            )}
          </div>
        </div>
        
        {/* Video Creation */}
        <div className="relative flex items-start mb-6">
          <div className={`absolute left-5 mt-1.5 -ml-2.5 h-5 w-5 rounded-full border-2 border-white ${
            campaign.status === 'active' || campaign.status === 'completed' ? 
              videoProgress.created > 0 ? 'bg-primary' : 'bg-gray-300' 
            : 'bg-gray-300'
          }`}></div>
          <div className="ml-10">
            <h4 className={`text-base font-medium ${
              campaign.status === 'active' || campaign.status === 'completed' ? 'text-gray-800' : 'text-gray-500'
            }`}>TikTok Video Creation</h4>
            {campaign.status === 'active' || campaign.status === 'completed' ? (
              videoProgress.created > 0 ? (
                <p className="text-sm text-gray-500">
                  {videoProgress.created} of {videoProgress.total} videos created ({videoProgress.percentage}%)
                </p>
              ) : (
                <p className="text-sm text-gray-500">Videos being created by our network</p>
              )
            ) : (
              <p className="text-sm text-gray-500">Pending campaign activation</p>
            )}
          </div>
        </div>
        
        {/* Completed */}
        <div className="relative flex items-start">
          <div className={`absolute left-5 mt-1.5 -ml-2.5 h-5 w-5 rounded-full border-2 border-white ${
            campaign.status === 'completed' ? 'bg-primary' : 'bg-gray-300'
          }`}></div>
          <div className="ml-10">
            <h4 className={`text-base font-medium ${
              campaign.status === 'completed' ? 'text-gray-800' : 'text-gray-500'
            }`}>Campaign Completed</h4>
            {endDate && campaign.status === 'completed' ? (
              <>
                <p className="text-sm text-gray-500">Completed {endDate.relative}</p>
                <p className="text-xs text-gray-400">{endDate.exact}</p>
              </>
            ) : startDate && campaign.status === 'active' ? (
              <p className="text-sm text-gray-500">
                {(() => {
                  const start = safelyGetDate(campaign.startDate);
                  if (!start) return 'Expected to end when campaign completes';
                  
                  const campaignDuration = campaign.campaignDetails?.duration || 30;
                  const endDate = new Date(start.getTime() + (campaignDuration * 86400000));
                  const formattedDate = formatDate(endDate);
                  return `Expected to end ${formattedDate?.relative || 'when campaign completes'}`;
                })()}
              </p>
            ) : (
              <p className="text-sm text-gray-500">Not yet completed</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Campaign Timeline */}
      {(campaign.status === 'active' || campaign.status === 'completed') && startDate && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-base font-medium mb-3">Campaign Timeline</h4>
          
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
            <div 
              className="bg-primary h-2.5 rounded-full"
              style={{ 
                width: `${Math.min(100, calculateProgress(campaign))}%` 
              }}
            ></div>
          </div>
          
          <div className="flex justify-between text-xs text-gray-500">
            <span>{startDate.exact}</span>
            <span>
              {campaign.status === 'completed' ? 'Completed' : `${Math.min(100, calculateProgress(campaign))}% complete`}
            </span>
            <span>{endDate ? endDate.exact : 'In progress'}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to calculate campaign progress
const calculateProgress = (campaign) => {
  if (!campaign.startDate) return 0;
  
  const start = safelyGetDate(campaign.startDate);
  if (!start) return 0;
  
  let end;
  if (campaign.endDate) {
    end = safelyGetDate(campaign.endDate);
    if (!end) {
      const campaignDuration = campaign.campaignDetails?.duration || 30;
      end = new Date(start.getTime() + (campaignDuration * 86400000));
    }
  } else {
    const campaignDuration = campaign.campaignDetails?.duration || 30;
    end = new Date(start.getTime() + (campaignDuration * 86400000));
  }
  
  const now = new Date();
  const totalDuration = end.getTime() - start.getTime();
  if (totalDuration <= 0) return 0;
  
  const elapsed = now.getTime() - start.getTime();
  
  return Math.max(0, Math.min(100, Math.round((elapsed / totalDuration) * 100)));
};

// Add the safelyGetDate helper function to the global scope
function safelyGetDate(dateValue) {
  if (!dateValue) return null;
  
  try {
    // Case 1: Firebase Timestamp with toDate method
    if (dateValue.toDate && typeof dateValue.toDate === 'function') {
      return dateValue.toDate();
    }
    
    // Case 2: JavaScript Date object
    if (dateValue instanceof Date) {
      return dateValue;
    }
    
    // Case 3: String or number timestamp
    const parsedDate = new Date(dateValue);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate;
    }
    
    // If we can't parse it, log and return null
    console.warn('Unable to parse date:', dateValue);
    return null;
  } catch (error) {
    console.error('Error parsing date:', error, dateValue);
    return null;
  }
}

CampaignStatus.propTypes = {
  campaign: PropTypes.shape({
    id: PropTypes.string,
    status: PropTypes.string,
    createdAt: PropTypes.any,
    submittedAt: PropTypes.any,
    validatedAt: PropTypes.any,
    startDate: PropTypes.any,
    endDate: PropTypes.any,
    adminNotes: PropTypes.string,
    campaignDetails: PropTypes.shape({
      duration: PropTypes.number,
      budget: PropTypes.number
    })
  }).isRequired
};

export default CampaignStatus;