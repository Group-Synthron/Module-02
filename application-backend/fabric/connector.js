// SPDX-License-Identifier: Apache-2.0
'use strict';

const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

// --- Global variable to hold the gateway connection
let gateway;

/**
 * Connects to the Fabric network gateway and returns a contract object.
 * If a connection is already established, it returns the existing contract.
 * @returns {Promise<{contract: import('fabric-network').Contract, gateway: import('fabric-network').Gateway}>}
 */
async function getContract() {
  // 1. Load connection profile
  const ccpPath = path.resolve(
    __dirname,
    '..',
    'connection-vesselowner.json'
  );
  const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

  // 2. Setup wallet
  const walletPath = path.join(process.cwd(), 'wallet');
  const wallet = await Wallets.newFileSystemWallet(walletPath);
  console.log(`Wallet path: ${walletPath}`);

  // 3. Check if user identity exists in wallet
  const identityLabel = 'appUser';
  const identity = await wallet.get(identityLabel);
  if (!identity) {
    console.log(
      `An identity for the user "${identityLabel}" does not exist in the wallet. Registering...`
    );
    // We need to enroll the user. For a cryptogen network, we import the pre-generated materials.
    // In a real app, you'd use fabric-ca-client to enroll a user registered with the CA.

    // Get the MSP ID from the connection profile
    const orgMspId = ccp.organizations.VesselOwnerOrg.mspid;

    // Get the user's certificate
    const certPath = path.resolve(
      __dirname,
      '..',
      '..',
      'fish-network',
      'crypto-config',
      'peerOrganizations',
      'vesselowner.fish-supply.com',
      'users',
      'Admin@vesselowner.fish-supply.com',
      'msp',
      'signcerts',
      'Admin@vesselowner.fish-supply.com-cert.pem'
    );
    const certificate = fs.readFileSync(certPath).toString();

    // Get the user's private key
    const keyDir = path.resolve(
      __dirname,
      '..',
      '..',
      'fish-network',
      'crypto-config',
      'peerOrganizations',
      'vesselowner.fish-supply.com',
      'users',
      'Admin@vesselowner.fish-supply.com',
      'msp',
      'keystore'
    );
    const keyFile = fs.readdirSync(keyDir)[0]; // Assuming only one key file
    const privateKey = fs
      .readFileSync(path.resolve(keyDir, keyFile))
      .toString();

    const x509Identity = {
      credentials: {
        certificate: certificate,
        privateKey: privateKey,
      },
      mspId: orgMspId,
      type: 'X.509',
    };
    await wallet.put(identityLabel, x509Identity);
    console.log(
      `Successfully enrolled user "${identityLabel}" and imported it into the wallet`
    );
  }

  // 4. Connect to gateway
  gateway = new Gateway();
  console.log('Connecting to gateway...');
  await gateway.connect(ccp, {
    wallet,
    identity: identityLabel,
    discovery: { enabled: true, asLocalhost: true }, // Use discovery to find peers
  });

  // 5. Get network and contract
  const network = await gateway.getNetwork('fish-channel');
  const contract = network.getContract('fishsupplychain');

  console.log('Successfully connected to Fabric network.');
  return { contract, gateway };
}

/**
 * Disconnects from the gateway.
 */
async function disconnect() {
  if (gateway) {
    console.log('Disconnecting from gateway...');
    await gateway.disconnect();
    gateway = null;
  }
}

module.exports = { getContract, disconnect };
