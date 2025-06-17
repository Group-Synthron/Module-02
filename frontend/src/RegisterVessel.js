import React, { useState } from 'react';

function RegisterVessel() {
  const [vesselName, setVesselName] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [ownerId, setOwnerId] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('Registering vessel...');

    try {
      const response = await fetch('http://localhost:3001/api/vessels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vesselName: vesselName,
          registrationNumber: regNumber,
          ownerId: ownerId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to register vessel.');
      }

      setMessage(`Success! Vessel registered with ID: ${data.vesselId}`);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <div className="component">
      <h2>Register New Vessel</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Vessel Name (e.g., Sea Eagle)"
          value={vesselName}
          onChange={(e) => setVesselName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Registration Number (e.g., REG-SE-789)"
          value={regNumber}
          onChange={(e) => setRegNumber(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Owner ID (e.g., ownerCharlie)"
          value={ownerId}
          onChange={(e) => setOwnerId(e.target.value)}
          required
        />
        <button type="submit">Register Vessel</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default RegisterVessel;