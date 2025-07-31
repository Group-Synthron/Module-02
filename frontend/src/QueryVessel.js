import React, { useState } from 'react';
import VesselDetailsCard from './VesselDetailsCard'; // Import the new component
import './DetailsCard.css'; // Import the CSS

function QueryVessel() {
  const [vesselId, setVesselId] = useState('');
  const [queryResult, setQueryResult] = useState(null);
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage(`Querying for vessel ${vesselId}...`);
    setQueryResult(null);

    try {
      const response = await fetch(
        `http://localhost:3001/api/vessels/${vesselId}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Vessel not found.');
      }

      setQueryResult(data);
      setMessage('Query successful!');
    } catch (error) {
      setQueryResult(null);
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <div className="component">
      <h2>Query Vessel Details</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter Vessel ID (e.g., VESSEL1)"
          value={vesselId}
          onChange={(e) => setVesselId(e.target.value)}
          required
        />
        <button type="submit">Query Vessel</button>
      </form>
      {message && <p>{message}</p>}
      {queryResult && (
        // Replace the <pre> tag with the new card component
        <VesselDetailsCard vessel={queryResult} />
      )}
    </div>
  );
}

export default QueryVessel;