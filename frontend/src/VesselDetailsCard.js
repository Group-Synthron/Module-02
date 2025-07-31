import React from 'react';
import './DetailsCard.css'; // Import the shared styles

function VesselDetailsCard({ vessel }) {
  if (!vessel) {
    return null;
  }

  return (
    <div className="details-card">
      <h3>Vessel Details: {vessel.vesselName}</h3>
      <ul className="details-list">
        <li>
          <strong>Vessel ID:</strong>
          <span>{vessel.vesselId}</span>
        </li>
        <li>
          <strong>Owner ID:</strong>
          <span>{vessel.owner}</span>
        </li>
        <li>
          <strong>Registration #:</strong>
          <span>{vessel.registrationNumber}</span>
        </li>
        <li>
          <strong>Last Updated:</strong>
          <span>{new Date(vessel.lastUpdateTime).toLocaleString()}</span>
        </li>
      </ul>
    </div>
  );
}

export default VesselDetailsCard;