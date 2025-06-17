const express = require('express');
const cors = require('cors');
const { getContract, disconnect } = require('./fabric/connector');

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- API Routes ---

// Test route
app.get('/api/test', (req, res) => {
  console.log('GET /api/test received');
  res.json({ message: 'Hello from the Fish Supply Chain API!' });
});

/**
 * GET /api/vessels/:vesselId
 * Retrieves vessel details from the blockchain.
 */
app.get('/api/vessels/:vesselId', async (req, res) => {
  const { vesselId } = req.params;
  console.log(`GET /api/vessels/${vesselId} received`);

  let gateway;
  try {
    const { contract } = await getContract();
    console.log(`Querying chaincode for vessel: ${vesselId}`);

    // evaluateTransaction is for read-only queries
    const result = await contract.evaluateTransaction(
      'getVesselDetails',
      vesselId
    );

    console.log(`Query successful. Result: ${result.toString()}`);
    res.json(JSON.parse(result.toString()));
  } catch (error) {
    console.error(`Failed to evaluate transaction: ${error}`);
    res.status(500).json({ error: error.message });
  } finally {
    // Disconnect from the gateway
    if (gateway) {
      await disconnect();
    }
  }
});

/**
 * POST /api/vessels
 * Registers a new vessel on the blockchain.
 * Expects a JSON body like: { "vesselName": "...", "registrationNumber": "...", "ownerId": "..." }
 */
app.post('/api/vessels', async (req, res) => {
  const { vesselName, registrationNumber, ownerId } = req.body;
  console.log(`POST /api/vessels received with body:`, req.body);

  if (!vesselName || !registrationNumber || !ownerId) {
    return res
      .status(400)
      .json({ error: 'Missing required fields in request body.' });
  }

  let gateway;
  try {
    const { contract } = await getContract();
    console.log('Submitting transaction to register vessel...');

    // submitTransaction is for transactions that write to the ledger
    const result = await contract.submitTransaction(
      'registerVessel',
      vesselName,
      registrationNumber,
      ownerId
    );

    const vesselId = result.toString();
    console.log(`Transaction successful. New vessel ID: ${vesselId}`);
    res.status(201).json({
      status: 'success',
      message: `Vessel ${vesselId} registered successfully.`,
      vesselId: vesselId,
    });
  } catch (error) {
    console.error(`Failed to submit transaction: ${error}`);
    res.status(500).json({ error: error.message });
  } finally {
    // Disconnect from the gateway
    if (gateway) {
      await disconnect();
    }
  }
});

// --- Add more routes for recordCatch, getCatchDetails etc. here ---
// --- Add these new routes to your existing server.js ---

/**
 * POST /api/catches
 * Records a new catch for a vessel.
 * Expects body: { "vesselId": "...", "location": "...", "species": "...", "quantity": ... }
 */
app.post('/api/catches', async (req, res) => {
  const { vesselId, location, species, quantity } = req.body;
  console.log(`POST /api/catches received with body:`, req.body);

  if (!vesselId || !location || !species || !quantity) {
    return res
      .status(400)
      .json({ error: 'Missing required fields for recording a catch.' });
  }

  try {
    const { contract } = await getContract();
    console.log('Submitting transaction to record catch...');

    const result = await contract.submitTransaction(
      'recordCatch',
      vesselId,
      location,
      species,
      quantity.toString() // Pass quantity as a string
    );

    const catchId = result.toString();
    console.log(`Transaction successful. New catch ID: ${catchId}`);
    res.status(201).json({
      status: 'success',
      message: `Catch ${catchId} recorded successfully.`,
      catchId: catchId,
    });
  } catch (error) {
    console.error(`Failed to submit transaction: ${error}`);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/catches/:catchId
 * Retrieves details for a specific catch.
 */
app.get('/api/catches/:catchId', async (req, res) => {
  const { catchId } = req.params;
  console.log(`GET /api/catches/${catchId} received`);

  try {
    const { contract } = await getContract();
    const result = await contract.evaluateTransaction('getCatchDetails', catchId);
    res.json(JSON.parse(result.toString()));
  } catch (error) {
    console.error(`Failed to evaluate transaction: ${error}`);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/vessels/:vesselId/catches
 * Retrieves all catches for a specific vessel.
 */
app.get('/api/vessels/:vesselId/catches', async (req, res) => {
    const { vesselId } = req.params;
    console.log(`GET /api/vessels/${vesselId}/catches received`);

    try {
        const { contract } = await getContract();
        const result = await contract.evaluateTransaction('getVesselCatches', vesselId);
        res.json(JSON.parse(result.toString()));
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        res.status(500).json({ error: error.message });
    }
});

/**
 * PUT /api/catches/:catchId/transfer
 * Transfers ownership of a catch batch.
 * Expects body: { "newOwnerId": "..." }
 */
app.put('/api/catches/:catchId/transfer', async (req, res) => {
    const { catchId } = req.params;
    const { newOwnerId } = req.body;
    console.log(`PUT /api/catches/${catchId}/transfer received for new owner: ${newOwnerId}`);

    if (!newOwnerId) {
        return res.status(400).json({ error: 'newOwnerId is required.' });
    }

    try {
        const { contract } = await getContract();
        const result = await contract.submitTransaction('transferCatchOwnership', catchId, newOwnerId);
        res.json({ status: 'success', message: result.toString() });
    } catch (error) {
        console.error(`Failed to transfer ownership: ${error}`);
        res.status(500).json({ error: error.message });
    }
});

/**
 * PUT /api/catches/:catchId/process
 * Adds processing details to a catch batch.
 * Expects body: { "updatedWeight": ..., "grade": "...", "processorName": "..." }
 */
app.put('/api/catches/:catchId/process', async (req, res) => {
    const { catchId } = req.params;
    const { updatedWeight, grade, processorName } = req.body;
    console.log(`PUT /api/catches/${catchId}/process received with body:`, req.body);

    if (!updatedWeight || !grade || !processorName) {
        return res.status(400).json({ error: 'Missing required processing fields.' });
    }

    try {
        const { contract } = await getContract();
        const result = await contract.submitTransaction('addProcessingDetails', catchId, updatedWeight.toString(), grade, processorName);
        res.json({ status: 'success', message: result.toString() });
    } catch (error) {
        console.error(`Failed to add processing details: ${error}`);
        res.status(500).json({ error: error.message });
    }
});

/**
 * PUT /api/catches/:catchId/wholesale
 * Adds wholesale details to a catch batch.
 * Expects body: { "wholesalePrice": ..., "batchSplitDetails": "..." }
 */
app.put('/api/catches/:catchId/wholesale', async (req, res) => {
    const { catchId } = req.params;
    const { wholesalePrice, batchSplitDetails } = req.body;
    console.log(`PUT /api/catches/${catchId}/wholesale received with body:`, req.body);

    if (!wholesalePrice || !batchSplitDetails) {
        return res.status(400).json({ error: 'Missing required wholesale fields.' });
    }

    try {
        const { contract } = await getContract();
        const result = await contract.submitTransaction('addWholesaleDetails', catchId, wholesalePrice.toString(), batchSplitDetails);
        res.json({ status: 'success', message: result.toString() });
    } catch (error) {
        console.error(`Failed to add wholesale details: ${error}`);
        res.status(500).json({ error: error.message });
    }
});
// Start the server
const server = app.listen(port, () => {
  console.log(
    `Fish Supply Chain API server listening at http://localhost:${port}`
  );
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Received SIGINT. Shutting down gracefully...');
  await disconnect();
  server.close(() => {
    console.log('Server has been shut down.');
    process.exit(0);
  });
});
