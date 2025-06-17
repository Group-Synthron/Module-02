import React, { useState } from 'react';

function RecordCatch() {
  const [vesselId, setVesselId] = useState('');
  const [location, setLocation] = useState('');
  const [species, setSpecies] = useState('');
  const [quantity, setQuantity] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('Recording catch...');
    try {
      const response = await fetch('http://localhost:3001/api/catches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vesselId, location, species, quantity }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to record catch.');
      setMessage(`Success! Catch recorded with ID: ${data.catchId}`);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <div className="component">
      <h2>Record New Catch</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Vessel ID (e.g., VESSEL1)" value={vesselId} onChange={(e) => setVesselId(e.target.value)} required />
        <input type="text" placeholder="GPS Location (e.g., 25.1N 71.5W)" value={location} onChange={(e) => setLocation(e.target.value)} required />
        <input type="text" placeholder="Species (e.g., Tuna)" value={species} onChange={(e) => setSpecies(e.target.value)} required />
        <input type="number" placeholder="Quantity (kg)" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
        <button type="submit">Record Catch</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default RecordCatch;