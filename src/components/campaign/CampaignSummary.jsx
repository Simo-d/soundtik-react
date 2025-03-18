import React from 'react';
import PropTypes from 'prop-types';
import { formatDistanceToNow } from 'date-fns';
import Button from '../common/Button';

/**
 * Campaign summary component - displays campaign details on dashboard
 * @param {Object} props - Component props
 */
const CampaignSummary = ({ campaign, onViewDetails }) => {
  // Early return if no campaign data
  if (!campaign) {
    return null;
  }

  // Format campaign creation date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Not available';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  // Get campaign status label and color
  const getStatusInfo = (status) => {
    switch (status) {
      case 'draft':
        return { label: 'Draft', color: 'bg-gray-200 text-gray-800' };
      case 'pending':
        return { label: 'Pending Approval', color: 'bg-yellow-100 text-yellow-800' };
      case 'active':
        return { label: 'Active', color: 'bg-green-100 text-green-800' };
      case 'completed':
        return { label: 'Completed', color: 'bg-blue-100 text-blue-800' };
      case 'rejected':
        return { label: 'Rejected', color: 'bg-red-100 text-red-800' };
      default:
        return { label: 'Unknown', color: 'bg-gray-200 text-gray-800' };
    }
  };

  // Format budget as currency
  const formatBudget = (budget) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(budget);
  };

  // Get status information
  const statusInfo = getStatusInfo(campaign.status);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              {campaign.songDetails?.title || 'Untitled Campaign'}
            </h3>
            <p className="text-gray-600">
              {campaign.artistDetails?.name || 'Unknown Artist'}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500">Created</p>
            <p className="font-medium">{formatDate(campaign.createdAt)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Budget</p>
            <p className="font-medium">{formatBudget(campaign.campaignDetails?.budget || 0)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Duration</p>
            <p className="font-medium">{campaign.campaignDetails?.duration || 0} days</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Genre</p>
            <p className="font-medium">{campaign.songDetails?.genre || 'Not specified'}</p>
          </div>
        </div>

        {campaign.status === 'rejected' && campaign.adminNotes && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
            <p className="font-medium">Rejection reason:</p>
            <p>{campaign.adminNotes}</p>
          </div>
        )}
        
        {campaign.status === 'pending' && (
          <div className="mb-4 p-3 bg-yellow-50 text-yellow-700 rounded-md text-sm">
            <p>Your campaign is currently under review. This usually takes 1-2 business days.</p>
          </div>
        )}

        <Button 
          variant="primary" 
          onClick={() => onViewDetails(campaign.id)}
          fullWidth
        >
          View Details
        </Button>
      </div>
    </div>
  );
};

CampaignSummary.propTypes = {
  campaign: PropTypes.shape({
    id: PropTypes.string.isRequired,
    status: PropTypes.string,
    createdAt: PropTypes.any,
    adminNotes: PropTypes.string,
    songDetails: PropTypes.shape({
      title: PropTypes.string,
      genre: PropTypes.string
    }),
    artistDetails: PropTypes.shape({
      name: PropTypes.string
    }),
    campaignDetails: PropTypes.shape({
      budget: PropTypes.number,
      duration: PropTypes.number
    })
  }).isRequired,
  onViewDetails: PropTypes.func.isRequired
};

export default CampaignSummary;