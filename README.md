# Solid TypeScript SDK

This SDK provides tools to interact with the **Solid** attestation management service on the Solana blockchain, as well as the Solid backend API. It enables developers to fetch and decode attestations, schemas, and interact with the Solid program and backend from TypeScript/JavaScript applications.

## Features

- Fetch and decode attestation and schema accounts from Solana
- Find Program Derived Addresses (PDAs) for schemas and attestations
- Decode attestation data according to schema layouts
- (Planned) Interact with the Solid backend API for additional features

## Installation

```bash
npm install solid-sdk
# or
yarn add solid-sdk
```

## Usage

```ts
import { SolidProgramSdk } from 'solid-sdk';
import { Connection, PublicKey } from '@solana/web3.js';

const connection = new Connection('https://api.mainnet-beta.solana.com');
const programId = new PublicKey('YOUR_SOLID_PROGRAM_ID');
const sdk = new SolidProgramSdk(connection, programId);

// Fetch a schema
const schemaAddress = new PublicKey('SCHEMA_ADDRESS');
const schema = await sdk.fetchSchema(schemaAddress);
console.log('Schema:', schema);

// Fetch an attestation
const attestationAddress = new PublicKey('ATTESTATION_ADDRESS');
const attestation = await sdk.fetchAttestation(attestationAddress);
console.log('Attestation:', attestation);

// --- Fetch attestation address from Solid backend API and then fetch attestation info from Solana program ---

// Example: Fetch attestation address from backend API
async function fetchAttestationAddressFromApi(
  apiUrl: string,
  params: Record<string, any>,
): Promise<string> {
  const response = await fetch(`${apiUrl}/attestation-address`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!response.ok)
    throw new Error('Failed to fetch attestation address from API');
  const data = await response.json();
  return data.attestationAddress; // Should be a base58 string
}

// Usage: Fetch attestation address from API, then fetch attestation info from Solana
const apiUrl = 'https://api.solid.example.com';
const params = {
  // Fill in the required parameters for your API
};

// Step 1: Fetch the attestation address from the backend API
const attestationAddressStr = await fetchAttestationAddressFromApi(
  apiUrl,
  params,
);

// Step 2: Use the fetched address to get attestation info from the Solana program
const attestationAddressFromApi = new PublicKey(attestationAddressStr);
const attestationInfo = await sdk.fetchAttestation(attestationAddressFromApi);
console.log('Attestation info from program:', attestationInfo);
```

## Documentation

- See the source code for detailed method documentation and usage examples.
- More comprehensive documentation and backend API usage coming soon.

## License

MIT
