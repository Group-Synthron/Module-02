import React, { useState } from 'react';

function CatchManager() {
  const [catchId, setCatchId] = useState('');
  const [queryResult, setQueryResult] = useState(null);
  const [message, setMessage] = useState('');

  // State for transfer form
  const [newOwner, setNewOwner] = useState('');

  // State for processing form
  const [updatedWeight, setUpdatedWeight] = useState('');
  const [grade, setGrade] = useState('');
  const [processorName, setProcessorName] = useState('');

  // State for wholesaler form
  const [wholesalePrice, setWholesalePrice] = useState('');
  const [batchSplitDetails, setBatchSplitDetails] = useState('');

  const handleQuery = async (event) => {
    event.preventDefault();
    setMessage(`Querying for catch ${catchId}...`);
    setQueryResult(null);
    try {
      const response = await fetch(`http://localhost:3001/api/catches/${catchId}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Catch not found.');
      setQueryResult(data);
      setMessage('Query successful!');
    } catch (error) {
      setQueryResult(null);
      setMessage(`Error: ${error.message}`);
    }
  };

  const handleTransfer = async (event) => {
    event.preventDefault();
    setMessage(`Transferring catch ${catchId} to ${newOwner}...`);
    try {
        const response = await fetch(`http://localhost:3001/api/catches/${catchId}/transfer`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newOwnerId: newOwner }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to transfer.');
        setMessage(data.message);
        // Refresh data after transfer
        handleQuery(event);
    } catch (error) {
        setMessage(`Error: ${error.message}`);
    }
  };

  const handleProcessing = async (event) => {
    event.preventDefault();
    setMessage(`Adding processing details for catch ${catchId}...`);
    try {
        const response = await fetch(`http://localhost:3001/api/catches/${catchId}/process`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ updatedWeight, grade, processorName }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to process.');
        setMessage(data.message);
        // Refresh data after processing
        handleQuery(event);
    } catch (error) {
        setMessage(`Error: ${error.message}`);
    }
  };

  const handleWholesale = async (event) => {
    event.preventDefault();
    setMessage(`Adding wholesale details for catch ${catchId}...`);
    try {
        const response = await fetch(`http://localhost:3001/api/catches/${catchId}/wholesale`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ wholesalePrice, batchSplitDetails }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to add wholesale details.');
        setMessage(data.message);
        // Refresh data after action
        handleQuery(event);
    } catch (error) {
        setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <div className="component">
      <h2>Manage Catch Batch</h2>
      <form onSubmit={handleQuery}>
        <input type="text" placeholder="Enter Catch ID (e.g., CATCH1)" value={catchId} onChange={(e) => setCatchId(e.target.value)} required />
        <button type="submit">Query Catch</button>
      </form>

      {message && <p>{message}</p>}

      {queryResult && (
        <div>
          <h3>Catch Details:</h3>
          <pre>{JSON.stringify(queryResult, null, 2)}</pre>

          {/* Transfer Form */}
          <form onSubmit={handleTransfer}>
            <h4>Transfer Ownership</h4>
            <input type="text" placeholder="New Owner ID (e.g., ProcessorOrgMSP)" value={newOwner} onChange={(e) => setNewOwner(e.target.value)} required />
            <button type="submit">Transfer</button>
          </form>

          {/* Processing Form */}
          <form onSubmit={handleProcessing}>
            <h4>Add Processing Details</h4>
            <input type="number" placeholder="Updated Weight (kg)" value={updatedWeight} onChange={(e) => setUpdatedWeight(e.target.value)} required />
            <input type="text" placeholder="Grade (e.g., A-Grade)" value={grade} onChange={(e) => setGrade(e.target.value)} required />
            <input type="text" placeholder="Processor Name (e.g., Global Fish Inc.)" value={processorName} onChange={(e) => setProcessorName(e.target.value)} required />
            <button type="submit">Add Details</button>
          </form>

          {/* Wholesaler Form */}
          <form onSubmit={handleWholesale}>
            <h4>Add Wholesale Details</h4>
            <input type="number" placeholder="Wholesale Price per Kg" value={wholesalePrice} onChange={(e) => setWholesalePrice(e.target.value)} required />
            <input type="text" placeholder="Batch Split Details" value={batchSplitDetails} onChange={(e) => setBatchSplitDetails(e.target.value)} required />
            <button type="submit">Add Details</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default CatchManager;