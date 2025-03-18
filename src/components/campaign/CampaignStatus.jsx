import React from 'react';
import PropTypes from 'prop-types';
import { formatDistanceToNow, format } from 'date-fns';

/**
 * Campaign status component - displays timeline of campaign events
 * @param {Object} props - Component props
 */
const CampaignStatus = ({ campaign }) => {
  // Early return if no campaign data
  if (!campaign) {
    return null;
  }

  // Format date for display
  const formatDate = (timestamp) => {
    if (!timestamp) return null;
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return {
      relative: formatDistanceToNow(date, { addSuffix: true }),
      exact: format(date, 'PPP') // e.g., April 29, 2021
    };
  };

  // Get status name
  const getStatusName = (status) => {
    switch (status) {
      case 'draft': return 'Draft Created';
      case 'pending': return 'Submitted for Approval';
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

  return (
    <div className="bg-white rounded-lg shadow-md p-5">
      <h3 className="text-lg font-bold mb-4">Campaign Status</h3>
      
      <div className="relative pb-8">
        {/* Timeline line */}
        <div className="absolute left-5 top-0 h-full w-0.5 bg-gray-200"></div>
        
        {/* Created */}
        <div className="relative flex items-start mb-6">
          <div className={`absolute left-5 mt-1.5 -ml-2.5 h-5 w-5 rounded-full border-2 border-white bg-primary`}></div>
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
        
        {/* Active */}
        <div className="relative flex items-start mb-6">
          <div className={`absolute left-5 mt-1.5 -ml-2.5 h-5 w-5 rounded-full border-2 border-white ${
            campaign.status === 'active' || campaign.status === 'completed' ? 'bg-primary' : 'bg-gray-300'
          }`}></div>
          <div className="ml-10">
            <h4 className={`text-base font-medium ${
              campaign.status === 'active' || campaign.status === 'completed' ? 'text-gray-800' : 'text-gray-500'
            }`}>Campaign Active</h4>
            {startDate ? (
              <>
                <p className="text-sm text-gray-500">Started {startDate.relative}</p>
                <p className="text-xs text-gray-400">{startDate.exact}</p>
              </>
            ) : (
              <p className="text-sm text-gray-500">Not yet active</p>
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
                Expected to end {formatDate(new Date(startDate.toDate().getTime() + campaign.campaignDetails.duration * 86400000)).relative}
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
  
  const start = campaign.startDate.toDate ? campaign.startDate.toDate() : new Date(campaign.startDate);
  const end = campaign.endDate 
    ? campaign.endDate.toDate ? campaign.endDate.toDate() : new Date(campaign.endDate) 
    : new Date(start.getTime() + (campaign.campaignDetails.duration * 86400000));
  
  const now = new Date();
  const totalDuration = end.getTime() - start.getTime();
  const elapsed = now.getTime() - start.getTime();
  
  return Math.max(0, Math.min(100, Math.round((elapsed / totalDuration) * 100)));
};

CampaignStatus.propTypes = {
  campaign: PropTypes.shape({
    status: PropTypes.string,
    createdAt: PropTypes.any,
    submittedAt: PropTypes.any,
    validatedAt: PropTypes.any,
    startDate: PropTypes.any,
    endDate: PropTypes.any,
    adminNotes: PropTypes.string,
    campaignDetails: PropTypes.shape({
      duration: PropTypes.number
    })
  }).isRequired
};

export default CampaignStatus;