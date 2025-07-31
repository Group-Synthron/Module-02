import React from 'react';
import './DetailsCard.css'; // Import the shared styles

// Helper function to get the right CSS class for the status
const getStatusClass = (status) => {
  switch (status) {
    case 'CAUGHT':
      return 'status-caught';
    case 'IN_PROCESS':
      return 'status-in_process';
    case 'WHOLESALE':
      return 'status-wholesale';
    case 'RETAIL':
      return 'status-retail';
    default:
      return 'status-unknown';
  }
};

function CatchDetailsCard({ catchData }) {
  if (!catchData) {
    return null;
  }

  return (
    <div className="details-card">
      <h3>Catch Details: {catchData.catchId}</h3>

      <h4>Core Information</h4>
      <ul className="details-list">
        <li>
          <strong>Status:</strong>
          <span className={`status-badge ${getStatusClass(catchData.assetStatus)}`}>
            {catchData.assetStatus.replace('_', ' ')}
          </span>
        </li>
        <li>
          <strong>Current Owner:</strong>
          <span>{catchData.owner}</span>
        </li>
      </ul>

      <h4>Origin</h4>
      <ul className="details-list">
        <li>
          <strong>Vessel ID:</strong>
          <span>{catchData.vesselId}</span>
        </li>
        <li>
          <strong>Species:</strong>
          <span>{catchData.species}</span>
        </li>
        <li>
          <strong>Initial Quantity:</strong>
          <span>{catchData.quantity} kg</span>
        </li>
        <li>
          <strong>Location:</strong>
          <span>{catchData.location}</span>
        </li>
        <li>
          <strong>Caught On:</strong>
          <span>{new Date(catchData.timestamp).toLocaleString()}</span>
        </li>
      </ul>

      {/* Conditionally render Processing Details */}
      {catchData.processingDetails && catchData.processingDetails.processorName && (
        <>
          <h4>Processing Details</h4>
          <ul className="details-list">
            <li>
              <strong>Processor:</strong>
              <span>{catchData.processingDetails.processorName}</span>
            </li>
            <li>
              <strong>Updated Weight:</strong>
              <span>{catchData.processingDetails.updatedWeight} kg</span>
            </li>
            <li>
              <strong>Grade:</strong>
              <span>{catchData.processingDetails.grade}</span>
            </li>
            <li>
              <strong>Processed On:</strong>
              <span>
                {new Date(
                  catchData.processingDetails.processingTimestamp
                ).toLocaleString()}
              </span>
            </li>
          </ul>
        </>
      )}

      {/* Conditionally render Wholesale Details */}
      {catchData.wholesalerDetails &&
        catchData.wholesalerDetails.wholesalePricePerKg && (
          <>
            <h4>Wholesale Details</h4>
            <ul className="details-list">
              <li>
                <strong>Price / kg:</strong>
                <span>${catchData.wholesalerDetails.wholesalePricePerKg}</span>
              </li>
              <li>
                <strong>Split Details:</strong>
                <span>{catchData.wholesalerDetails.batchSplitDetails}</span>
              </li>
              <li>
                <strong>Logged On:</strong>
                <span>
                  {new Date(
                    catchData.wholesalerDetails.wholesaleTimestamp
                  ).toLocaleString()}
                </span>
              </li>
            </ul>
          </>
        )}
    </div>
  );
}

export default CatchDetailsCard;