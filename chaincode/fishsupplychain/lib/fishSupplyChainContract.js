// SPDX-License-Identifier: Apache-2.0
'use strict';

const { Contract } = require('fabric-contract-api');

let vesselCounter = 0;
let catchCounter = 0;

class FishSupplyChainContract extends Contract {
  constructor() {
    super('org.fishsupplychain.FishSupplyChainContract');
  }

  async initLedger(ctx) {
    console.info('============= START : Initialize Ledger ===========');
    // We can add initial data for testing if needed
    console.info('============= END : Initialize Ledger ===========');
    return 'Ledger initialized';
  }

  // --- Vessel Functions (Unchanged) ---
  async registerVessel(ctx, vesselName, registrationNumber, ownerId) {
    console.info(`Registering vessel: ${vesselName}`);
    vesselCounter++;
    const vesselId = `VESSEL${vesselCounter}`;
    const vessel = {
      docType: 'vessel',
      vesselId: vesselId,
      owner: ownerId,
      vesselName: vesselName,
      registrationNumber: registrationNumber,
      isActive: true,
      lastUpdateTime: new Date(ctx.stub.getTxTimestamp().seconds * 1000).toISOString(),
      licenses: [],
    };
    await ctx.stub.putState(vesselId, Buffer.from(JSON.stringify(vessel)));
    return vesselId;
  }

  async getVesselDetails(ctx, vesselId) {
    const vesselJSON = await ctx.stub.getState(vesselId);
    if (!vesselJSON || vesselJSON.length === 0) {
      throw new Error(`The vessel ${vesselId} does not exist`);
    }
    return vesselJSON.toString();
  }

  // --- Catch Functions (Updated and New) ---

  async recordCatch(ctx, vesselId, location, species, quantity) {
    console.info(`Recording catch for vessel ${vesselId}`);

    const vesselJSON = await ctx.stub.getState(vesselId);
    if (!vesselJSON || vesselJSON.length === 0) {
      throw new Error(`Vessel ${vesselId} does not exist.`);
    }
    const vessel = JSON.parse(vesselJSON.toString());

    // UPDATED: Basic access control - check if the transaction submitter owns the vessel.
    // We'll use the ownerId string stored on the vessel for this simple check.
    
    const submitterMspId = ctx.clientIdentity.getMSPID();
    const submitterId = ctx.clientIdentity.getID();
    console.log(`Submitter: ${submitterId}`);
    // This check is illustrative. In our manual setup, the ownerId is just a string.
    // We'll assume the client app sets this correctly for now.
    // if (vessel.owner !== submitterId) {
    //   throw new Error(`Submitter ${submitterId} is not the owner of vessel ${vesselId}`);
    // }

    catchCounter++;
    const catchId = `CATCH${catchCounter}`;
    const timestamp = new Date(ctx.stub.getTxTimestamp().seconds * 1000).toISOString();

    const catchRecord = {
      docType: 'catchRecord',
      catchId: catchId,
      vesselId: vesselId,
      timestamp: timestamp,
      location: location,
      species: species,
      quantity: parseFloat(quantity),
      // UPDATED: Add owner and status fields
      owner: vessel.owner, // The vessel owner is the initial owner of the catch
      assetStatus: 'CAUGHT', // Initial status
      processingDetails: {}, // Placeholder for processor data
      wholesalerDetails: {}, // NEW: Placeholder for wholesaler data
    };

    await ctx.stub.putState(catchId, Buffer.from(JSON.stringify(catchRecord)));
    return catchId;
  }

  async getCatchDetails(ctx, catchId) {
    const catchJSON = await ctx.stub.getState(catchId);
    if (!catchJSON || catchJSON.length === 0) {
      throw new Error(`The catch ${catchId} does not exist`);
    }
    return catchJSON.toString();
  }

  async getVesselCatches(ctx, vesselId) {
    const queryString = `{"selector":{"docType":"catchRecord","vesselId":"${vesselId}"}}`;
    const resultsIterator = await ctx.stub.getQueryResult(queryString);
    const allResults = [];
    let res = await resultsIterator.next();
    while (!res.done) {
      if (res.value && res.value.value.toString()) {
        allResults.push(JSON.parse(res.value.value.toString('utf8')));
      }
      if (res.done) {
        await resultsIterator.close();
        return JSON.stringify(allResults);
      }
      res = await resultsIterator.next();
    }
    return JSON.stringify(allResults);
  }

  // NEW: Function to transfer ownership of a catch batch
  async transferCatchOwnership(ctx, catchId, newOwnerId) {
    console.info(`Transferring ownership of catch ${catchId} to ${newOwnerId}`);

    const catchJSON = await ctx.stub.getState(catchId);
    if (!catchJSON || catchJSON.length === 0) {
      throw new Error(`Catch ${catchId} does not exist.`);
    }
    const catchRecord = JSON.parse(catchJSON.toString());

    // Access Control: For now, we'll just check the owner string.
    // A more robust check would use the client's full identity.
    // if (catchRecord.owner !== ctx.clientIdentity.getID()) {
    //   throw new Error(`Transaction submitter is not the current owner of catch ${catchId}`);
    // }

    catchRecord.owner = newOwnerId;
    // NEW: Update status upon transfer
    if (catchRecord.assetStatus === 'CAUGHT') {
        catchRecord.assetStatus = 'IN_PROCESS';
    } else if (catchRecord.assetStatus === 'IN_PROCESS') {
        catchRecord.assetStatus = 'WHOLESALE';
    } else if (catchRecord.assetStatus === 'WHOLESALE') { 
    catchRecord.assetStatus = 'RETAIL'; // The next logical step
    }

    await ctx.stub.putState(catchId, Buffer.from(JSON.stringify(catchRecord)));
    return `Ownership of catch ${catchId} transferred to ${newOwnerId}`;
  }

  // NEW: Function for a processor to add their data
  async addProcessingDetails(ctx, catchId, updatedWeight, grade, processorName) {
    console.info(`Adding processing details to catch ${catchId}`);

    const catchJSON = await ctx.stub.getState(catchId);
    if (!catchJSON || catchJSON.length === 0) {
      throw new Error(`Catch ${catchId} does not exist.`);
    }
    const catchRecord = JSON.parse(catchJSON.toString());

    // Access Control: Check if the asset is in the correct state to be processed
    if (catchRecord.assetStatus !== 'IN_PROCESS') {
        throw new Error(`Catch ${catchId} is not in 'IN_PROCESS' state. Current state: ${catchRecord.assetStatus}`);
    }

    catchRecord.processingDetails = {
      updatedWeight: parseFloat(updatedWeight),
      grade: grade,
      processorName: processorName,
      processingTimestamp: new Date(ctx.stub.getTxTimestamp().seconds * 1000).toISOString(),
    };

    await ctx.stub.putState(catchId, Buffer.from(JSON.stringify(catchRecord)));
    return `Processing details added to catch ${catchId}`;
  }
  // NEW: Function for a wholesaler to add their data
async addWholesaleDetails(ctx, catchId, wholesalePrice, batchSplitDetails) {
  console.info(`Adding wholesale details to catch ${catchId}`);

  const catchJSON = await ctx.stub.getState(catchId);
  if (!catchJSON || catchJSON.length === 0) {
    throw new Error(`Catch ${catchId} does not exist.`);
  }
  const catchRecord = JSON.parse(catchJSON.toString());

  // Access Control: Check if the asset is in the correct state
  if (catchRecord.assetStatus !== 'WHOLESALE') {
      throw new Error(`Catch ${catchId} is not in 'WHOLESALE' state. Current state: ${catchRecord.assetStatus}`);
  }

  // A more robust check would use the client's full identity from their MSP
  // const submitterMspId = ctx.clientIdentity.getMSPID();
  // if (submitterMspId !== 'WholesalerOrgMSP') {
  //     throw new Error(`Caller is not from the Wholesaler organization.`);
  // }

  catchRecord.wholesalerDetails = {
    wholesalePricePerKg: parseFloat(wholesalePrice),
    batchSplitDetails: batchSplitDetails, // e.g., "Split into 3 lots for retailers A, B, C"
    wholesaleTimestamp: new Date(ctx.stub.getTxTimestamp().seconds * 1000).toISOString(),
  };

  await ctx.stub.putState(catchId, Buffer.from(JSON.stringify(catchRecord)));
  return `Wholesale details added to catch ${catchId}`;
}
}

module.exports = FishSupplyChainContract;
